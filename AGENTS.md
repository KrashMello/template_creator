# Template Creator — Agents

Drag-and-drop PDF layout builder. Single-package Nuxt app; no monorepo.

## Stack

- **Nuxt 4** (SSR) + **Pinia** (Options API stores) + **Tailwind 4** (via `@tailwindcss/vite`)
- **Puppeteer-core** + `@sparticuz/chromium` — server-side PDF generation
- **Handlebars** — injects `store.data` into templates at preview and export time
- **Monaco Editor** (`@monaco-editor/loader`) — JSON schema/data editing
- **Vercel** deploy target (`nitro.preset: 'vercel'`; output in `.vercel/output`)

**Node >= 22.21** (Nuxt 4.6 ships `@nuxt/cli` v4; `puppeteer-core` 25 needs >=22.12, `@sparticuz/chromium` 153 needs ^22.17 || >=24). The Vercel function runtime is auto-picked from the build machine's Node, capped at `[18, 20, 22]` — keep the project on Node 22.x or the chromium binary won't start at runtime.

## Commands

```bash
pnpm dev      # dev server
pnpm build    # nitro build → .vercel/output
pnpm generate # static generate
pnpm preview  # preview build
```

**No tests, linter, typechecker, or formatter exist.** Don't hunt for them; `pnpm build` is the only verification step. No root `tsconfig.json` — Nuxt generates `.nuxt/tsconfig.json` via `postinstall: nuxt prepare`.

## Architecture

### Three-zone PDF layout
Canvas has **header / body / footer** zones (`SectionType = "body" | "footer" | "header"`). Each zone is a separate schema tree (`schema`, `header`, `footer` in the store); components can be dropped into any zone.

### State: `app/stores/templateStore.ts` (store name `"template"`)
- `schema` / `header` / `footer` — element trees (root nodes have `id: "preview"` / `"header"` / `"footer"`)
- `history` / `redoStack` — undo/redo, 50 steps
- `data` — Handlebars context; `dataKeys` getter flattens its dot-notation keys for autocomplete
- Components import the store directly (`import { templateStore } from '../stores/templateStore'`), not via auto-import

Schema mutation pattern (repeat after every change):
`pushHistory()` → mutate → `renderPreview()` → `updateSchemaDisplay()`

### Schema tree (`app/stores/template.ts` types + helpers)
```ts
interface ElementDataSet {
  id: string;
  tag: string;  // handled: p, div, table, img, checkbox
  name: string;
  data: Record<string, any>;  // class, content, src, table.cols/rows (Handlebars markup)
  children: ElementDataSet[];
}
```

`app/stores/template.ts` holds pure helpers used by the store: `generateElementHtml` (recursive render), `generateLayoutHtml` (full HTML doc for preview/body PDF), `generateLayoutHeaderFooterHtml` (bare markup for header/footer zones), tree ops (`findPathById`, `insertElementAtPath`, `removeElementAtPath`, ...), and drop-position helpers (`getDropTarget`, `getInsertType`, border-style feedback).

### PDF export flow
`store.generateDocument()` → POST `/api/pdf` → `server/api/pdf.post.ts` → `withPuppeteer()` (`server/utils/puppeteer.ts`) → `page.pdf()`. PDF is `format: 'letter'`, `printBackground: true`, 10mm margins, `displayHeaderFooter` when header/footer present. Result opens in a new tab from a blob URL.

The handler lives inside the single `__fallback.func` Vercel function and is dispatched by Nitro's router — `vercel.json`'s `routes` entry for `/api/pdf` is ignored by the preset (it only reads `bunVersion` from that file) and is inert. Launch uses `puppeteer-core` only (types included); `acceptInsecureCerts` replaces the long-removed `ignoreHTTPSErrors`.

## Gotchas

- **Tailwind in exported/preview HTML is runtime-compiled**: generated HTML embeds the `@tailwindcss/browser@4` CDN script. `setContent()` no longer accepts `networkidle0` (removed from its public options in Puppeteer 25), so `pdf.post.ts` uses `waitUntil: 'load'` followed by `page.waitForNetworkIdle()` — that network settle is what gives the CDN script time to compile before printing. Don't drop it or the body prints unstyled. The **header/footer templates are the exception** — Puppeteer ignores `<style>`/scripts there, so `pdf.post.ts` converts their Tailwind classes into generated rules via `tailwind-to-style` + `node-html-parser`. Don't add `<style>` blocks to header/footer markup expecting them to work in the PDF.
- **`@sparticuz/chromium` reuses a cached binary in `/tmp/chromium`**: it only extracts when that path is absent, so after bumping the package the old Chromium keeps being used and nothing hints at it. Check the real version with `/tmp/chromium --version` (or the `Producer: Skia/PDF mNNN` string in `pdfinfo`), and delete `/tmp/chromium` to force the new one. Vercel is unaffected (fresh `/tmp` per instance), but local testing silently lies.
- **Drag-drop on SSR**: DOM listeners are bound imperatively in `templateStore._bindEventsToContainer()` on `.draggable-component` elements, re-run after each `renderPreview()` in `nextTick`. New rendered elements need this class (see `GLOBAL_COMPONENT_STYLE`) or they won't be draggable/selectable.
- **Undo only covers the body**: `pushHistory()` serializes `this.schema` alone — header/footer edits are not undoable.
- **Pinia persistence**: `pinia-plugin-persistedstate` uses **sessionStorage** (24h). `persist.pick` includes `styleEl` (a DOM element ref) but excludes `selectedElement` / `selectedNode` — re-select after reload.
- **Custom CSS is runtime-injected**: user CSS lives in `store.cssCode` and is written into a `<style data-dynamic-css>` element (`setStyleElTexContent`, wired by `app/components/ui/style-editor.vue`). Don't add CSS files to `nuxt.config.ts` `css` for user-editable styles.
- **`pnpm-workspace.yaml` is not a workspace** — it only exists to allow pnpm's `onlyBuiltDependencies` build scripts (`esbuild`, `@parcel/watcher`). All deps go in the root `package.json`. Also note `pnpm-lock.yaml` is gitignored.

## Skills

- `skills/caveman/` (also under `.agents/skills/` with others) — terse communication mode. Activate: "use caveman". Deactivate: "stop caveman".
