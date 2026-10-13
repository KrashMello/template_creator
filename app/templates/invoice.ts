import { logoSvg, makeBuilder, rootNode, templateCss } from "./helpers";
import type { BuildContext, PrebuiltTemplate, TemplateDoc, TemplateLocale } from "./types";

/** Textos del documento (cabeceras de tabla, etiquetas...) y nombres de nodo. */
const TXT: Record<TemplateLocale, Record<string, string>> = {
  es: {
    header: "Cabecera",
    footer: "Pie",
    logo: "Logotipo",
    company: "Empresa",
    title: "Título",
    meta: "Referencias",
    cards: "Cliente y emisor",
    issuerBox: "Emisor",
    clientBox: "Cliente",
    table: "Tabla de conceptos",
    totals: "Totales",
    notes: "Notas",
    invoiceWord: "Factura",
    num: "N.º",
    issued: "Fecha de emisión",
    clientLabel: "Cliente",
    issuerLabel: "Emisor",
    vatLine: "CIF: {{client.vat}}",
    issuerVatLine: "CIF: {{company.vat}}",
    docTitle: "Factura {{invoice.number}}",
    datesLine: "Fecha: {{invoice.date}} · Vencimiento: {{invoice.due}}",
    concept: "Concepto",
    qty: "Cant.",
    price: "Precio",
    amount: "Importe",
    subtotal: "Subtotal",
    iva: "IVA (21 %)",
    total: "Total",
    notesText:
      "Gracias por confiar en nosotros. Los importes incluyen IVA; plazo de devolución de 14 días.",
    paymentText: "Pago por transferencia a 15 días.",
    line1: "Diseño de identidad visual",
    line2: "Desarrollo web (40 h)",
    line3: "Mantenimiento mensual",
  },
  en: {
    header: "Header",
    footer: "Footer",
    logo: "Logo",
    company: "Company",
    title: "Title",
    meta: "Reference",
    cards: "Client & issuer",
    issuerBox: "Issuer",
    clientBox: "Client",
    table: "Line items table",
    totals: "Totals",
    notes: "Notes",
    invoiceWord: "Invoice",
    num: "No.",
    issued: "Issue date",
    clientLabel: "Client",
    issuerLabel: "Issuer",
    vatLine: "VAT: {{client.vat}}",
    issuerVatLine: "VAT: {{company.vat}}",
    docTitle: "Invoice {{invoice.number}}",
    datesLine: "Date: {{invoice.date}} · Due: {{invoice.due}}",
    concept: "Description",
    qty: "Qty.",
    price: "Price",
    amount: "Amount",
    subtotal: "Subtotal",
    iva: "VAT (21 %)",
    total: "Total",
    notesText:
      "Thank you for working with us. Prices include VAT; 14-day return period.",
    paymentText: "Payment by bank transfer, 15 days.",
    line1: "Brand identity design",
    line2: "Website development (40 h)",
    line3: "Monthly maintenance",
  },
};

const dataFor = (t: Record<string, string>): Record<string, any> => ({
  company: {
    name: "Acme Studios",
    address: "Calle Mayor 12, Madrid",
    email: "hola@acme.studio",
    vat: "ESB12345678",
  },
  invoice: { number: "2026-0042", date: "02/10/2026", due: "16/10/2026" },
  client: {
    name: "Krashmello S.L.",
    address: "Av. Diagonal 47, Barcelona",
    email: "finanzas@krashmello.com",
    vat: "ESA87654321",
  },
  // Misma forma que el componente Tabla de la paleta: `table.cols` / `table.rows`.
  table: {
    cols: [t.concept, t.qty, t.price, t.amount],
    rows: [
      [t.line1, "1", "1.200,00 €", "1.200,00 €"],
      [t.line2, "40 h", "45,00 €", "1.800,00 €"],
      [t.line3, "2", "200,00 €", "400,00 €"],
    ],
  },
  subtotal: "3.400,00 €",
  iva: "714,00 €",
  total: "4.114,00 €",
  notes: t.notesText,
  payment: t.paymentText,
});

const build = ({ locale }: BuildContext): TemplateDoc => {
  const t = TXT[locale] ?? TXT.es;
  const b = makeBuilder("inv");
  const logo = logoSvg("A");

  const header = rootNode("header");
  header.children = [
    b.row(
      t.header,
      [
        b.row(
          t.company,
          [
            b.image(t.logo, logo, "tc-logo"),
            b.col(
              t.company,
              [
                b.text(t.company, "{{company.name}}", ["tc-strong", "tc-xs"]),
                b.text(t.company, "{{company.address}}", ["tc-muted", "tc-xs"]),
              ],
              "tc-stack",
            ),
          ],
          "tc-rowcenter",
        ),
        b.col(
          t.meta,
          [
            b.text(t.title, t.invoiceWord, "tc-invoice-word"),
            b.text(t.meta, `${t.num} {{invoice.number}} · {{invoice.date}}`, [
              "tc-muted",
              "tc-xs",
              "tc-right",
            ]),
          ],
          ["tc-stack", "tc-right"],
        ),
      ],
      ["tc-pagepad", "tc-rowbetween"],
    ),
  ];

  const schema = rootNode("preview");
  schema.children = [
    b.text(t.title, t.docTitle, "tc-invoice-title"),
    b.text(t.meta, t.datesLine, "tc-muted"),
    b.row(
      t.cards,
      [
        b.col(
          t.clientBox,
          [
            b.text(t.clientLabel, t.clientLabel, "tc-label"),
            b.text(t.clientLabel, "{{client.name}}", "tc-strong"),
            b.text(t.clientLabel, "{{client.address}}"),
            b.text(t.clientLabel, "{{client.email}}"),
            b.text(t.clientLabel, t.vatLine),
          ],
          ["tc-stack", "tc-invoice-card"],
        ),
        b.col(
          t.issuerBox,
          [
            b.text(t.issuerLabel, t.issuerLabel, "tc-label"),
            b.text(t.issuerLabel, "{{company.name}}", "tc-strong"),
            b.text(t.issuerLabel, "{{company.address}}"),
            b.text(t.issuerLabel, "{{company.email}}"),
            b.text(t.issued, `${t.issued}: {{invoice.date}}`),
          ],
          ["tc-stack", "tc-invoice-card"],
        ),
      ],
      ["tc-cols", "tc-mt4"],
    ),
    b.table(t.table, { marker: "tc-invoice-table" }),
    b.row(
      t.totals,
      [
        b.col(
          t.totals,
          [
            b.row(
              t.subtotal,
              [
                b.text(t.subtotal, t.subtotal, ["tc-muted", "tc-xs"]),
                b.text(t.subtotal, "{{subtotal}}", ["tc-strong", "tc-xs"]),
              ],
              "tc-line",
            ),
            b.row(
              t.iva,
              [
                b.text(t.iva, t.iva, ["tc-muted", "tc-xs"]),
                b.text(t.iva, "{{iva}}", ["tc-strong", "tc-xs"]),
              ],
              "tc-line",
            ),
            b.row(
              t.total,
              [
                b.text(t.total, t.total, ["tc-strong", "tc-xs"]),
                b.text(t.total, "{{total}}", ["tc-strong", "tc-invoice-totalvalue"]),
              ],
              ["tc-line", "tc-invoice-total"],
            ),
          ],
          ["tc-stack", "tc-invoice-totals"],
        ),
      ],
      ["tc-rowend", "tc-flush", "tc-mt4"],
    ),
    b.text(t.notes, "{{notes}}", ["tc-muted", "tc-mt6"]),
  ];

  const footer = rootNode("footer");
  footer.children = [
    b.row(
      t.footer,
      [
        b.text(t.footer, "{{company.name}} · {{company.vat}}", ["tc-xs", "tc-muted"]),
        b.text(t.footer, "{{payment}}", ["tc-xs", "tc-muted", "tc-right"]),
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
      /* Factura */
      .tc-invoice-title[class] { padding: 0; font-size: 30px; line-height: 1.15; font-weight: 700; letter-spacing: -0.02em; color: #0f172a; }
      .tc-invoice-word[class] { padding: 0; font-size: 17px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; color: #2563eb; }
      .tc-logo[class] { width: 44px; height: 44px; border-radius: 10px; }
      .tc-invoice-card[class] { padding: 16px; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc; }
      .tc-invoice-table[class] { margin-top: 24px; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; }
      .tc-invoice-table th { font-size: 11px; text-transform: uppercase; letter-spacing: .05em; }
      .tc-invoice-table thead th { color: #f1f5f9; }
      .tc-invoice-table th:not(:first-child), .tc-invoice-table td:not(:first-child) { text-align: right; }
      .tc-invoice-table td:last-child { font-weight: 700; color: #0f172a; }
      .tc-invoice-totals[class] { width: 240px; }
      .tc-invoice-total[class] { margin-top: 6px; padding-top: 8px; border-top: 2px solid #0f172a; }
      .tc-invoice-totalvalue[class] { font-size: 18px; }
    `),
  };
};

export const invoice: PrebuiltTemplate = { id: "invoice", build };
