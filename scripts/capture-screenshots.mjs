/**
 * Captures the editor screenshots used by the landing page.
 *
 * Usage:  node scripts/capture-screenshots.mjs
 * (requires the dev server running on http://localhost:3000)
 *
 * Output: public/screenshots/editor-{preview,schema,styles,data}.png
 */
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium'

const BASE = process.env.BASE_URL || 'http://localhost:3000'
const OUT = path.resolve('public/screenshots')

const VIEWS = [
  { file: 'editor-preview.png', title: 'Vista previa' },
  { file: 'editor-schema.png', title: 'Esquema JSON' },
  { file: 'editor-styles.png', title: 'Estilos CSS' },
  { file: 'editor-data.png', title: 'Datos' },
]

/** Minimal document so the screenshots are not an empty canvas. */
const seed = {
  styleEl: null,
  cssCode: '.text-body {\n  color: #334155;\n}\n',
  history: [],
  redoStack: [],
  data: {
    name: 'krashmello',
    create_date: '02-02-2026',
    table: {
      cols: ['Service', 'Volume', 'Revenue'],
      rows: [
        ['Infrastructure Support', '142 Units', '$12,400.00'],
        ['Security Audit', '1 Item', '$2,500.00'],
        ['Networking', '10 Units', '$10,000.00'],
      ],
    },
  },
  schema: {
    id: 'preview',
    tag: 'div',
    children: [
      {
        id: 'seedtitle',
        tag: 'p',
        name: 'Texto',
        data: {
          content: 'Informe mensual de servicios',
          class: 'p-2 text-2xl font-bold text-slate-900',
        },
        children: [],
      },
      {
        id: 'seedmeta',
        tag: 'p',
        name: 'Texto',
        data: {
          content: 'Cliente: {{name}} · Fecha: {{create_date}}',
          class: 'p-2 text-sm text-slate-500',
        },
        children: [],
      },
      {
        id: 'seedtable',
        tag: 'table',
        name: 'Tabla',
        data: {
          table: true,
          columns: '{{#each table.cols}}\n    <th class="p-4">{{this}}</th>\n  {{/each}}',
          rows:
            '{{#each table.rows}}\n<tr class="transition-colors hover:bg-zinc-50/80">{{#each this}}\n    <td class="p-4">{{this}}</td>\n  {{/each}}</tr>\n  {{/each}}',
          class: 'w-full text-sm text-left rtl:text-right text-body',
        },
        children: [],
      },
    ],
  },
  header: {
    id: 'header',
    tag: 'div',
    children: [
      {
        id: 'seedheader',
        tag: 'p',
        name: 'Texto',
        data: { content: 'Template Creator · Informe', class: 'p-2 text-sm font-semibold text-blue-700' },
        children: [],
      },
    ],
  },
  footer: {
    id: 'footer',
    tag: 'div',
    children: [
      {
        id: 'seedfooter',
        tag: 'p',
        name: 'Texto',
        data: { content: 'Documento generado con Template Creator', class: 'p-2 text-xs text-slate-400' },
        children: [],
      },
    ],
  },
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/** The Nuxt devtools overlay is dev-only chrome; keep it out of the screenshots. */
const hideDevtools = (page) =>
  page.addStyleTag({ content: '#nuxt-devtools-container { display: none !important; }' })

async function main() {
  await mkdir(OUT, { recursive: true })

  const browser = await puppeteer.launch({
    args: [...chromium.args, '--hide-scrollbars'],
    executablePath: await chromium.executablePath(),
    headless: chromium.headless ?? true,
    defaultViewport: null,
  })

  try {
    const page = await browser.newPage()
    await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 1.5 })

    // Force Spanish (default locale) for stable screenshots
    await page.setCookie({ name: 'tc_locale', value: 'es', domain: 'localhost', path: '/' })

    await page.goto(`${BASE}/demo`, { waitUntil: 'networkidle2', timeout: 60000 })

    // Seed the persisted store and reload so the canvas has content
    await page.evaluate((payload) => {
      sessionStorage.setItem('template', JSON.stringify(payload))
    }, seed)
    await page.reload({ waitUntil: 'networkidle2', timeout: 60000 })
    await hideDevtools(page)
    await page.waitForSelector('#preview .draggable-component', { timeout: 20000 })

    // Let the Tailwind CDN runtime compile the preview classes
    await sleep(2500)

    for (const view of VIEWS) {
      const selector = `[title="${view.title}"]`
      await page.waitForSelector(selector, { timeout: 10000 })
      await page.click(selector)
      // Give Monaco / the view time to render
      await sleep(view.file === 'editor-preview.png' ? 300 : 1800)
      await page.screenshot({ path: path.join(OUT, view.file) })
      console.log(`✓ ${view.file}`)
    }
  } finally {
    await browser.close()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
