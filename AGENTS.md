# Template Creator — Agents

Drag-and-drop PDF layout builder. Single-package Nuxt app; no monorepo.

## Stack

- **Nuxt 4** (SSR) + **Pinia** (Options API stores) + **Tailwind 4** (via `@tailwindcss/vite`)
- **@nuxtjs/i18n** — es/en, browser detection + cookie (`tc_locale`), `strategy: 'no_prefix'`
- **Puppeteer-core** + `@sparticuz/chromium` — server-side PDF generation
- **Handlebars** — injects `store.data` into templates at preview and export time
- **Monaco Editor** (`@monaco-editor/loader`) — JSON schema/data editing
- **Vercel** deploy target (`nitro.preset: 'vercel'`; output in `.vercel/output`)

**Node >= 22.21** (Nuxt 4.6 ships `@nuxt/cli` v4; `puppeteer-core` 25 needs >=22.12, `@sparticuz/chromium` 153 needs ^22.17 || >=24). The Vercel function runtime is auto-picked from the build machine's Node, capped at `[18, 20, 22]` — keep the project on Node 22.x or the chromium binary won't start at runtime.

## Commands

```bash
pnpm dev         # dev server
pnpm build       # nitro build → .vercel/output
pnpm generate    # static generate
pnpm preview     # preview build
pnpm screenshots # refresh public/screenshots/* (needs `pnpm dev` running)
```

**No tests, linter, typechecker, or formatter exist.** Don't hunt for them; `pnpm build` is the only verification step. No root `tsconfig.json` — Nuxt generates `.nuxt/tsconfig.json` via `postinstall: nuxt prepare`.

### E2E testing
Drive the real UI with **terminal-browser** (skill `terminal-browser`): `terminal-browser open localhost:3000/demo --split right` to show it beside the chat, `terminal-browser ls` for tab ids, and `terminal-browser action -- snapshot|click @eN|fill @eN "x"|open <url>|eval "js"` against the active tab. The pane's locale follows the browser (usually `en`) — pin Spanish with `action -- eval "document.cookie='tc_locale=es; path=/'"` and then re-`open` the URL. If an eval fails with `SecurityError` while `location.href` is `chrome-error://chromewebdata/`, the tab is sitting on an error page (typically after the dev server restarted): re-`open` the URL and retry. Batch renders and PDF checks stay on headless puppeteer-core (`scripts/capture-screenshots.mjs` pattern) plus the esbuild bundle below.

## Architecture

### Routes
- **`/`** — marketing landing (`app/pages/index.vue`), layout `default` (site header/footer). Sections live in `app/components/landing/*`.
- **`/demo`** — the editor (`app/pages/demo.vue`), `definePageMeta({ layout: 'editor' })` (`app/layouts/editor.vue`, the full-screen 3-panel shell).
- Everything is translated: es/en JSON in `i18n/locales/*.json` (flat key space, `meta.*` for landing SEO, `editor.*` for the UI). Locale auto-detected from the browser (`detectBrowserLanguage` + cookie) with a manual switcher (`app/components/ui/locale-switcher.vue`, in the site header and the editor toolbar).

### Three-zone PDF layout
Canvas has **header / body / footer** zones (`SectionType = "body" | "footer" | "header"`). Each zone is a separate schema tree (`schema`, `header`, `footer` in the store); components can be dropped into any zone.

### State: `app/stores/templateStore.ts` (store name `"template"`)
- `schema` / `header` / `footer` — element trees (root nodes have `id: "preview"` / `"header"` / `"footer"`)
- `history` / `redoStack` — undo/redo, 50 steps
- `data` — Handlebars context; `dataKeys` getter flattens its dot-notation keys for autocomplete
- Components import the store directly (`import { templateStore } from '../stores/templateStore'`), not via auto-import

Schema mutation pattern (repeat after every change):
mutate → `pushHistory()` → `renderPreview()` → `updateSchemaDisplay()`
(`pushHistory()` records the **post**-mutation snapshot — see `onDrop`/`deleteElementById`; `undo()` pops the newest snapshot and restores the one before it, so it needs at least two.)

### Schema tree (`app/stores/template.ts` types + helpers)
```ts
interface ElementDataSet {
  id: string;
  tag: string;  // handled: p, div, table, img, checkbox, barcode
  name: string;
  data: Record<string, any>;  // class, content, src, table.cols/rows (Handlebars markup)
  children: ElementDataSet[];
}
```

`app/stores/template.ts` holds pure helpers used by the store: `generateElementHtml` (recursive render), `generateLayoutHtml` (full HTML doc for preview/body PDF), `generateLayoutHeaderFooterHtml` (bare markup for header/footer zones), tree ops (`findPathById`, `insertElementAtPath`, `removeElementAtPath`, ...), and drop-position helpers (`getDropTarget`, `getInsertType`, border-style feedback).

### Palette (`app/palette.ts`)
Single source of truth for the 8 draggable components (`text`, `table`, `row`, `col`, `image`, `checkbox`, `container`, `barcode`): `PALETTE_COMPONENTS` (id/tag/icon/accent/default `data`), `ACCENT_MAP`, `paletteComponent(id)` and `paletteData(id)` (fresh copy of the component's `data`). The palette UI (`left-bar.vue`, `ui/draggable-button.vue`), the gallery buttons (`ui/template-button.vue`) and the template builders all consume it. Labels are i18n (`editor.leftBar.components.*`; the old *Párrafo* is `text` → "Texto"/"Text"). `left-bar` swaps `data.content` for `components.defaultText` when building draggable buttons; templates always set their own content.

### Prebuilt templates (`app/templates/` + `app/components/layout/templates-gallery.vue`)
Six ready-made documents (`invoice`, `report`, `certificate`, `receipt`, `shipping-label`, `showcase`) shown as a collapsible section under the palette in the editor's left bar. Each file exports `{ id, build({ locale }) }` returning `{ schema, header, footer, data, cssCode }`; `build()` must return **fresh objects** (the store mutates what it receives) and node texts/names come from a per-file `TXT[locale]` map — UI strings of the gallery itself live in `i18n/locales/*.json` under `editor.leftBar.templates.*`.

- **Strict palette reuse**: every node goes through `makeBuilder()` (`helpers.ts`), so its `data` and classes are exactly the palette's plus an optional `tc-*` marker class; all template-specific look lives in `cssCode` = `templateCss(own)` (shared `COMMON_CSS` + own rules). Rules use `[class]` suffix selectors (specificity 0,2,0) on purpose — the Tailwind CDN of the generated document injects *after* `cssCode`, so a bare class would always lose the tie. The only markup exception is report's second table (custom `months.*` rows; palette element classes kept).
- **Barcode is a real component** (tag `barcode`, i18n `components.barcode`): `data.content` is either literal text or a *full* `{{expr}}`; in the second case `generateElementHtml` emits `{{barcode expr height}}` and the Handlebars helper registered in `app/stores/barcode.ts` returns the Code 39 SVG as a `SafeString` (literal content renders inline via `code39Svg`). `data.height` is editable in *Ajustes del componente* (`fields.height` = "Alto"). Never name a `data` key `barcode`: `{{barcode}}` in content would invoke the helper instead of resolving the value (showcase uses `demoCode`).
- **Node names are editable**: the first settings field (`fields.nodeName`) writes `node.name` via `saveDataOptions`; names render live in the canvas wrapper header. `fields.name` ("Etiqueta") is different — it edits the checkbox's `data.name`, which is its visible `<label>`.
- **Each template must fit ONE letter page in *both* locales**: EN strings run longer (the showcase intro wraps to a 2nd line), so after any spacing/CSS change re-export both locales and check `pdfinfo <file> | grep Pages` → `1`. Table cells stay at `padding: 8px 12px`.

- `app/templates/index.ts` holds `PREBUILT_TEMPLATES` (gallery order), `toTemplateLocale()` and `renderTemplateDoc(doc)` — header+body+footer concatenated with `generateLayoutHtml({ pdf: true })` + Handlebars, used as the `srcdoc` of each gallery thumbnail.
- Clicking a card calls `store.loadTemplate(doc)` (with a confirmation dialog when the canvas isn't empty): replaces the three zones + `data` + `cssCode`, pushes history and re-injects the CSS via `ensureStyleEl()`.
- Thumbnails are **iframes**, not `v-html`: injected markup never runs its `<script>` (Tailwind CDN) and `cssCode` would leak into the app as a global `<style>`.

### PDF export flow
`store.generateDocument()` → POST `/api/pdf` → `server/api/pdf.post.ts` → `withPuppeteer()` (`server/utils/puppeteer.ts`) → `page.pdf()`. PDF is `format: 'letter'`, `printBackground: true`, 10mm margins, `displayHeaderFooter` when header/footer present. Result opens in a new tab from a blob URL.

The handler lives inside the single `__fallback.func` Vercel function and is dispatched by Nitro's router — `vercel.json`'s `routes` entry for `/api/pdf` is ignored by the preset (it only reads `bunVersion` from that file) and is inert. Launch uses `puppeteer-core` only (types included); `acceptInsecureCerts` replaces the long-removed `ignoreHTTPSErrors`.

## Gotchas

- **Tailwind in exported/preview HTML is runtime-compiled**: generated HTML embeds the `@tailwindcss/browser@4` CDN script. `setContent()` no longer accepts `networkidle0` (removed from its public options in Puppeteer 25), so `pdf.post.ts` uses `waitUntil: 'load'` followed by `page.waitForNetworkIdle()` — that network settle is what gives the CDN script time to compile before printing. Don't drop it or the body prints unstyled. The **header/footer templates are the exception** — Puppeteer ignores `<style>`/scripts there, so `pdf.post.ts` converts their Tailwind classes into generated rules via `tailwind-to-style` + `node-html-parser`. Don't add `<style>` blocks to header/footer markup expecting them to work in the PDF.
- **`@sparticuz/chromium` reuses a cached binary in `/tmp/chromium`**: it only extracts when that path is absent, so after bumping the package the old Chromium keeps being used and nothing hints at it. Check the real version with `/tmp/chromium --version` (or the `Producer: Skia/PDF mNNN` string in `pdfinfo`), and delete `/tmp/chromium` to force the new one. Vercel is unaffected (fresh `/tmp` per instance), but local testing silently lies.
- **Drag-drop on SSR**: DOM listeners are bound imperatively in `templateStore._bindEventsToContainer()` on `.draggable-component` elements, re-run after each `renderPreview()` in `nextTick`. New rendered elements need this class (see `GLOBAL_COMPONENT_STYLE`) or they won't be draggable/selectable.
- **Undo only covers the body**: `pushHistory()` serializes `this.schema` alone — header/footer/data edits are not undoable. Because it records post-mutation snapshots, `undo()` bails out with fewer than two of them (`loadTemplate` pushes a snapshot of the previous canvas for that reason). Say this in any "replace the canvas" confirmation.
- **Pinia persistence**: `pinia-plugin-persistedstate` uses **sessionStorage** (24h). `persist.pick` includes `styleEl` (a DOM element ref) but excludes `selectedElement` / `selectedNode` — re-select after reload. After a reload `styleEl` deserializes to `{}`, so writing to it is a silent no-op: go through `store.ensureStyleEl()` (which `setStyleElTexContent` already calls) before injecting CSS.
- **Header/footer PDF markup is full-bleed**: `pdf.post.ts` lays it out across the whole page width while the body keeps the 10mm margins, so a `w-full` row in header/footer touches the page edge (right-aligned text looks cut off). Give those rows ~10mm of horizontal padding (`px-10`) — all six prebuilt templates do.
- **Handlebars runs exactly once**: `data` values are interpolated, never re-compiled — don't put `{{...}}` inside the data itself (it prints literally). Put the variables in the node's `content`/table markup instead.
- **Custom CSS is runtime-injected**: user CSS lives in `store.cssCode` and is written into a `<style data-dynamic-css>` element (`setStyleElTexContent`, wired by `app/components/ui/style-editor.vue`). Don't add CSS files to `nuxt.config.ts` `css` for user-editable styles.
- **`pnpm-workspace.yaml` is not a workspace** — it only exists to allow pnpm's `onlyBuiltDependencies` build scripts (`esbuild`, `@parcel/watcher`). All deps go in the root `package.json`. Also note `pnpm-lock.yaml` is gitignored.
- **Never render `tm()` leaves directly**: vue-i18n's `tm()` can return message **AST objects** on the client while SSR returns plain strings — rendering them shows raw JSON and triggers hydration mismatches. Use `tm()` only for array length/shape and resolve every leaf through `t('path.0.key')` (see `landing/features.vue`, `pricing.vue`, `faq.vue`).
- **`ui/button.vue` relies on `@theme` tokens** (`--color-primary`, `--color-ring`, `--color-background`) defined in `app/assets/css/main.css`; without them `bg-primary` etc. compile to nothing. Variants: `primary | ghost | outline` + `active` (used by the toolbar tabs in `content-header.vue`, which receives the current view as a `view` prop from `center-container.vue`).
- **Editor strings must go through i18n**, including the empty-canvas hint: it's rendered inside `v-html`, so `store.emptyHint` is set/watched on locale change in `app/pages/demo.vue` and passed into `generateLayoutHtml`.
- **Landing screenshots** (`public/screenshots/editor-*.png`) are regenerated with `pnpm screenshots` (headless Chromium, seeds a sample document via sessionStorage, hides `#nuxt-devtools-container`). The landing `<img>` tags resolve at build time — deleting a referenced screenshot breaks `pnpm build`.
- **Smoke-testing templates outside the browser**: `app/templates/index.ts` is plain TS except the `.vue` icon imports — bundle it with `node_modules/.bin/esbuild app/templates/index.ts --bundle --format=esm --platform=node --loader:.vue=empty --outfile=/tmp/x.mjs` and call `build()` / `renderTemplateDoc()` from plain node. The bundle inlines Handlebars *and* the barcode helper, so mustaches resolve; compiling with a separate Handlebars copy would not.

## Skills

- `skills/caveman/` (also under `.agents/skills/` with others) — terse communication mode. Activate: "use caveman". Deactivate: "stop caveman".
