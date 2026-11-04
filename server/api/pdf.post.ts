import { defineEventHandler, readBody, createError, getRequestHeader } from 'h3'
import { withPuppeteer } from '../utils/puppeteer'
import type { Page, PDFOptions } from 'puppeteer-core'
import { parse as parseHtml } from "node-html-parser";
import { tws } from "tailwind-to-style";
import { isAllowedUrl } from '../utils/allow-public-url'

/**
 * Page geometry (CSS pixels at 96dpi).
 *
 * Header/footer templates are laid out by Chromium in a box that spans the
 * whole page width (it ignores the left/right margins), and we deliberately
 * add no padding of our own: the template is full-bleed, so a `w-full` row
 * reaches 100% of the page exactly like it does in the editor preview. The
 * body content keeps the configured page margins below it.
 */
/** Paper sizes in inches: [width, height]. */
type PageFormat = "letter" | "legal" | "oficio" | "a4"
type PageOrientation = "portrait" | "landscape"
const PAGE_SIZES_IN: Record<PageFormat, [number, number]> = {
  letter: [8.5, 11],
  legal: [8.5, 14],
  oficio: [216 / 25.4, 330 / 25.4], // 216 × 330 mm
  a4: [210 / 25.4, 297 / 25.4],
}
const PAGE_FORMATS = Object.keys(PAGE_SIZES_IN) as PageFormat[]
/**
 * `paperFormats` de puppeteer solo conoce letter/legal/tabloid/ledger/a0-a6;
 * los tamaños de esta lista se pasan como `width`/`height` explícitos en mm.
 * (`landscape` sigue funcionando: puppeteer manda paperWidth/paperHeight y
 * `landscape` por separado, y Chromium rota el papel.)
 */
const CUSTOM_PAGE_MM: Partial<Record<PageFormat, [number, number]>> = {
  oficio: [216, 330],
}

function pageWidthPx(format: PageFormat, orientation: PageOrientation): number {
  const [w, h] = PAGE_SIZES_IN[format] || PAGE_SIZES_IN.letter
  const [fw] = orientation === "landscape" ? [h, w] : [w, h]
  return fw * 96
}

const MM_TO_PX = 96 / 25.4
/** Margen lateral por defecto (y respaldo de cualquier valor ausente/inválido). */
const DEFAULT_MARGIN_MM = 10
const MAX_MARGIN_MM = 100
/** Extra breathing room added below/above the measured header/footer height. */
const HEADER_GAP_MM = 2
const MIN_VERTICAL_MARGIN_MM = 8
/** Safety cap so a huge header/footer cannot eat the whole page. */
const MAX_VERTICAL_MARGIN_MM = 60
/** Id of the wrapper `buildTemplate` adds, used to measure it back. */
const TEMPLATE_ROOT_ID = "header-footer-template"

/**
 * Chromium renders header/footer templates with a ~1px root font size, which
 * collapses every `rem` value produced by `tailwind-to-style` (e.g. `text-sm`
 * -> `0.875rem`) to ~1px. Resetting the root font size fixes that, and the
 * second block lets the user's own CSS (`store.cssCode`) style the header too.
 *
 * `print-color-adjust` is mandatory: Chromium drops backgrounds/borders from
 * header/footer templates unless the element explicitly asks for them.
 *
 * The last rule undoes the wrapper Chromium puts around the template, which
 * has a 20px vertical padding our measurement cannot see (measurement runs in
 * a plain page, printing does not) — the header would render 20px lower than
 * calculated and overlap the body, and the footer would stop 20px short of the
 * page edge. `:not()` keeps the rule off `#header-footer-template` itself,
 * because in the measurement page that wrapper *is* a direct child of `<body>`
 * and its own padding is part of what we measure.
 *
 * `line-height:1.5` mirrors Tailwind's preflight (what the editor preview and
 * the exported body use) and, being an explicit value, keeps the measured
 * height identical in both contexts — `normal` depends on the font metrics,
 * which differed between the measurement page and the print header/footer.
 *
 * `display:flow-root` stops the children's default margins (a `<p>` ships
 * `margin:1em 0`) from collapsing out of the wrapper: they would render but
 * not be measured, pushing the header into the body content.
 */
const TEMPLATE_BASE_CSS =
  `html,body{margin:0;font-size:16px;line-height:1.5}` +
  `*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}` +
  `body>*:not(#${TEMPLATE_ROOT_ID}){margin:0;padding:0;border:0}` +
  `#${TEMPLATE_ROOT_ID}{display:flow-root}`

function tailwindToInlineStyle(cls: string): string {
  return tws(cls).replace(/;/g, "; "); // normaliza formato
}

/**
 * Converts Tailwind classes into generated utility rules (`.hd-0`, `.ft-0`, ...).
 *
 * Inline styles were a problem: they beat the user's own CSS (e.g. `text-sm`
 * inline would win over `.titulo-informe { font-size: 22px }` from `cssCode`).
 * Emitting rules instead keeps `class` attributes untouched and, because the
 * rules are injected *before* the user's CSS with the same specificity, the
 * user's stylesheet overrides them exactly like it does in the body — where
 * Tailwind comes from the runtime CDN.
 */
function transformHtmlTailwindToStyle(html: string, prefix: string): { html: string, css: string } {
  const root = parseHtml(html);
  const rules: string[] = [];

  const elements = root.querySelectorAll("[class]");
  elements.forEach((el) => {
    const clsAttr = el.getAttribute("class");
    if (!clsAttr) return;

    const declarations = tailwindToInlineStyle(clsAttr);
    if (!declarations) return;

    // Chromium renders header and footer templates sharing one style context,
    // so the generated names must be unique across both (a `text-align:center`
    // from the footer would otherwise center the header too).
    const generatedClass = `${prefix}-${rules.length}`;
    rules.push(`.${generatedClass}{${declarations}}`);
    el.setAttribute("class", `${clsAttr} ${generatedClass}`);
  });

  return { html: root.toString(), css: rules.join("") };
}

/**
 * Wraps header/footer markup into a template Chromium can render properly:
 * a single root element (Chromium lays multiple top-level siblings out in a
 * horizontal row), full-bleed so `w-full` content spans the whole page, with
 * the base CSS and the user's CSS injected via `<style>` (supported inside
 * templates).
 */
function buildTemplate(html: string, css: string, prefix: string): string {
  const { html: content, css: tailwindCss } = transformHtmlTailwindToStyle(html, prefix);
  return (
    `<style>${TEMPLATE_BASE_CSS}</style>` +
    `<style>${tailwindCss}</style>` +
    `<style>${css || ""}</style>` +
    `<div id="${TEMPLATE_ROOT_ID}" style="width:100%">${content}</div>`
  );
}

/**
 * Measures the rendered height of a template so the top/bottom margins can be
 * sized after it: the header/footer live in the margin box, and anything taller
 * than the margin gets clipped and overlaps the body content.
 */
async function measureTemplateHeight(page: Page, template: string, widthPx: number): Promise<number> {
  try {
    // `networkidle0` is unreliable for repeated `setContent` calls on the same
    // page; images are awaited explicitly inside the evaluate below instead.
    await page.setContent(
      `<!doctype html><html><head></head><body style="margin:0;width:${widthPx}px">${template}</body></html>`,
      { waitUntil: "load" }
    );

    return await page.evaluate(async (rootId: string) => {
      const root = document.getElementById(rootId);
      if (!root) return 0;

      // Images (logos) may still be loading; give them a chance but never hang.
      const imageReady = (img: HTMLImageElement) =>
        img.complete
          ? Promise.resolve()
          : new Promise((resolve) => {
              img.onload = resolve;
              img.onerror = resolve;
              setTimeout(resolve, 3000);
            });
      await Promise.all(Array.from(document.images).map(imageReady));

      return root.getBoundingClientRect().height;
    }, TEMPLATE_ROOT_ID);
  } catch (e) {
    // A failed measurement only costs the dynamic margin: fall back to the
    // default side margin instead of failing the whole export.
    console.error("No se pudo medir la altura del header/footer:", e);
    return 0;
  }
}

/**
 * Margen vertical de una zona que se repite: necesita como mínimo la altura
 * medida (si no, la plantilla se solapa con el cuerpo), pero nunca menos del
 * margen que ha configurado el usuario. Sin altura medida se usa el margen tal
 * cual (zona no repetida o vacía).
 */
function verticalMarginFor(heightPx: number, configuredMm: number): string {
  if (!heightPx) return `${configuredMm}mm`;
  const heightMm = heightPx / MM_TO_PX + HEADER_GAP_MM;
  const needed = Math.max(configuredMm, heightMm);
  return `${Math.min(Math.max(needed, MIN_VERTICAL_MARGIN_MM), MAX_VERTICAL_MARGIN_MM)}mm`;
}

function marginMm(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return DEFAULT_MARGIN_MM;
  return Math.min(Math.max(n, 0), MAX_MARGIN_MM);
}

/**
 * Inyecta una zona (header/footer) dentro del flujo del cuerpo para que solo
 * aparezca donde toca sin plantilla de margen: el header antes del contenido
 * (así las páginas siguientes usan el margen normal, sin reservar espacio) y el
 * pie al final del contenido. El wrapper lleva márgenes negativos para que el
 * contenido siga llegando a los bordes de página (full-bleed), igual que la
 * plantilla en el margen.
 *
 * Si el HTML no trae `<body>` (lienzo vacío: `generateLayoutHtml` devuelve solo
 * el hint) se envuelve primero; si no, la inyección no tendría dónde engancharse.
 */
function injectZoneInFlow(
  html: string,
  markup: string,
  position: "start" | "end",
  margins: { left: number, right: number },
): string {
  if (!markup) return html;
  let doc = html;
  if (!/<body[\s>]/i.test(doc)) doc = `<html><head></head><body>${doc}</body></html>`;
  const block =
    `<div style="margin-left:-${margins.left}mm;margin-right:-${margins.right}mm">${markup}</div>`;
  if (position === "start") return doc.replace(/<body([^>]*)>/i, (tag) => `${tag}${block}`);
  return doc.replace(/<\/body>/i, `${block}</body>`);
}

/** Ajustes de página enviados desde el store (`store.page`). */
type PageSettings = {
  format?: string
  orientation?: PageOrientation
  margins?: { top?: unknown, right?: unknown, bottom?: unknown, left?: unknown }
  /** `false` desactiva la repetición; lo ausente mantiene el comportamiento histórico. */
  headerRepeat?: boolean
  footerRepeat?: boolean
}

/**
 * El endpoint es público (no hay cuentas), así que se acota el daño que puede
 * hacer una sola instancia: tamaño del payload, peticiones por IP y renders
 * simultáneos.
 * `shortcut: los contadores viven en memoria, o sea por instancia; si el abuso
 * importa, poner rate limit delante (Vercel Firewall) o auth real.`
 */
const MAX_HTML_CHARS = 1_000_000
const MAX_ZONE_CHARS = 200_000
const MAX_CSS_CHARS = 200_000
const RATE_WINDOW_MS = 60_000
const RATE_MAX_REQUESTS = 20
const MAX_CONCURRENT_RENDERS = 3

const rateHits = new Map<string, { count: number, reset: number }>()
let activeRenders = 0

/** Ventana fija por IP en memoria. La limpieza va en el mismo paso para no crecer. */
function isRateLimited(ip: string): boolean {
  const now = Date.now()
  for (const [key, hit] of rateHits) {
    if (hit.reset <= now) rateHits.delete(key)
  }
  const hit = rateHits.get(ip) ?? { count: 0, reset: now + RATE_WINDOW_MS }
  hit.count++
  rateHits.set(ip, hit)
  return hit.count > RATE_MAX_REQUESTS
}

/** Corta toda petición de la página que salga de la red pública. */
async function blockPrivateRequests(page: Page): Promise<void> {
  const cache = new Map<string, boolean>()
  await page.setRequestInterception(true)
  page.on('request', (request) => {
    const url = request.url()
    const decide = async () => {
      let allowed = cache.get(url)
      if (allowed === undefined) {
        allowed = await isAllowedUrl(url)
        cache.set(url, allowed)
      }
      if (!allowed) console.warn('pdf: petición bloqueada', url)
      try {
        await (allowed ? request.continue() : request.abort('blockedbyclient'))
      } catch {
        // La petición ya se resolvió o la página se cerró: no hay nada que hacer.
      }
    }
    void decide()
  })
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    html?: string
    header?: string
    footer?: string
    css?: string
    page?: PageSettings
  }>(event)
  if (typeof body?.html !== 'string' || !body.html) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing html payload',
    })
  }

  // El último salto lo escribe el proxy; el primero lo puede inventar el cliente.
  const ip = getRequestHeader(event, 'x-forwarded-for')?.split(',').pop()?.trim() || 'unknown'
  if (isRateLimited(ip)) {
    throw createError({ statusCode: 429, statusMessage: 'Too many PDF requests, retry in a minute' })
  }
  // Un navegador desde otro sitio no tiene por qué usar la exportación.
  if (getRequestHeader(event, 'sec-fetch-site') === 'cross-site') {
    throw createError({ statusCode: 403, statusMessage: 'Cross-site requests are not allowed' })
  }

  const headerMarkup = typeof body.header === 'string' ? body.header : ''
  const footerMarkup = typeof body.footer === 'string' ? body.footer : ''
  const css = typeof body.css === 'string' ? body.css : ''
  if (
    body.html.length > MAX_HTML_CHARS ||
    headerMarkup.length > MAX_ZONE_CHARS ||
    footerMarkup.length > MAX_ZONE_CHARS ||
    css.length > MAX_CSS_CHARS
  ) {
    throw createError({ statusCode: 413, statusMessage: 'Document too large' })
  }
  if (activeRenders >= MAX_CONCURRENT_RENDERS) {
    throw createError({ statusCode: 503, statusMessage: 'PDF renderer busy, retry shortly' })
  }

  const rawFormat = body.page?.format
  const format: PageFormat =
    rawFormat && (PAGE_FORMATS as string[]).includes(rawFormat) ? (rawFormat as PageFormat) : 'letter'
  const orientation: PageOrientation =
    body.page?.orientation === 'landscape' ? 'landscape' : 'portrait'
  const margins = {
    top: marginMm(body.page?.margins?.top),
    right: marginMm(body.page?.margins?.right),
    bottom: marginMm(body.page?.margins?.bottom),
    left: marginMm(body.page?.margins?.left),
  }

  // Zona repetida → plantilla en el margen (se mide para dimensionarlo).
  // Zona no repetida → se inyecta en el flujo del cuerpo y su margen es el
  // configurado (sin medir: la medida solo sirve para la plantilla).
  const useHeaderTemplate = body.page?.headerRepeat !== false && !!headerMarkup
  const useFooterTemplate = body.page?.footerRepeat !== false && !!footerMarkup

  const headerTemplate = useHeaderTemplate ? buildTemplate(headerMarkup, css, 'hd') : ''
  const footerTemplate = useFooterTemplate ? buildTemplate(footerMarkup, css, 'ft') : ''

  let html = body.html
  if (!useHeaderTemplate && headerMarkup) {
    html = injectZoneInFlow(html, headerMarkup, 'start', margins)
  }
  if (!useFooterTemplate && footerMarkup) {
    html = injectZoneInFlow(html, footerMarkup, 'end', margins)
  }

  activeRenders++
  const pdfBuffer = await withPuppeteer(async (page) => {
    // Antes de cualquier `setContent`: la página no puede pedir red privada.
    await blockPrivateRequests(page)

    // Measure first: this navigates the page, so it has to happen before the
    // document HTML is loaded.
    const widthPx = pageWidthPx(format, orientation)
    const headerHeightPx = headerTemplate ? await measureTemplateHeight(page, headerTemplate, widthPx) : 0
    const footerHeightPx = footerTemplate ? await measureTemplateHeight(page, footerTemplate, widthPx) : 0

    const pdfOptions: PDFOptions = {
      // `puppeteer-core` 25 solo acepta `landscape` (no existe `orientation`).
      landscape: orientation === 'landscape',
      printBackground: true,
      margin: {
        top: verticalMarginFor(headerHeightPx, margins.top),
        right: `${margins.right}mm`,
        bottom: verticalMarginFor(footerHeightPx, margins.bottom),
        left: `${margins.left}mm`,
      },
    }

    const customSize = CUSTOM_PAGE_MM[format]
    if (customSize) {
      pdfOptions.width = `${customSize[0]}mm`
      pdfOptions.height = `${customSize[1]}mm`
    } else {
      pdfOptions.format = format
    }

    if (headerTemplate || footerTemplate) {
      pdfOptions.displayHeaderFooter = true
      // Explicit empty templates prevent Chromium from printing its own
      // defaults (date, title, url and page numbers) on the missing side.
      pdfOptions.headerTemplate = headerTemplate || '<span></span>'
      pdfOptions.footerTemplate = footerTemplate || '<span></span>'
    }

    // `networkidle0` is no longer part of `setContent`'s public options, and
    // Tailwind is compiled at runtime by the CDN script, so the print has to
    // wait for the network to settle instead of racing the stylesheet.
    await page.setContent(html, {
      waitUntil: 'load',
    })
    await page.waitForNetworkIdle({ idleTime: 500, timeout: 15_000 })
    const buffer = await page.pdf(pdfOptions)

    return buffer
  }).finally(() => {
    activeRenders--
  })

  event.node.res.setHeader(
    'Content-Type',
    'application/pdf'
  )
  event.node.res.setHeader(
    'Content-Disposition',
    'inline; filename="document.pdf"'
  )

  return pdfBuffer
})
