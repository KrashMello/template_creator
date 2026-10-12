import { defineEventHandler, readBody, createError } from 'h3'
import { withPuppeteer } from '../utils/puppeteer'
import type { Page, PDFOptions } from 'puppeteer-core'
import { parse as parseHtml } from "node-html-parser";
import { tws } from "tailwind-to-style";

/**
 * Page geometry (letter format, CSS pixels at 96dpi).
 *
 * Header/footer templates are laid out by Chromium in a box that spans the
 * whole page width (it ignores the left/right margins), and we deliberately
 * add no padding of our own: the template is full-bleed, so a `w-full` row
 * reaches 100% of the page exactly like it does in the editor preview. The
 * body content keeps the `SIDE_MARGIN_MM` page margins below it.
 */
const PAGE_WIDTH_PX = 8.5 * 96
const MM_TO_PX = 96 / 25.4
const SIDE_MARGIN_MM = 10
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
async function measureTemplateHeight(page: Page, template: string): Promise<number> {
  try {
    // `networkidle0` is unreliable for repeated `setContent` calls on the same
    // page; images are awaited explicitly inside the evaluate below instead.
    await page.setContent(
      `<!doctype html><html><head></head><body style="margin:0;width:${PAGE_WIDTH_PX}px">${template}</body></html>`,
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

function verticalMarginFor(heightPx: number): string {
  if (!heightPx) return `${SIDE_MARGIN_MM}mm`;
  const heightMm = heightPx / MM_TO_PX + HEADER_GAP_MM;
  return `${Math.min(Math.max(heightMm, MIN_VERTICAL_MARGIN_MM), MAX_VERTICAL_MARGIN_MM)}mm`;
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{ html?: string, header?: string, footer?: string, css?: string }>(event)
  if (!body?.html) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing html payload',
    })
  }

  const css = body.css || ''
  const headerTemplate = body.header ? buildTemplate(body.header, css, "hd") : ""
  const footerTemplate = body.footer ? buildTemplate(body.footer, css, "ft") : ""

  const pdfBuffer = await withPuppeteer(async (page) => {
    // Measure first: this navigates the page, so it has to happen before the
    // document HTML is loaded.
    const headerHeightPx = headerTemplate ? await measureTemplateHeight(page, headerTemplate) : 0
    const footerHeightPx = footerTemplate ? await measureTemplateHeight(page, footerTemplate) : 0

    const pdfOptions: PDFOptions = {
      format: 'letter',
      printBackground: true,
      margin: {
        top: verticalMarginFor(headerHeightPx),
        right: `${SIDE_MARGIN_MM}mm`,
        bottom: verticalMarginFor(footerHeightPx),
        left: `${SIDE_MARGIN_MM}mm`,
      },
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
    await page.setContent(body.html, {
      waitUntil: 'load',
    })
    await page.waitForNetworkIdle({ idleTime: 500, timeout: 15_000 })
    const buffer = await page.pdf(pdfOptions)

    return buffer
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
