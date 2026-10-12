# Template Creator — Agents

Drag-and-drop PDF layout builder. Single-package Nuxt app; no monorepo.

## Stack

- **Nuxt 4** (SSR) + **Pinia** (Options API stores) + **Tailwind 4** (via `@tailwindcss/vite`)
- **Puppeteer-core** + `@sparticuz/chromium` — server-side PDF generation
- **Handlebars** — injects `store.data` into templates at preview and export time
- **Monaco Editor** (`@monaco-editor/loader`) — JSON schema/data editing
- **Vercel** deploy target (`nitro.preset: 'vercel'`; output in `.vercel/output`)

Unused declared deps (don't go looking for their integration): `better-sqlite3` (no DB code, no `kanban.db`), `@nuxt/content`.

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
`store.generateDocument()` → POST `/api/pdf` (route also pinned in `vercel.json`) → `server/api/pdf.post.ts` → `withPuppeteer()` (`server/utils/puppeteer.ts`) → `page.pdf()`. PDF is `format: 'letter'`, `printBackground: true`, 10mm margins, `displayHeaderFooter` when header/footer present. Result opens in a new tab from a blob URL.

## Gotchas

- **Tailwind in exported/preview HTML is runtime-compiled**: generated HTML embeds the `@tailwindcss/browser@4` CDN script. Puppeteer waits for `networkidle0` so it compiles before printing. The **header/footer templates are the exception** — Puppeteer ignores `<style>`/scripts there, so `pdf.post.ts` converts their Tailwind classes to inline `style` via `tailwind-to-style` + `node-html-parser`. Don't add `<style>` blocks to header/footer markup expecting them to work in the PDF.
- **Drag-drop on SSR**: DOM listeners are bound imperatively in `templateStore._bindEventsToContainer()` on `.draggable-component` elements, re-run after each `renderPreview()` in `nextTick`. New rendered elements need this class (see `GLOBAL_COMPONENT_STYLE`) or they won't be draggable/selectable.
- **Undo only covers the body**: `pushHistory()` serializes `this.schema` alone — header/footer edits are not undoable.
- **Pinia persistence**: `pinia-plugin-persistedstate` uses **sessionStorage** (24h). `persist.pick` includes `styleEl` (a DOM element ref) but excludes `selectedElement` / `selectedNode` — re-select after reload.
- **Custom CSS is runtime-injected**: user CSS lives in `store.cssCode` and is written into a `<style data-dynamic-css>` element (`setStyleElTexContent`, wired by `app/components/ui/style-editor.vue`). Don't add CSS files to `nuxt.config.ts` `css` for user-editable styles.
- **`pnpm-workspace.yaml` is not a workspace** — it only exists to allow pnpm's `onlyBuiltDependencies` build scripts (`better-sqlite3`, `esbuild`, `puppeteer`, `@parcel/watcher`). All deps go in the root `package.json`. Also note `pnpm-lock.yaml` is gitignored.

## Skills

- `skills/caveman/` (also under `.agents/skills/` with others) — terse communication mode. Activate: "use caveman". Deactivate: "stop caveman".
