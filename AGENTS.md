# Template Creator

Drag-and-drop PDF layout builder: single Nuxt 4 SPA package (no monorepo), wrapped as a desktop app with Tauri 2 (Rust backend + webview). Desktop only: no landing, no web deploy. Editor at `/`.

Stack: Nuxt 4 + Tailwind 4 (`@tailwindcss/vite`) + Pinia + `@nuxt/ui` 4.12; Handlebars for `store.data`; Monaco for JSON; desktop PDF generation via Tauri command → Node sidecar (`desktop/pdf-render.ts`) → `puppeteer-core` + `@sparticuz/chromium`; Postgres via Tauri command Rust (`src-tauri/src/sql.rs`, `tokio-postgres`).

## Commands

```bash
pnpm dev          # dev server del editor (http://localhost:3000)
pnpm build        # nitro build (legacy)
pnpm generate     # SPA estática → .output/public (build que consume el Tauri)
pnpm tauri:dev    # tauri dev
pnpm tauri:build  # tauri build → .deb/.appimage
pnpm desktop:prepare  # scripts/prepare-desktop.mjs (--bundle)
pnpm check:data  # adapter de datos
pnpm check:classes
```

- pnpm only (`packageManager: pnpm@10.18.3`).
- **No tests, linter, typechecker, o formatter exist.** No root `tsconfig.json`; `.nuxt/tsconfig.json` es generado por `postinstall: nuxt prepare`.
- Node `^22.22.3 || ^24.15.0 || >=26`. Para el sidecar de PDF se descarga un Node oficial (`v24.22.2` por defecto, `TC_NODE_VERSION` lo sobreescribe) y se copia a `src-tauri/binaries/pdf-render-<triple>` (gitignored).
- Sistema Linux (por ahora): `sudo dnf install webkit2gtk4.1-devel libappindicator-gtk3-devel librsvg2-devel` para compilar Tauri; Tauri no se cross-compila a Windows desde Linux.

## E2E

Drive the real UI with the **terminal-browser** skill: `terminal-browser open localhost:3000/demo --split right`, `terminal-browser ls` for tabs, then `terminal-browser action -- snapshot|click @eN|fill @eN "x"|open <url>|eval "js"`.

- Locale follows the browser (usually `en`); pin Spanish with `action -- eval "document.cookie='tc_locale=es; path=/'"` and re-`open` the URL.
- If eval fails with `SecurityError` while `location.href` is `chrome-error://chromewebdata/`, the tab is on an error page (usually after a dev-server restart): re-`open` the URL.
- Batch renders and PDF checks stay on headless puppeteer-core via the Tauri sidecar, plus the esbuild smoke test below.

## Architecture

- `app/pages/index.vue` — editor, `layout: 'editor'`, columns `layout-left-bar` / `layout-center-container` / `layout-right-bar`. Toolbar views: preview, schema (read-only Monaco), styles (CSS textarea), data (typed form or Monaco JSON; form edits are debounced 300 ms). No landing page.
- `app/stores/templateStore.ts` (`defineStore("template")`) — state: `schema` / `header` / `footer` (three independent trees whose roots are `preview` / `header` / `footer`), `data` (Handlebars context; `dataKeys` flattens dot paths for autocomplete), `cssCode`, `page`, `history` / `redoStack`. Components import the store explicitly (`templateStore()`), not via auto-import.
- `page` — Documento card in the right bar: `{ format: 'letter'|'legal'|'oficio'|'a4', orientation, margins (mm), headerRepeat, footerRepeat }`. It is persisted but **not** in undo history.
- `app/stores/template.ts` — pure render/tree helpers: `generateElementHtml`, `generateLayoutHtml`, `generateLayoutHeaderFooterHtml`, `findPathById` / `insertElementAtPath` / `removeElementAtPath`, drop-position helpers.
- **Mutation ritual** (after every schema edit): mutate → `pushHistory()` → `renderPreview()` → `updateSchemaDisplay()`. `pushHistory()` stores the **post**-mutation state; `undo()` therefore needs two entries.

### Theme and i18n

- Light/dark is a `.dark` class on `<html>` plus CSS vars in `app/assets/css/main.css` (`@custom-variant dark (&:where(.dark, .dark *))`, `@theme inline` tokens). `app/composables/useTheme.ts` syncs the `tc_theme` cookie; "system" leaves html unclassed so the CSS media query owns the colors. No color-mode dependency.
- **Paper is never themed**: the A4 canvas, palette/template `data.class`, `GLOBAL_COMPONENT_STYLE`, and the document color pickers keep real Tailwind palette classes.
- i18n: nested es/en JSON in `i18n/locales/*.json`, `strategy: 'no_prefix'`, browser detection + `tc_locale` cookie, switcher in the editor toolbar. All UI strings go through i18n, including the empty-canvas hint (`store.emptyHint`, set/watched in `app/pages/index.vue`, rendered inside `v-html`).

### Palette and templates

- `app/palette.ts` is the single source of truth for the 8 draggable components (`text`, `table`, `row`, `col`, `image`, `checkbox`, `container`, `barcode`): `PALETTE_COMPONENTS`, `ACCENT_MAP`, `paletteComponent()`, `paletteData()` (fresh copy). Labels are i18n (`editor.leftBar.components.*`).
- The 9 templates live in `app/templates/`: `invoice`, `report`, `certificate`, `contract`, `nda`, `rental`, `receipt`, `shipping-label`, `showcase`. `app/templates/index.ts` owns `PREBUILT_TEMPLATES` order, `toTemplateLocale()` and `renderTemplateDoc()`; `layout/template-select.vue` sits in the editor toolbar.
- `build({ locale })` must return **fresh objects** (the store mutates them). All visible text comes from the file's `TXT[locale]` map; add new keys to **both** locales (a missing `clause9Title` renders `undefined`).
- **Strict palette reuse**: every node goes through `makeBuilder()` (`helpers.ts`) → exact palette `data` + one optional `tc-*` marker. All template-specific styling lives in `cssCode = templateCss(own)`; rules use `[class]` suffix selectors (specificity 0,2,0) because the document's runtime Tailwind script injects **after** `cssCode`, so bare classes would lose. Only report's second table uses custom `months.*` markup.
- **Two similar settings fields**: `fields.nodeName` edits `node.name` (the canvas label); `fields.name` edits the checkbox's visible `data.name` label. Don't conflate them.
- Legal trio (`contract`, `nda`, `rental`) share `LEGAL_CSS` and structure: 10 numbered clauses, closing paragraph, 2-column signature block (`.tc-sign-line` holds the 46 px signing gap), no checkbox.
- **Page budget**: every non-legal template = exactly 1 letter page in **both** locales; legal trio = exactly 2. After spacing/CSS changes export both locales and check `pdfinfo <file> | grep Pages`. Don't shrink table cell padding (report/showcase: `8px 12px`; receipt: `8px`).
- Selecting a template replaces schema/header/footer/data/`cssCode`; it asks for confirmation only when the canvas has content, and cancel restores the last applied id. Thumbnails are `<iframe :srcdoc>` — `v-html` would leak `cssCode` globally and never run the Tailwind script.

### PDF export

`store.generateDocument()` → construye el payload (body: `html`, `header`, `footer`, `css`, `page`) → `invoke("export_pdf", { payload })` → `src-tauri/src/pdf.rs::export_pdf` → sidecar `src-tauri/resources/pdf-render.cjs` (Node + bundle de `desktop/pdf-render.ts` con esbuild) → `puppeteer-core` + `@sparticuz/chromium` (`src-tauri/resources/chromium`) → `page.pdf()` → diálogo nativo de guardado (plugin-dialog Tauri) → ruta de destino. No hay HTTP: el diálogo lo decide el backend y devuelve la ruta.

- Formats: `letter` / `legal` / `a4` use puppeteer's `format`. **`oficio` (216×330 mm) is not in that map**, so `CUSTOM_PAGE_MM` sends explicit `width`/`height`.
- `page.headerRepeat` / `footerRepeat` (default `true`): **on** → zone becomes Chromium's `headerTemplate`/`footerTemplate`, measured first; vertical margin = `max(configured, measured + 2 mm)` clamped 8–60 mm. **Off** → zone is injected in flow (header after `<body>`, footer before `</body>`) with negative left/right margins, so pages 2+ reserve no space and the footer lands on the last page.
- `displayHeaderFooter` only when at least one zone repeats; the other side gets `<span></span>` to suppress Chromium's defaults.
- Header/footer are laid out **full-bleed** (page width, no left/right margin) while the body keeps margins — their rows need `tc-pagepad` (~40 px side padding) or right-aligned text is clipped.
- `page.pdf()` has no `orientation` option in puppeteer-core 25: pass `landscape: boolean` (unknown options are silently ignored). Derive measurement width from format + orientation (`pageWidthPx`).

## Data sources

Data tab → **Source** loads a REST endpoint or a Postgres query straight into `store.data` (the Handlebars context). Nothing else about the document changes.

- `app/stores/data-source.ts` is the pure adapter: `adaptData(payload, map)` + `resolvePath`. The map is JSON: `string` = source path (`rows[0].customer_name`), array/primitive = literal, `{ from, select }` = rows matrix. Empty map = payload as-is. Values come back as text (Postgres simple query protocol), so dates come as `YYYY-MM-DD`.
- REST is fetched by the browser (no proxy), so CORS is the API's responsibility. Headers/API keys live in `dataSecrets` and are never persisted; `loadTemplate()` replaces `data`, not `dataSource`.
- `invoke("run_sql", { request })` → `src-tauri/src/sql.rs::run_sql`: `tokio-postgres` + `tokio-postgres-rustls` (webpki-roots), `simple_query`, 8 s connect / 15 s query / 10 s statement, 1000-row cap. No server, no rate limit, no SSRF guard (the app is local; the user is the one writing the query).
- `missingTemplatePaths()` warns about `{{paths}}` used by the templates that the adapted data does not provide (block sections are skipped). `pnpm check:data` covers the adapter.

## Gotchas

- **The Tailwind runtime script is vendored** in `public/vendor/tailwind.js` (from `@tailwindcss/browser`, copied by `scripts/prepare-desktop.mjs`, runs on postinstall). `useHead` in `app/pages/index.vue` loads it; the preview is `v-html`, and the template thumbnails are `<iframe :srcdoc>` which resolves it against the parent. The PDF sidecar (`desktop/pdf-render.ts`) replaces `<script src="${TAILWIND_URL}"></script>` with the file content before `setContent`.
- **Exported/preview HTML is styled at runtime** by the vendored Tailwind script: `setContent(html, { waitUntil: 'load' })` must be followed by `waitForNetworkIdle()` before `page.pdf()` or the body prints unstyled.
- **Header/footer templates cannot use `<style>` or scripts in the PDF** (Chromium ignores them). `desktop/pdf-render.ts` converts their classes with `tailwind-to-style` + `node-html-parser`, injects user CSS, and resets Chromium's ~1 px root font so rem-based Tailwind classes work.
- **`@sparticuz/chromium` caches its binary at `/tmp/chromium`** and never re-extracts. After bumping the package, delete it; verify with `/tmp/chromium --version` or the `Producer: Skia/PDF mNNN` line from `pdfinfo`. Vercel gets a fresh `/tmp`, so local testing can silently lie.
- **Undo covers the body only**: `pushHistory()` serializes `schema` alone (not header/footer/`data`/`page`). It stores post-mutation state, so `undo()` needs two snapshots. State this in any "replace canvas" confirmation.
- **Persistence is sessionStorage** (`pinia-plugin-persistedstate`, 24 h). `styleEl` is persisted but deserializes to `{}` after reload, so writing to it is a silent no-op — always go through `store.ensureStyleEl()` (or `setStyleElTexContent`). `selectedElement` / `selectedNode` are not persisted; re-select after reload.
- **Drag-drop on SSR**: listeners are bound imperatively in `templateStore._bindEventsToContainer()` on `.draggable-component` elements after each `renderPreview()` in `nextTick`. Any new rendered node needs that class (see `GLOBAL_COMPONENT_STYLE`) or it is not draggable/selectable.
- **Handlebars runs once**: `data` values are interpolated, never re-compiled — don't put `{{...}}` inside `store.data` (it prints literally); put variables in node content/table markup. Barcode `content` is literal text or a **full** `{{expr}}`; never name a data key `barcode` or the helper wins over the value.
- **User CSS is runtime-injected** into `<style data-dynamic-css>` (`style-editor.vue` → `setStyleElTexContent`). Don't add user-editable CSS to `nuxt.config.ts` `css`.
- **Never render `tm()` leaves directly**: vue-i18n can return AST objects on the client and plain strings on SSR → raw JSON and hydration mismatches. Use `tm()` only for shape/length and resolve leaves with `t('path.0.key')`.
- **Nuxt UI v4.12**: `UModal` needs `v-model:open` (plain `v-model` never opens) and its **default slot is the trigger** — content goes in `#body`/`#footer`. `USelect` triggers are `inline-flex`; set an explicit width (`w-[170px]`). Its hidden native `<select>` ignores synthetic `change`, so tests click `[role=option]`. **Don't override `--ui-radius`** — it scales the entire Tailwind radius scale. Toolbar tabs switch `variant` (`solid`/`ghost`), not an `active` prop.
- **`ui/input.vue`** wraps `UInput`/`UTextarea`/`UCheckbox`: `type="number"` emits `Number`, checkbox emits **real booleans** (the preview tests `data.value ? 'checked'`), `@blur` call sites attach to the declared `onBlur` prop, and `accept` (not the old `acepted` typo) reaches file inputs. Ids come from `useId()`; never restore a shared `default` id or every label points at the first field.
- **Screenshots are build inputs**: the landing `<img>` paths resolve at build time, so deleting one breaks `pnpm build`. Regenerate all 8 with `pnpm screenshots` (light keeps the original filenames; dark adds `-dark`).
- **Smoke-test templates outside the browser**: `node_modules/.bin/esbuild app/templates/index.ts --bundle --format=esm --platform=node --loader:.vue=empty --outfile=/tmp/x.mjs`, then call `build()` / `renderTemplateDoc()` from Node. It inlines Handlebars and the barcode helper, so mustaches resolve.

## Security

The PDF renderer is local-only (Tauri command → sidecar, invoked by the desktop app), so the old public-endpoint SSRF machinery is gone. The sidecar writes the document payload to a temp file and lets Chromium render it; nothing leaves the machine.

- Do **not** reintroduce network access into the sidecar (`desktop/pdf-render.ts`): `<script>fetch('http://169.254.169.254/…')</script>` could turn a local render into an SSRF channel. If remote content is ever needed, re-add `blockPrivateRequests()` + `server/utils/allow-public-url.ts`; the IPv4-mapped IPv6 deny-list details remain valid.
- The Tailwind script is vendored, so no third-party JS runs at render time. There is no `routeRules` anymore (no Nitro); the desktop window relies on Tauri's default security.
- Database credentials are passed to the Rust command and never persisted or logged.

## Skills

`.agents/skills/` holds the installed skills (caveman, nuxt, nuxt-ui, tailwind, …), pinned by `skills-lock.json`. Activate caveman with "use caveman"; deactivate with "stop caveman".
