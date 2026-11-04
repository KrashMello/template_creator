import type { Browser, Page } from 'puppeteer-core'
import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium'

/** Tope por operación: una plantilla lenta no puede colgar la función. */
const RENDER_TIMEOUT_MS = 20_000

/**
 * Args de `@sparticuz/chromium` que aquí no queremos: el HTML del PDF lo
 * controla quien llama al endpoint, así que el navegador no puede renderizar
 * con la seguridad web desactivada.
 */
const UNSAFE_ARGS = new Set([
  '--disable-web-security',
  '--allow-running-insecure-content',
])

export async function withPuppeteer<T>(
  handler: (page: Page, browser: Browser) => Promise<T>
): Promise<T> {
  const browser = await puppeteer.launch({
    executablePath: await chromium.executablePath(),
    headless: true,
    // `--no-sandbox` se queda: es obligatorio en este entorno.
    args: chromium.args.filter((arg) => !UNSAFE_ARGS.has(arg)),
  })

  try {
    const page = await browser.newPage()
    await page.setViewport({ width: 1280, height: 720 })
    page.setDefaultTimeout(RENDER_TIMEOUT_MS)
    page.setDefaultNavigationTimeout(RENDER_TIMEOUT_MS)
    return await handler(page, browser)
  } finally {
    await browser.close()
  }
}
