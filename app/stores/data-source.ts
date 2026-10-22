/**
 * Adaptador de fuentes de datos: convierte el payload crudo de un REST o de
 * Postgres en el objeto que consume Handlebars (`store.data`).
 *
 * Mapeo declarativo (JSON):
 *   "company.name": "rows[0].customer_name"            → ruta del origen
 *   "table.cols": ["Concepto", "Importe"]              → valor fijo
 *   "table.rows": { "from": "rows", "select": [...] }  → matriz fila/columna
 * Un mapeo vacío deja el payload tal cual.
 */
export type DataMap = Record<string, unknown>

export type AdaptedData = {
  data: Record<string, any>
  /** Rutas del mapeo cuyo origen no existe en el payload. */
  missing: string[]
}

const BLOCKED_KEYS = new Set(["__proto__", "constructor", "prototype"])

/** Ruta con puntos y corchetes: `rows[0].customer.name`. */
export function resolvePath(payload: unknown, path: string): unknown {
  let current: any = payload
  for (const segment of path.split(".")) {
    const match = /^([^[\]]*)((?:\[\d+\])*)$/.exec(segment)
    if (!match) return undefined
    if (match[1]) {
      if (current == null) return undefined
      current = current[match[1]]
    }
    for (const index of match[2].matchAll(/\[(\d+)\]/g)) {
      if (!Array.isArray(current)) return undefined
      current = current[Number(index[1])]
    }
  }
  return current
}

/** `pg` devuelve `Date`; Handlebars imprimiría el objeto completo. */
function normalize(value: unknown) {
  return value instanceof Date ? value.toISOString().slice(0, 10) : value
}

function isMatrixSpec(value: unknown): value is { from: string; select?: string[] } {
  return (
    !!value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    typeof (value as { from?: unknown }).from === "string"
  )
}

function setPath(target: Record<string, any>, path: string, value: unknown) {
  const keys = path.split(".").filter(Boolean)
  if (!keys.length || keys.some((key) => BLOCKED_KEYS.has(key))) return
  let node = target
  for (const key of keys.slice(0, -1)) {
    if (!node[key] || typeof node[key] !== "object") node[key] = {}
    node = node[key]
  }
  node[keys[keys.length - 1]] = value
}

export function adaptData(payload: unknown, map?: DataMap | null): AdaptedData {
  if (!map || !Object.keys(map).length) {
    return { data: (payload ?? {}) as Record<string, any>, missing: [] }
  }

  const data: Record<string, any> = {}
  const missing = new Set<string>()

  for (const [target, spec] of Object.entries(map)) {
    if (isMatrixSpec(spec)) {
      const rows = resolvePath(payload, spec.from)
      if (!Array.isArray(rows)) {
        missing.add(spec.from)
        setPath(data, target, [])
        continue
      }
      const select = Array.isArray(spec.select) ? spec.select : []
      setPath(
        data,
        target,
        rows.map((row) => select.map((key) => normalize(resolvePath(row, key)))),
      )
      continue
    }

    if (typeof spec === "string") {
      const value = normalize(resolvePath(payload, spec))
      if (value === undefined) missing.add(spec)
      setPath(data, target, value ?? null)
      continue
    }

    setPath(data, target, spec)
  }

  return { data, missing: [...missing] }
}

const MUSTACHE = /\{\{\{?\s*([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\[\d+\])*)\s*\}?\}\}/g
/** Deja fuera los bloques: dentro de un `#each` la ruta es relativa al item. */
const BLOCK = /\{\{[#^]\s*(\w+)[\s\S]*?\{\{\/\1\}\}/g
const KEYWORDS = new Set(["else", "this", "if", "unless", "each", "with", "lookup", "log", "true", "false", "null", "undefined"])

function stripBlocks(text: string) {
  let previous: string
  do {
    previous = text
    text = text.replace(BLOCK, "")
  } while (text !== previous)
  return text
}

/**
 * Rutas `{{x.y}}` que usan las plantillas y no existen en los datos. Aviso, no
 * error: la plantilla puede usar `#each`/helpers y ahí no se valida.
 */
export function missingTemplatePaths(roots: unknown[], data: unknown): string[] {
  const missing = new Set<string>()

  const walk = (value: unknown) => {
    if (typeof value === "string") {
      for (const match of stripBlocks(value).matchAll(MUSTACHE)) {
        const path = match[1]
        if (!path || KEYWORDS.has(path)) continue
        if (resolvePath(data, path) === undefined) missing.add(path)
      }
      return
    }
    if (Array.isArray(value)) {
      value.forEach(walk)
      return
    }
    if (value && typeof value === "object") Object.values(value).forEach(walk)
  }

  roots.forEach(walk)
  return [...missing]
}
