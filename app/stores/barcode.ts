import handlebars from "handlebars";

/**
 * Código de barras Code39 → SVG.
 *
 * Cada carácter son 9 elementos (5 barras y 4 espacios) de los cuales 3 son
 * anchos (3× el ancho estrecho); la tabla `PATTERNS` es la del alfabeto
 * Code39 (0-9, A-Z, `- . $ / + %` y el de inicio/fin `*`), y las barras caen
 * en las posiciones pares (0, 2, 4, 6, 8) de cada patrón.
 *
 * El SVG se genera con `width="100%"` para que la plantilla lo estire con su
 * CSS: `preserveAspectRatio="none"` escala todos los módulos por el mismo
 * factor, así que las proporciones barras/espacios (lo que lee el lector) se
 * mantienen.
 */
const PATTERNS: Record<string, string> = {
  "0": "nnnwwnwnn", "1": "wnnwnnnnw", "2": "nnwwnnnnw", "3": "wnwwnnnnn",
  "4": "nnnwwnnnw", "5": "wnnwwnnnn", "6": "nnwwwnnnn", "7": "nnnwnnwnw",
  "8": "wnnwnnwnn", "9": "nnwwnnwnn", "A": "wnnnnwnnw", "B": "nnwnnwnnw",
  "C": "wnwnnwnnn", "D": "nnnnwwnnw", "E": "wnnnwwnnn", "F": "nnwnwwnnn",
  "G": "nnnnnwwnw", "H": "wnnnnwwnn", "I": "nnwnnwwnn", "J": "nnnnwwwnn",
  "K": "wnnnnnnww", "L": "nnwnnnnww", "M": "wnwnnnnwn", "N": "nnnnwnnww",
  "O": "wnnnwnnwn", "P": "nnwnwnnwn", "Q": "nnnnnnwww", "R": "wnnnnnwwn",
  "S": "nnwnnnwwn", "T": "nnnnwnwwn", "U": "wwnnnnnnw", "V": "nwwnnnnnw",
  "W": "wwwnnnnnn", "X": "nwnnwnnnw", "Y": "wwnnwnnnn", "Z": "nwwnwnnnn",
  "-": "nwnnnnwnw", ".": "wwnnnnwnn", " ": "nwwnnnwnn", "$": "nwnwnwnnn",
  "/": "nwnwnnnwn", "+": "nwnnnwnwn", "%": "nnnwnwnwn", "*": "wnnwnwnnn",
};

const NARROW = 2;
const WIDE = NARROW * 3;
/** Zona de silencio inicial/final: 10 módulos, como pide la especificación. */
const QUIET = NARROW * 10;
/** Caracteres admitidos por Code39 (el resto se descarta). */
const ALLOWED = /[^0-9A-Z\-. $/+%]/g;

export function code39Svg(value: unknown, height?: unknown): string {
  const text = String(value ?? "").toUpperCase().replace(ALLOWED, "");
  if (!text) return "";

  const h = Number(height);
  const bars = Number.isFinite(h) && h > 0 ? h : 48;

  let x = QUIET;
  const rects: string[] = [];
  const chars = `*${text}*`;

  for (let c = 0; c < chars.length; c++) {
    const pattern = PATTERNS[chars[c]];
    if (!pattern) continue;
    for (let i = 0; i < pattern.length; i++) {
      const w = pattern[i] === "w" ? WIDE : NARROW;
      if (i % 2 === 0) rects.push(`<rect x="${x}" y="0" width="${w}" height="${bars}"/>`);
      x += w;
    }
    if (c < chars.length - 1) x += NARROW; // hueco entre caracteres
  }

  const width = x + QUIET;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${bars}" ` +
    `height="${bars}" width="100%" preserveAspectRatio="none" ` +
    `fill="#000000" aria-hidden="true">${rects.join("")}</svg>`
  );
}

/**
 * `{{barcode shipment.tracking 48}}`: permite que el valor venga del JSON de
 * datos (se compila con el resto del documento, tanto en el lienzo como en el
 * PDF). Se registra al cargar el módulo, así que está disponible en todos los
 * puntos donde se ejecuta Handlebars.
 */
handlebars.registerHelper("barcode", (value: unknown, height?: unknown) =>
  new handlebars.SafeString(code39Svg(value, height)),
);
