import { logoSvg, makeBuilder, rootNode, templateCss } from "./helpers";
import type { BuildContext, PrebuiltTemplate, TemplateDoc, TemplateLocale } from "./types";

/**
 * Plantilla "demo": usa los ocho componentes de la paleta (texto, tabla,
 * imagen, fila, columna, contenedor, casilla y código de barras) en las tres
 * zonas del lienzo, con Handlebars, CSS propio y datos de ejemplo.
 */
const TXT: Record<TemplateLocale, Record<string, string>> = {
  es: {
    header: "Cabecera",
    footer: "Pie",
    logo: "Logotipo",
    brand: "Marca",
    title: "Título",
    intro: "Texto introductorio",
    mediaRow: "Fila imagen + texto",
    imageBox: "Imagen",
    textBox: "Texto",
    table: "Tabla",
    kpiRow: "Fila de tres columnas",
    kpiCol: "Columna",
    checklist: "Contenedor con casillas",
    check: "Casilla",
    barcode: "Código de barras",
    demoTitle: "Todos los componentes del sistema",
    greeting: "{{greeting}}, {{name}}: esto es una plantilla de ejemplo con datos dinámicos, tabla, imagen, casillas y CSS propio.",
    colTitle1: "Arrastra",
    colText1: "Compón el documento con los componentes de la paleta.",
    colTitle2: "Conecta",
    colText2: "Usa variables de Handlebars sobre el JSON de datos.",
    colTitle3: "Exporta",
    colText3: "Imprime el resultado en PDF con un solo clic.",
    checklistTitle: "Lista de comprobación",
    check1: "Zona de cabecera",
    check2: "Datos dinámicos",
    check3: "Estilos personalizados",
    thanks: "Edita cualquier componente: el esquema JSON y los datos se actualizan solos.",
    footerLine: "Plantilla de demostración · {{user.email}}",
    docNote: "Generado con Template Creator",
    greetingWord: "Hola",
    usersName: "Krashmello",
    heading: "Demo completa",
    compCol: "Componente",
    zoneCol: "Zona",
    dataCol: "Datos",
    compText: "Texto",
    compTable: "Tabla",
    compImage: "Imagen",
    compCheck: "Casilla",
    compBarcode: "Código de barras",
    zoneBody: "Cuerpo",
    zoneHeader: "Cabecera",
    zoneFooter: "Pie",
  },
  en: {
    header: "Header",
    footer: "Footer",
    logo: "Logo",
    brand: "Brand",
    title: "Title",
    intro: "Intro paragraph",
    mediaRow: "Image + text row",
    imageBox: "Image",
    textBox: "Text",
    table: "Table",
    kpiRow: "Three-column row",
    kpiCol: "Column",
    checklist: "Container with checkboxes",
    check: "Checkbox",
    barcode: "Barcode",
    demoTitle: "Every component of the system",
    greeting: "{{greeting}}, {{name}}: this is a sample template with dynamic data, a table, an image, checkboxes and custom CSS.",
    colTitle1: "Drag",
    colText1: "Compose the document from the palette components.",
    colTitle2: "Connect",
    colText2: "Use Handlebars variables over the JSON data.",
    colTitle3: "Export",
    colText3: "Print the result as a PDF in one click.",
    checklistTitle: "Checklist",
    check1: "Header zone",
    check2: "Dynamic data",
    check3: "Custom styles",
    thanks: "Edit any component: the JSON schema and the data update on their own.",
    footerLine: "Demo template · {{user.email}}",
    docNote: "Generated with Template Creator",
    greetingWord: "Hello",
    usersName: "Krashmello",
    heading: "Full demo",
    compCol: "Component",
    zoneCol: "Zone",
    dataCol: "Data",
    compText: "Text",
    compTable: "Table",
    compImage: "Image",
    compCheck: "Checkbox",
    compBarcode: "Barcode",
    zoneBody: "Body",
    zoneHeader: "Header",
    zoneFooter: "Footer",
  },
};

const dataFor = (t: Record<string, string>): Record<string, any> => ({
  greeting: t.greetingWord,
  name: t.usersName,
  user: { email: "ana@krashmello.com" },
  demoCode: "TC-DEMO-2026-001",
  // Misma forma que el componente Tabla de la paleta: `table.cols` / `table.rows`.
  table: {
    cols: [t.compCol, t.zoneCol, t.dataCol],
    rows: [
      [t.compText, t.zoneBody, "content"],
      [t.compTable, t.zoneBody, "table.cols / table.rows"],
      [t.compImage, t.zoneHeader, "src"],
      [t.compCheck, t.zoneFooter, "value"],
      [t.compBarcode, t.zoneBody, "content / height"],
    ],
  },
  note: t.thanks,
});

const build = ({ locale }: BuildContext): TemplateDoc => {
  const t = TXT[locale] ?? TXT.es;
  const b = makeBuilder("demo");
  const logo = logoSvg("T", "#2563eb");

  const header = rootNode("header");
  header.children = [
    b.row(
      t.header,
      [
        b.row(
          t.brand,
          [
            b.image(t.logo, logo, "tc-sh-logo"),
            b.text(t.brand, "Template Creator", "tc-strong"),
          ],
          "tc-rowcenter",
        ),
        b.text(t.title, t.heading, "tc-sh-heading"),
      ],
      ["tc-pagepad", "tc-rowbetween"],
    ),
  ];

  const schema = rootNode("preview");
  schema.children = [
    b.text(t.title, t.demoTitle, "tc-sh-title"),
    b.text(t.intro, t.greeting, ["tc-mt2", "tc-base"]),
    b.row(
      t.mediaRow,
      [
        b.col(
          t.imageBox,
          [b.image(t.imageBox, logo, "tc-sh-img")],
          ["tc-stack", "tc-sh-imgbox"],
        ),
        b.col(
          t.textBox,
          [
            b.text(t.textBox, t.colTitle1, "tc-sh-coltitle"),
            b.text(t.textBox, t.colText1),
          ],
          ["tc-stack", "tc-sh-textbox"],
        ),
      ],
      ["tc-cols", "tc-mt4"],
    ),
    b.table(t.table, { marker: "tc-sh-table" }),
    b.row(
      t.kpiRow,
      [
        b.col(
          t.kpiCol,
          [b.text(t.kpiCol, t.colTitle2), b.text(t.kpiCol, t.colText2)],
          ["tc-stack", "tc-sh-kpi-blue"],
        ),
        b.col(
          t.kpiCol,
          [b.text(t.kpiCol, t.colTitle3), b.text(t.kpiCol, t.colText3)],
          ["tc-stack", "tc-sh-kpi-green"],
        ),
      ],
      ["tc-cols", "tc-mt4"],
    ),
    b.container(
      t.checklist,
      [
        b.text(t.checklist, t.checklistTitle, "tc-sh-checktitle"),
        b.checkbox(t.check, t.check1, { checked: true }),
        b.checkbox(t.check, t.check2, { checked: true }),
        b.checkbox(t.check, t.check3, { checked: false }),
      ],
      "tc-sh-checklist",
    ),
    b.text(t.intro, "{{note}}", ["tc-mt2", "tc-muted"]),
    // Código de barras real (Code 39) con el valor del JSON de datos.
    b.barcode(t.barcode, "{{demoCode}}", { height: 44, marker: "tc-sh-barcode" }),
  ];

  const footer = rootNode("footer");
  footer.children = [
    b.row(
      t.footer,
      [
        b.text(t.footer, t.footerLine, ["tc-xs", "tc-muted"]),
        b.text(t.footer, t.docNote, ["tc-xs", "tc-muted"]),
      ],
      ["tc-pagepad", "tc-rowbetween"],
    ),
  ];

  return {
    schema,
    header,
    footer,
    data: dataFor(t),
    cssCode: templateCss(`
      /* Demo completa: CSS propio */
      .tc-sh-logo[class] { width: 40px; height: 40px; border-radius: 10px; }
      .tc-sh-heading[class] { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .15em; color: #2563eb; }
      .tc-sh-title[class] { padding: 0; font-size: 30px; line-height: 1.15; font-weight: 700; letter-spacing: -0.02em; color: #1d4ed8; }
      .tc-sh-imgbox[class] { padding: 16px; background-color: #f1f5f9; border-radius: 12px; align-items: center; }
      .tc-sh-textbox[class] { gap: 8px; padding: 16px; border: 1px solid #e2e8f0; border-radius: 12px; }
      .tc-sh-img[class] { border-radius: 8px; }
      .tc-sh-coltitle[class] { padding: 0; font-size: 18px; font-weight: 700; color: #0f172a; }
      .tc-sh-table[class] { margin-top: 16px; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; }
      .tc-sh-table thead { background-color: #1d4ed8; border-bottom: 0; }
      .tc-sh-table thead tr { color: #dbeafe; }
      .tc-sh-table th, .tc-sh-table td { padding: 8px 12px; }
      .tc-sh-table tbody tr:hover { background-color: #eff6ff; }
      .tc-sh-kpi-blue[class] { padding: 12px; background-color: #eff6ff; border-radius: 8px; }
      .tc-sh-kpi-green[class] { padding: 12px; background-color: #ecfdf5; border-radius: 8px; }
      .tc-sh-kpi-blue[class] p { color: #1e3a8a; }
      .tc-sh-kpi-blue[class] p + p { font-size: 12px; color: #1d4ed8; }
      .tc-sh-kpi-green[class] p { color: #065f46; }
      .tc-sh-kpi-green[class] p + p { font-size: 12px; color: #047857; }
      .tc-sh-kpi-blue[class] p:first-of-type, .tc-sh-kpi-green[class] p:first-of-type { font-weight: 700; }
      .tc-sh-checklist[class] { min-height: 0; margin-top: 16px; gap: 8px; padding: 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; }
      .tc-sh-checktitle[class] { padding: 0; margin-bottom: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; color: #94a3b8; }
      .tc-sh-barcode[class] { margin-top: 8px; max-width: 280px; }
    `),
  };
};

export const showcase: PrebuiltTemplate = { id: "showcase", build };
