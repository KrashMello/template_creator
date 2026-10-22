import { defineEventHandler, readBody, createError, getRequestHeader } from 'h3'
import { Client } from 'pg'
import { lookup } from 'node:dns/promises'
import { isPrivateAddress } from '../../utils/allow-public-url'

/**
 * Cliente Postgres genérico: el navegador manda host/usuario/contraseña y aquí
 * solo se ejecuta una sentencia de lectura. Es un endpoint público, así que los
 * límites de abajo son lo único que separa esto de un proxy abierto.
 */
const MAX_ROWS = 1000
const MAX_QUERY_CHARS = 20_000
const MAX_BODY_CHARS = 32_000
const RATE_WINDOW_MS = 60_000
const RATE_MAX_REQUESTS = 10
const MAX_CONCURRENT = 3

const rateHits = new Map<string, { count: number; reset: number }>()
let active = 0

function bad(message: string, statusCode = 400) {
  return createError({ statusCode, statusMessage: 'DATA_SQL_ERROR', data: { message } })
}

function isRateLimited(ip: string) {
  const now = Date.now()
  for (const [key, hit] of rateHits) if (hit.reset <= now) rateHits.delete(key)
  const hit = rateHits.get(ip) ?? { count: 0, reset: now + RATE_WINDOW_MS }
  hit.count++
  rateHits.set(ip, hit)
  return hit.count > RATE_MAX_REQUESTS
}

/**
 * En producción solo se sale a hosts públicos: si no, el endpoint sirve para
 * escanear la red interna o alcanzar el metadata de la nube. En local se
 * permite localhost/LAN, que es el caso normal de desarrollo.
 *
 * `shortcut: se resuelve el DNS y se miran las IPs, pero `pg` vuelve a resolver
 * al conectar (ventana de DNS rebinding); misma limitación que allow-public-url.`
 */
async function assertAllowedHost(host: string) {
  if (process.env.NODE_ENV !== 'production') return
  const value = host.toLowerCase().replace(/^\[|\]$/g, '')
  if (value.includes(':') || /^\d+\.\d+\.\d+\.\d+$/.test(value)) {
    if (isPrivateAddress(value)) throw bad('Blocked host')
    return
  }
  if (
    value === 'localhost' ||
    ['.localhost', '.local', '.internal', '.home.arpa'].some((suffix) => value.endsWith(suffix))
  ) {
    throw bad('Blocked host')
  }
  const addresses = await lookup(value, { all: true }).catch(() => [])
  if (!addresses.length || addresses.some((entry) => isPrivateAddress(entry.address))) {
    throw bad('Blocked host')
  }
}

export default defineEventHandler(async (event) => {
  // Apagado por defecto al desplegar: encenderlo convierte la demo en un
  // cliente SQL abierto para cualquiera que tenga la URL.
  if (process.env.NODE_ENV === 'production' && process.env.DATA_SQL_ENABLED !== '1') {
    throw bad('SQL source disabled on this deployment (set DATA_SQL_ENABLED=1)', 501)
  }

  const contentLength = Number(getRequestHeader(event, 'content-length') || 0)
  if (contentLength > MAX_BODY_CHARS * 4) throw bad('Payload too large', 413)

  const ip = getRequestHeader(event, 'x-forwarded-for')?.split(',').pop()?.trim() || 'unknown'
  if (isRateLimited(ip)) throw bad('Too many requests', 429)

  const body = await readBody<any>(event).catch(() => null)
  if (!body || typeof body !== 'object') throw bad('Missing payload')

  const host = typeof body.host === 'string' ? body.host.trim() : ''
  const user = typeof body.user === 'string' ? body.user.trim() : ''
  const database = typeof body.database === 'string' ? body.database.trim() : ''
  const password = typeof body.password === 'string' ? body.password : ''
  const query = typeof body.query === 'string' ? body.query.trim() : ''
  const port = Number(body.port)

  if (!host || host.length > 255 || /\s/.test(host)) throw bad('Invalid host')
  if (!user || !database) throw bad('Missing user or database')
  if (!query || query.length > MAX_QUERY_CHARS) {
    throw bad(`Query must be 1..${MAX_QUERY_CHARS} chars`)
  }
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw bad('Invalid port')
  if (JSON.stringify(body).length > MAX_BODY_CHARS) throw bad('Payload too large', 413)

  await assertAllowedHost(host)

  if (active >= MAX_CONCURRENT) throw bad('Too many concurrent connections', 503)
  active++

  const client = new Client({
    host,
    port,
    user,
    database,
    password,
    ssl: body.ssl ? true : undefined,
    application_name: 'template-creator',
    connectionTimeoutMillis: 8_000,
    statement_timeout: 10_000,
    query_timeout: 12_000,
  })

  try {
    await client.connect()
    // `queryMode: 'extended'` obliga al protocolo extendido, que solo admite una
    // sentencia por llamada: así `select ...; drop ...` no se ejecuta. Va en un
    // objeto aparte porque @types/pg no declara esa opción.
    const statement = { text: query, values: [] as unknown[], queryMode: "extended" }
    const result = await client.query(statement)
    const rows = result.rows ?? []
    return { rows: rows.slice(0, MAX_ROWS), truncated: rows.length > MAX_ROWS, limit: MAX_ROWS }
  } catch (error: any) {
    throw bad(String(error?.message || 'Postgres error').slice(0, 500), 422)
  } finally {
    await client.end().catch(() => {})
    active--
  }
})
