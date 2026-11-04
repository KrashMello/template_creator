# Template Creator

Constructor visual de plantillas PDF: se arrastran componentes sobre un lienzo tipo
documento, se enlaza un contexto de datos (Handlebars) y se exporta a PDF. Se empaqueta
como aplicación de escritorio (Nuxt 4 SPA + Tauri 2). El editor vive en `/`; no hay
landing page ni deploy web.

Detalles de arquitectura e internals: ver [`AGENTS.md`](./AGENTS.md).

## Features

- 8 componentes arrastrables: `text`, `table`, `row`, `col`, `image`, `checkbox`,
  `container`, `barcode`.
- 9 plantillas predefinidas: invoice, report, certificate, contract, nda, rental,
  receipt, shipping-label y showcase.
- Encabezado y pie independientes, con repetición opcional en cada página.
- Contexto de datos vía Handlebars (formulario tipado o Monaco JSON).
- Carga de datos desde un endpoint REST o una consulta PostgreSQL.
- Export a PDF generado localmente con Chromium.

## Requirements

- Node `^22.22.3 || ^24.15.0 || >=26` y pnpm `10.18.3`.
- Rust y las dependencias de Tauri. En Linux:

  ```bash
  sudo dnf install webkit2gtk4.1-devel libappindicator-gtk3-devel librsvg2-devel
  ```

- Sistema Linux (por ahora). Tauri no se cross-compila a Windows desde Linux.

## Getting started

```bash
pnpm install      # corre nuxt prepare y prepare-desktop
pnpm dev          # editor en http://localhost:3000
pnpm tauri:dev    # abre la ventana nativa
```

## Desktop build

```bash
pnpm generate         # SPA estática → .output/public
pnpm desktop:prepare  # descarga Node + Chromium y arma el sidecar del PDF
pnpm tauri:build      # produce .deb / .appimage
```

`pnpm build` (build de Nitro) es legacy.

## Data sources

En la pestaña **Data → Source** se carga un endpoint REST o una consulta PostgreSQL
directo a `store.data`.

1. Elegir **REST** o **PostgreSQL**.
2. REST: URL, método, headers opcionales (`Name: value` por línea) y ruta de la
   respuesta. SQL: host, puerto, base, usuario, contraseña y una query.
3. **Load data** reemplaza `store.data`; la respuesta cruda aparece en **Response** y se
   listan las rutas `{{...}}` que falten.
4. Ajustar el mapa hasta que no haya warnings y volver a Preview/Export.

PokeAPI (`/pokemon/ditto`, ruta de respuesta vacía):

```json
{
  "name": "name",
  "pokemon.type": "types[0].type.name",
  "table.cols": ["Stat", "Value"],
  "table.rows": { "from": "stats", "select": ["stat.name", "base_stat"] }
}
```

Odoo (`select id, login from res_users limit 5`; el payload SQL es `{ rows }`):

```json
{ "table.cols": ["ID", "Login"], "table.rows": { "from": "rows", "select": ["id", "login"] } }
```

Las contraseñas y los headers **no se persisten**.

## Checks

```bash
pnpm check:data     # adapter de datos
pnpm check:classes  # clases de celdas de tabla
```

## Project layout

```
app/                 editor Nuxt (pages, stores, palette, templates)
desktop/             pdf-render.ts (sidecar Node del PDF)
src-tauri/           backend Rust (export_pdf, run_sql) y config de Tauri
scripts/             prepare-desktop.mjs y checks
i18n/                locales es/en
public/vendor/       tailwind.js vendorizado (copiado en postinstall)
```

## Branches

- `tauri`: cambios propios de la aplicación de escritorio, una rama/commit por
  funcionalidad.
- `dev` / `master`: el resto de la funcionalidad. `dev` para integración, `master` para
  estable, commits por funcionalidad.

## License

MIT © 2026 KrashMello. Ver [`LICENSE`](./LICENSE).
