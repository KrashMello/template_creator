import { lookup } from 'node:dns/promises'

/**
 * Solo se permite salir a la red pública. El HTML del PDF trae URLs que elige
 * el cliente: sin esto, un `<script>fetch('http://169.254.169.254/...')</script>`
 * convierte la función en un proxy hacia la red interna y el PDF devuelto
 * traería la respuesta.
 *
 * `shortcut: se resuelve el DNS y se miran las IPs, pero Chromium vuelve a
 * resolver para conectar (ventana de DNS rebinding). Suficiente mientras el
 * contenido lo genere un usuario de la propia app.`
 *
 * Vive fuera de `pdf.post.ts` para poder probarlo sin levantar h3 ni Chromium
 * (`scripts/check-url-guard.mjs`).
 */
const PRIVATE_V4 = [
  /^0\./,
  /^10\./,
  /^127\./,
  /^169\.254\./, // link-local + metadata de las nubes
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./, // CGNAT
]

const BLOCKED_HOSTS = ['.localhost', '.local', '.internal', '.home.arpa']

export function isPrivateAddress(ip: string): boolean {
  if (ip.includes(':')) {
    const v6 = ip.toLowerCase()
    if (v6 === '::' || v6 === '::1') return true
    // El parser de URL reescribe toda IPv4 embebida en hex (::ffff:7f00:1), así
    // que se rechaza la forma entera en vez de intentar parsearla.
    if (v6.startsWith('::ffff:')) return true // IPv4 mapeada (::ffff:0:0/96)
    if (v6.startsWith('64:ff9b:')) return true // NAT64 (64:ff9b::/96)
    if (/^f[cd][0-9a-f]{2}:/.test(v6)) return true // fc00::/7 (ULA)
    if (/^fe[89ab][0-9a-f]:/.test(v6)) return true // fe80::/10 (link-local)
    return false
  }
  return PRIVATE_V4.some((re) => re.test(ip))
}

export async function isAllowedUrl(raw: string): Promise<boolean> {
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return false
  }
  // Recursos inline que el propio Chromium genera al pintar.
  if (url.protocol === 'data:' || url.protocol === 'blob:' || url.protocol === 'about:') return true
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return false

  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, '')
  if (host === 'localhost' || BLOCKED_HOSTS.some((suffix) => host.endsWith(suffix))) return false
  if (host.includes(':') || /^\d+\.\d+\.\d+\.\d+$/.test(host)) return !isPrivateAddress(host)

  try {
    const addresses = await lookup(host, { all: true })
    return addresses.length > 0 && addresses.every((entry) => !isPrivateAddress(entry.address))
  } catch {
    return false
  }
}
