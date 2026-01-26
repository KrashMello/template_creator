import puppeteer, { Browser, Page } from 'puppeteer'

export async function withPuppeteer<T>(
  handler: (page: Page, browser: Browser) => Promise<T>
): Promise<T> {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu',
    ],
  })

  try {
    const page = await browser.newPage()
    await page.setViewport({ width: 1280, height: 720 })
    return await handler(page, browser)
  } finally {
    await browser.close()
  }
}

