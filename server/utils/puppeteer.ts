import { Browser, Page } from 'puppeteer'
import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium'
export async function withPuppeteer<T>(
  handler: (page: Page, browser: Browser) => Promise<T>
): Promise<T> {
  const browser = await puppeteer.launch({
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    ignoreHTTPSErrors: true,
  })

  try {
    const page = await browser.newPage()
    await page.setViewport({ width: 1280, height: 720 })
    return await handler(page, browser)
  } finally {
    await browser.close()
  }
}

