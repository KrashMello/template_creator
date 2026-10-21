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

### Theme (light/dark, arctic palette)
Same mechanism as krashmello.vercel.app: `.dark` class on `<html>` + CSS vars.
- `app/assets/css/main.css` — `@custom-variant dark (&:where(.dark, .dark *))`, `@theme inline` tokens (`bg-surface`, `bg-surface-alt`, `text-content`, `text-content-muted`, `accent`, `primary*`, `ring`, `danger`, `nord-*`, `aurora-green`) bound to vars defined in `:root` (light) and `.dark` (dark), plus `@media (prefers-color-scheme: dark) { :root:not(.light) }` so "system" needs no class/JS. `--color-background` stays `#ffffff` on purpose.
- `app/composables/useTheme.ts` — `useState('tc-theme')` + cookie `tc_theme` (`system|light|dark`, 1 year); `app.vue` renders the `dark`/`light` html class from its `resolved` state (SSR-safe, no flash): while "system" is unresolved the html is unclassed (the CSS media query owns the colors) and the client sets the class after resolving the OS preference — that class is what makes every `dark:`-based swap (logo, screenshots) work in system mode. Toggle: `app/components/ui/theme-toggle.vue` (sun/moon, `common.theme` i18n), in the site header and the editor toolbar. No color-mode dependency.
- **Paper is never themed**: the A4 canvas, its zone markup, `data.class` of the palette/templates, `GLOBAL_COMPONENT_STYLE` and the document-color pickers (`presetColors` in `right-bar.vue`, the `TEXT_COLORS`-style lists) keep real Tailwind palette classes — they render on white paper.
- Theme-matched assets: `public/logo-light.png`/`logo-dark.png` (krashmello pair, `dark:hidden`/`hidden dark:block`) and the landing screenshots (`editor-*.png` + `editor-*-dark.png`, both captured by `scripts/capture-screenshots.mjs`, which loops the `tc_theme` cookie; light keeps the original filenames the landing already referenced).

### Three-zone PDF layout
Canvas has **header / body / footer** zones (`SectionType = "body" | "footer" | "header"`). Each zone is a separate schema tree (`schema`, `header`, `footer` in the store); components can be dropped into any zone.

### State: `app/stores/templateStore.ts` (store name `"template"`)
- `schema` / `header` / `footer` — element trees (root nodes have `id: "preview"` / `"header"` / `"footer"`)
- `history` / `redoStack` — undo/redo, 50 steps
- `data` — Handlebars context; `dataKeys` getter flattens its dot-notation keys for autocomplete
- `page` — PDF page settings edited by the *Documento* card in the right bar: `{ format: 'letter'|'legal'|'oficio'|'a4', orientation: 'portrait'|'landscape', margins: {top,right,bottom,left} (mm), headerRepeat, footerRepeat }`. Defaults reproduce the historical export (letter/portrait/10mm/both repeating). It is **not** part of `history` (undo only covers the body) but it *is* persisted and shown in the Schema view.
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
Single source of truth for the 8 draggable components (`text`, `table`, `row`, `col`, `image`, `checkbox`, `container`, `barcode`): `PALETTE_COMPONENTS` (id/tag/icon/accent/default `data`), `ACCENT_MAP`, `paletteComponent(id)` and `paletteData(id)` (fresh copy of the component's `data`). The palette UI (`left-bar.vue`, `ui/draggable-button.vue`) and the template builders all consume it. Labels are i18n (`editor.leftBar.components.*`; the old *Párrafo* is `text` → "Texto"/"Text"). `left-bar` swaps `data.content` for `components.defaultText` when building draggable buttons; templates always set their own content.

### Prebuilt templates (`app/templates/` + `app/components/layout/template-select.vue`)
Nine ready-made documents (`invoice`, `report`, `certificate`, `contract`, `nda`, `rental`, `receipt`, `shipping-label`, `showcase`) listed in a `<select>` in the editor's central nav (`content-header.vue` renders `layout-template-select`, between the undo/redo buttons and the right-side group). Each file exports `{ id, build({ locale }) }` returning `{ schema, header, footer, data, cssCode }`; `build()` must return **fresh objects** (the store mutates what it receives) and node texts/names come from a per-file `TXT[locale]` map — UI strings of the select itself live in `i18n/locales/*.json` under `editor.templates.*` (`items.<id>.title` for the option labels, `placeholder` for the empty option).

The three legal templates (`contract`, `nda`, `rental`) are clones in structure (header wordmark → title + `metaLine` → preamble → 10 numbered clauses → closing paragraph → 2-column signature block → footer; **no checkbox**) and share `LEGAL_CSS` from `app/templates/helpers.ts`, which also defines the `tc-sign-*` rules: `.tc-sign-line` carries `margin-top: 46px`, i.e. the blank space the person signs on, with the line right above the name. Their signature rows are written inline (no factory), so the node names stay localized per file. Each `clause(n, title, text)` helper call must be mirrored in **both** locales — a missing `clause9Title`/`clause10Title` key renders `undefined`.

- **Strict palette reuse**: every node goes through `makeBuilder()` (`helpers.ts`), so its `data` and classes are exactly the palette's plus an optional `tc-*` marker class; all template-specific look lives in `cssCode` = `templateCss(own)` (shared `COMMON_CSS` + own rules). Rules use `[class]` suffix selectors (specificity 0,2,0) on purpose — the Tailwind CDN of the generated document injects *after* `cssCode`, so a bare class would always lose the tie. The only markup exception is report's second table (custom `months.*` rows; palette element classes kept).
- **Barcode is a real component** (tag `barcode`, i18n `components.barcode`): `data.content` is either literal text or a *full* `{{expr}}`; in the second case `generateElementHtml` emits `{{barcode expr height}}` and the Handlebars helper registered in `app/stores/barcode.ts` returns the Code 39 SVG as a `SafeString` (literal content renders inline via `code39Svg`). `data.height` is editable in *Ajustes del componente* (`fields.height` = "Alto"). Never name a `data` key `barcode`: `{{barcode}}` in content would invoke the helper instead of resolving the value (showcase uses `demoCode`).
- **Node names are editable**: the first settings field (`fields.nodeName`) writes `node.name` via `saveDataOptions`; names render live in the canvas wrapper header. `fields.name` ("Etiqueta") is different — it edits the checkbox's `data.name`, which is its visible `<label>`.
- **Each template must fit ONE letter page in *both* locales** — except the three legal ones (`contract`, `nda`, `rental`), which must fill **exactly 2 pages** (10 clauses each, page 2 ends with the closing paragraph + signature block): EN strings run longer (the showcase intro wraps to a 2nd line), so after any spacing/CSS change re-export both locales and check `pdfinfo <file> | grep Pages` → `1` (→ `2` for the legal trio). Table cells stay at `padding: 8px 12px`.

- `app/templates/index.ts` holds `PREBUILT_TEMPLATES` (select order), `toTemplateLocale()` and `renderTemplateDoc(doc)` — header+body+footer concatenated with `generateLayoutHtml({ pdf: true })` + Handlebars, used as the `srcdoc` of the confirmation dialog thumbnail.
- Choosing an option calls `store.loadTemplate(doc)` (with a confirmation dialog when the canvas isn't empty): replaces the three zones + `data` + `cssCode`, pushes history and re-injects the CSS via `ensureStyleEl()`. On cancel the select restores the last applied template id.
- Thumbnails are **iframes**, not `v-html`: injected markup never runs its `<script>` (Tailwind CDN) and `cssCode` would leak into the app as a global `<style>`.

### PDF export flow
`store.generateDocument()` → POST `/api/pdf` (body: `html`, `header`, `footer`, `css`, `page`) → `server/api/pdf.post.ts` → `withPuppeteer()` (`server/utils/puppeteer.ts`) → `page.pdf()`. PDF uses `store.page` (`format`, `landscape`, `printBackground: true`) and the configured margins; result opens in a new tab from a blob URL.

Formats: `letter`, `legal` and `a4` go through puppeteer's `format` (`paperFormats`); **`oficio` (216×330mm) isn't in that map**, so `pdf.post.ts` sends explicit `width`/`height` from `CUSTOM_PAGE_MM` instead (`landscape` still rotates it — puppeteer passes paper size and `landscape` to CDP separately). Chromium quantizes the physical size to its px grid, so a measured `pdfinfo` page may be ~0.5mm off the nominal size for non-integer-inch formats (A4 included) — pre-existing, harmless.

Each zone has two modes, decided by its `*Repeat` checkbox (`page.headerRepeat` / `page.footerRepeat`, default `true`):

- **Repeat (on)** — zone → `headerTemplate`/`footerTemplate`, so Chromium prints it on every page full-bleed; it is measured first (`measureTemplateHeight`) and the vertical margin becomes `max(configured, measured + 2mm)` clamped to 8–60mm (`verticalMarginFor`). Only repeating zones are measured (skipping the measurement halves the export time when both are off).
- **First-page-only (off)** — zone is injected into the body HTML by `injectZoneInFlow()` (header right after `<body>`, footer before `</body>`) inside a wrapper with `-left/-right` mm negative margins so it keeps the full-bleed width; its page margin stays at the configured value, so **pages 2+ don't reserve space** for the header and the footer lands at the end of the content (i.e. the *last* page in multipage documents — chosen trade-off, there is no per-page footer outside the margin box).
- `displayHeaderFooter` is set only when at least one zone repeats; the other side gets `'<span></span>'` to suppress Chromium's own defaults. Legacy payloads without `page` behave exactly as before (letter/portrait/10mm/repeating).

The handler lives inside the single `__fallback.func` Vercel function and is dispatched by Nitro's router — `vercel.json`'s `routes` entry for `/api/pdf` is ignored by the preset (it only reads `bunVersion` from that file) and is inert. Launch uses `puppeteer-core` only (types included); `acceptInsecureCerts` replaces the long-removed `ignoreHTTPSErrors`.

## Gotchas

- **The `@tailwindcss/browser@4` CDN script belongs to `/demo` only** (`useHead` in `app/pages/demo.vue`) because the preview markup is injected with `v-html`. Its default `dark:` variant is *media*-based, so if it ever loads globally it compiles a second utilities sheet that overrides the app's class-based `dark:` rules (with OS dark + light theme, `dark:hidden` elements vanish). That page registers `@custom-variant dark (&:where(.dark, .dark *))` in a `<style type="text/tailwindcss">` so the CDN agrees with the app. Don't move the script back into `nuxt.config.ts`'s global head.

- **Tailwind in exported/preview HTML is runtime-compiled**: generated HTML embeds the `@tailwindcss/browser@4` CDN script. `setContent()` no longer accepts `networkidle0` (removed from its public options in Puppeteer 25), so `pdf.post.ts` uses `waitUntil: 'load'` followed by `page.waitForNetworkIdle()` — that network settle is what gives the CDN script time to compile before printing. Don't drop it or the body prints unstyled. The **header/footer templates are the exception** — Puppeteer ignores `<style>`/scripts there, so `pdf.post.ts` converts their Tailwind classes into generated rules via `tailwind-to-style` + `node-html-parser`. Don't add `<style>` blocks to header/footer markup expecting them to work in the PDF.
- **`@sparticuz/chromium` reuses a cached binary in `/tmp/chromium`**: it only extracts when that path is absent, so after bumping the package the old Chromium keeps being used and nothing hints at it. Check the real version with `/tmp/chromium --version` (or the `Producer: Skia/PDF mNNN` string in `pdfinfo`), and delete `/tmp/chromium` to force the new one. Vercel is unaffected (fresh `/tmp` per instance), but local testing silently lies.
- **Drag-drop on SSR**: DOM listeners are bound imperatively in `templateStore._bindEventsToContainer()` on `.draggable-component` elements, re-run after each `renderPreview()` in `nextTick`. New rendered elements need this class (see `GLOBAL_COMPONENT_STYLE`) or they won't be draggable/selectable.
- **Undo only covers the body**: `pushHistory()` serializes `this.schema` alone — header/footer/data/`page` edits are not undoable. Because it records post-mutation snapshots, `undo()` bails out with fewer than two of them (`loadTemplate` pushes a snapshot of the previous canvas for that reason). Say this in any "replace the canvas" confirmation.
- **Pinia persistence**: `pinia-plugin-persistedstate` uses **sessionStorage** (24h). `persist.pick` includes `styleEl` (a DOM element ref) but excludes `selectedElement` / `selectedNode` — re-select after reload. After a reload `styleEl` deserializes to `{}`, so writing to it is a silent no-op: go through `store.ensureStyleEl()` (which `setStyleElTexContent` already calls) before injecting CSS.
- **Header/footer PDF markup is full-bleed**: `pdf.post.ts` lays it out across the whole page width while the body keeps the configured left/right margins, so a `w-full` row in header/footer touches the page edge (right-aligned text looks cut off). Give those rows ~10mm of horizontal padding (`px-10`) — all nine prebuilt templates do. This holds in both modes: the in-flow wrapper of a non-repeating zone carries negative left/right margins for the same reason.
- **Handlebars runs exactly once**: `data` values are interpolated, never re-compiled — don't put `{{...}}` inside the data itself (it prints literally). Put the variables in the node's `content`/table markup instead.
- **Custom CSS is runtime-injected**: user CSS lives in `store.cssCode` and is written into a `<style data-dynamic-css>` element (`setStyleElTexContent`, wired by `app/components/ui/style-editor.vue`). Don't add CSS files to `nuxt.config.ts` `css` for user-editable styles.
- **`pnpm-workspace.yaml` is not a workspace** — it only exists to allow pnpm's `onlyBuiltDependencies` build scripts (`esbuild`, `@parcel/watcher`). All deps go in the root `package.json`. `pnpm-lock.yaml` **is committed** — Vercel detects pnpm from it and runs `pnpm install`; without it Vercel fell back to `npm install` and died on an unresolvable `vite@8`↔`esbuild@0.25` peer conflict (from `@nuxtjs/i18n`). Keep it in sync (`pnpm install --frozen-lockfile`) and never re-ignore it.
- **Never render `tm()` leaves directly**: vue-i18n's `tm()` can return message **AST objects** on the client while SSR returns plain strings — rendering them shows raw JSON and triggers hydration mismatches. Use `tm()` only for array length/shape and resolve every leaf through `t('path.0.key')` (see `landing/features.vue`, `pricing.vue`, `faq.vue`).
- **`ui/button.vue` relies on `@theme` tokens** (`--color-primary`, `--color-ring`, `--color-background`) defined in `app/assets/css/main.css`; without them `bg-primary` etc. compile to nothing. Variants: `primary | ghost | outline` + `active` (used by the toolbar tabs in `content-header.vue`, which receives the current view as a `view` prop from `center-container.vue`).
- **Editor strings must go through i18n**, including the empty-canvas hint: it's rendered inside `v-html`, so `store.emptyHint` is set/watched on locale change in `app/pages/demo.vue` and passed into `generateLayoutHtml`.
- **Landing screenshots** (`public/screenshots/editor-*.png`) are regenerated with `pnpm screenshots` (headless Chromium, seeds a sample document via sessionStorage, hides `#nuxt-devtools-container`). The landing `<img>` tags resolve at build time — deleting a referenced screenshot breaks `pnpm build`.
- **Smoke-testing templates outside the browser**: `app/templates/index.ts` is plain TS except the `.vue` icon imports — bundle it with `node_modules/.bin/esbuild app/templates/index.ts --bundle --format=esm --platform=node --loader:.vue=empty --outfile=/tmp/x.mjs` and call `build()` / `renderTemplateDoc()` from plain node. The bundle inlines Handlebars *and* the barcode helper, so mustaches resolve; compiling with a separate Handlebars copy would not.
- **`page.pdf()` has no `orientation` option in puppeteer-core 25**: pass `landscape: boolean`. An unknown option is ignored silently, so the export just comes out portrait — set it from `page.orientation` (`pdf.post.ts`), and derive the measurement width from format+orientation (`pageWidthPx`), not a hardcoded letter width.
- **`ui/input.vue` ids come from Vue's `useId()`**: a `defineProps` `default` is evaluated once per component *definition*, so the old `crypto.randomUUID()` default made every input share one id and all `<label for>` point at the first field (broken accessible names and focus). Pass `id` explicitly only to override; never reintroduce a shared default.

## Skills

- `skills/caveman/` (also under `.agents/skills/` with others) — terse communication mode. Activate: "use caveman". Deactivate: "stop caveman".
