import type { ElementDataSet } from "../stores/template";
import { paletteComponent, paletteData, type PaletteId } from "../palette";

/**
 * Fábricas de nodos `ElementDataSet` para escribir plantillas a mano.
 *
 * **Regla estricta**: cada nodo es literalmente el componente de la paleta
 * (`paletteData`) y solo se le cambia el contenido/markup; encima se añade
 * como mucho una clase marcadora (`tc-…`) que usa su `cssCode`. Todo el resto
 * del aspecto (tamaños, cajas, colores, espaciados) vive en el CSS, nunca en
 * la cadena de clases base.
 *
 * Los ids llevan el prefijo de la plantilla (`inv-1`, ...): no pueden llamarse
 * `preview`/`header`/`footer` (son las raíces y `findPathById` los trata de
 * forma especial).
 */
export type Marker = string | string[];

/** Sin marcador se conserva la cadena de la paleta tal cual (hasta el espacio final). */
const withMarker = (base: string | undefined, marker?: Marker): string | undefined => {
  if (!marker) return base;
  const extra = (Array.isArray(marker) ? marker : [marker]).join(" ");
  return `${base ?? ""} ${extra}`.trim();
};

export interface Builder {
  /** Texto (componente Texto). `content` admite markup de Handlebars. */
  text: (name: string, content: string, marker?: Marker) => ElementDataSet;
  row: (name: string, children?: ElementDataSet[], marker?: Marker) => ElementDataSet;
  col: (name: string, children?: ElementDataSet[], marker?: Marker) => ElementDataSet;
  container: (name: string, children?: ElementDataSet[], marker?: Marker) => ElementDataSet;
  image: (name: string, src: string, marker?: Marker) => ElementDataSet;
  checkbox: (
    name: string,
    label: string,
    opts?: { checked?: boolean; marker?: Marker },
  ) => ElementDataSet;
  /** Tabla: por defecto usa el markup de la paleta (`table.cols` / `table.rows`). */
  table: (
    name: string,
    opts?: { marker?: Marker; columns?: string; rows?: string },
  ) => ElementDataSet;
  /** Código de barras: `content` es texto literal o `{{expresion}}` de datos. */
  barcode: (
    name: string,
    content: string,
    opts?: { height?: number; marker?: Marker },
  ) => ElementDataSet;
}

export function makeBuilder(prefix: string): Builder {
  let seq = 0;
  const id = () => `${prefix}-${++seq}`;

  const node = (
    paletteId: PaletteId,
    name: string,
    marker?: Marker,
    patch?: (data: Record<string, any>) => void,
    children?: ElementDataSet[],
  ): ElementDataSet => {
    const data = paletteData(paletteId);
    patch?.(data);
    const cls = withMarker(data.class, marker);
    if (cls !== undefined) data.class = cls;
    return {
      id: id(),
      tag: paletteComponent(paletteId).tag,
      name,
      data,
      children: children ?? [],
    };
  };

  return {
    text: (name, content, marker) =>
      node("text", name, marker, (d) => {
        d.content = content;
      }),
    row: (name, children = [], marker) => node("row", name, marker, undefined, children),
    col: (name, children = [], marker) => node("col", name, marker, undefined, children),
    container: (name, children = [], marker) =>
      node("container", name, marker, undefined, children),
    image: (name, src, marker) =>
      node("image", name, marker, (d) => {
        d.src = src;
      }),
    checkbox: (name, label, opts = {}) =>
      node("checkbox", name, opts.marker, (d) => {
        d.name = label;
        d.value = !!opts.checked;
      }),
    table: (name, opts = {}) =>
      node("table", name, opts.marker, (d) => {
        if (opts.columns != null) d.columns = opts.columns;
        if (opts.rows != null) d.rows = opts.rows;
      }),
    barcode: (name, content, opts = {}) =>
      node("barcode", name, opts.marker, (d) => {
        d.content = content;
        if (opts.height != null) d.height = opts.height;
      }),
  };
}

/**
 * Utilidades compartidas por todas las plantillas: la paleta deja las clases
 * base intactas y aquí solo se añade lo propio.
 *
 * Selectores con `[class]` (especificidad 0,2,0) a propósito: el CDN de
 * Tailwind se inyecta *después* que `cssCode` en el cuerpo, así que una clase
 * suelta perdería siempre el empate.
 */
export const COMMON_CSS = `
/* --- utilidades de plantilla (la base la da la paleta) ------------------- */
.tc-xs[class] { font-size: 12px; }
.tc-lg[class] { font-size: 17px; }
.tc-label[class] { font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #94a3b8; }
.tc-muted[class] { color: #64748b; }
.tc-strong[class] { font-weight: 700; color: #0f172a; }
.tc-center[class] { text-align: center; }
.tc-right[class] { text-align: right; }
.tc-mono[class] { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
.tc-fit[class] { min-height: 0; }
.tc-stack[class] { min-height: 0; gap: 4px; }
.tc-rowcenter[class] { min-height: 0; align-items: center; }
.tc-rowbetween[class] { min-height: 0; justify-content: space-between; align-items: center; }
.tc-rowend[class] { min-height: 0; justify-content: flex-end; }
.tc-flush[class] { padding-left: 0; padding-right: 0; }
.tc-line[class] { min-height: 0; padding-left: 0; padding-right: 0; justify-content: space-between; }
.tc-cols[class] { min-height: 0; }
.tc-cols[class] > div { flex: 1 1 0%; }
.tc-mt2[class] { margin-top: 8px; }
.tc-mt3[class] { margin-top: 12px; }
.tc-mt4[class] { margin-top: 16px; }
.tc-mt6[class] { margin-top: 24px; }
/* Cabecera/pie: van a sangre en el PDF y, sin preflight, hay que limpiar a
   mano los márgenes por defecto y el min-h-16 que la paleta da a los div. */
.tc-pagepad[class] { min-height: 0; padding-left: 40px; padding-right: 40px; }
.tc-pagepad[class] p { margin: 0; }
.tc-pagepad[class] div { min-height: 0; }
`;

/** `cssCode` de una plantilla: utilidades compartidas + reglas propias. */
export const templateCss = (own: string): string => `${COMMON_CSS}\n${own.trim()}\n`;

/**
 * CSS compartido por los documentos legales (contrato, NDA, arrendamiento):
 * cuerpo envuelto en un contenedor con tipografía serif, título con línea de
 * referencias, cláusulas numeradas y bloque de firmas.
 *
 * El aire sobre `.tc-sign-line` (margin-top) es el espacio para la firma
 * manuscrita; la línea queda justo encima del nombre del firmante.
 */
export const LEGAL_CSS = `
   /* --- documentos legales ------------------------------------------------- */
   .tc-legal-body[class] { min-height: 0; gap: 0; margin-top: 8px; padding-left: 0; padding-right: 0; }
   .tc-legal-body[class] p { font-family: Georgia, 'Times New Roman', serif; }
   .tc-legal-logo[class] { width: 32px; height: 32px; border-radius: 8px; }
   .tc-legal-wordmark[class] { padding: 0; font-size: 11px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: #1e293b; }
   .tc-legal-title[class] { padding: 0; font-size: 25px; line-height: 1.2; font-weight: 700; color: #0f172a; }
   .tc-legal-meta[class] { padding: 0; margin-top: 6px; font-size: 12px; }
   .tc-legal-parties[class] { padding: 0; margin-top: 18px; }
   .tc-legal-clause[class] { padding: 0; margin-top: 18px; font-weight: 700; color: #0f172a; }
   .tc-legal-text[class] { padding: 0; margin-top: 2px; line-height: 1.65; color: #334155; }
   .tc-legal-closing[class] { padding: 0; margin-top: 24px; font-style: italic; line-height: 1.65; color: #334155; }
   /* Firmas: una columna por firmante, aire para escribir y línea sólida. */
   .tc-signs[class] { margin-top: 26px; padding-left: 0; padding-right: 0; gap: 40px; }
   .tc-sign-col[class] { min-height: 0; gap: 4px; }
   .tc-sign-line[class] { margin-top: 46px; padding: 6px 0 0; border-top: 1px solid #334155; font-weight: 600; color: #0f172a; }
   .tc-sign-role[class] { padding: 0; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .08em; color: #64748b; }
   .tc-sign-detail[class] { padding: 0; font-size: 11px; color: #94a3b8; }
 `;

/**
 * Raíz de una zona. Los ids son fijos: `center-container` hace `v-html` sobre
 * `#preview` / `#header` / `#footer` y `findPathById` los reconoce.
 */
export const rootNode = (id: string): ElementDataSet => ({
  id,
  type: "container",
  tag: "div",
  name: id,
  data: {},
  children: [],
});

/** Logo de ejemplo embebido en SVG (evita peticiones de red en el PDF). */
export const logoSvg = (label: string, bg = "#2563eb", fg = "#ffffff"): string => {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">` +
    `<rect width="96" height="96" rx="22" fill="${bg}"/>` +
    `<text x="48" y="62" font-family="Arial, Helvetica, sans-serif" font-size="44" font-weight="700" ` +
    `fill="${fg}" text-anchor="middle">${label}</text>` +
    `</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

/** Marca de agua / firma decorativa para certificados. */
export const sealSvg = (bg: string, fg: string): string => {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">` +
    `<circle cx="60" cy="60" r="54" fill="none" stroke="${bg}" stroke-width="6"/>` +
    `<circle cx="60" cy="60" r="42" fill="none" stroke="${bg}" stroke-width="2"/>` +
    `<path d="M40 62l14 14 26-30" fill="none" stroke="${fg}" stroke-width="8" ` +
    `stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};
