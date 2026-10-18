import { makeBuilder, rootNode, templateCss } from "./helpers";
import type { BuildContext, PrebuiltTemplate, TemplateDoc, TemplateLocale } from "./types";

const TXT: Record<TemplateLocale, Record<string, string>> = {
  es: {
    header: "Cabecera",
    footer: "Pie",
    store: "Comercio",
    docTitle: "Título",
    meta: "Datos del pedido",
    table: "Tabla de artículos",
    totals: "Totales",
    check: "Casilla",
    thanks: "Cierre",
    ticket: "Ticket",
    item: "Artículo",
    qty: "Cant.",
    amount: "Importe",
    subtotal: "Subtotal",
    iva: "IVA (10 %)",
    total: "Total",
    paymentLabel: "Pago",
    received: "He recibido mi pedido",
    thanksText: "Gracias por su visita",
    orderLine: "Pedido {{order.id}} · {{order.date}} · {{order.cashier}}",
    vatLine: "{{store.vat}} · {{store.address}}",
    line1: "Café espresso",
    line2: "Croissant de mantequilla",
    line3: "Zumo de naranja",
    payment: "Tarjeta ···6789",
    branch: "Sucursal Sol",
  },
  en: {
    header: "Header",
    footer: "Footer",
    store: "Store",
    docTitle: "Title",
    meta: "Order details",
    table: "Items table",
    totals: "Totals",
    check: "Checkbox",
    thanks: "Closing",
    ticket: "Receipt",
    item: "Item",
    qty: "Qty.",
    amount: "Amount",
    subtotal: "Subtotal",
    iva: "VAT (10 %)",
    total: "Total",
    paymentLabel: "Payment",
    received: "I have received my order",
    thanksText: "Thank you for your visit",
    orderLine: "Order {{order.id}} · {{order.date}} · {{order.cashier}}",
    vatLine: "{{store.vat}} · {{store.address}}",
    line1: "Espresso coffee",
    line2: "Butter croissant",
    line3: "Orange juice",
    payment: "Card ···6789",
    branch: "Sol branch",
  },
};

const dataFor = (t: Record<string, string>): Record<string, any> => ({
  store: { name: "Café Krashmello", address: "Calle Sol 3, Madrid", vat: "ESX1234567X" },
  order: { id: "A-1042", date: "02/10/2026", cashier: t.branch },
  // Misma forma que el componente Tabla de la paleta: `table.cols` / `table.rows`.
  table: {
    cols: [t.item, t.qty, t.amount],
    rows: [
      [t.line1, "2", "1,60 €"],
      [t.line2, "1", "1,40 €"],
      [t.line3, "1", "2,20 €"],
    ],
  },
  subtotal: "5,20 €",
  iva: "1,09 €",
  total: "6,29 €",
  payment: t.payment,
});

const build = ({ locale }: BuildContext): TemplateDoc => {
  const t = TXT[locale] ?? TXT.es;
  const b = makeBuilder("rec");

  const header = rootNode("header");
  header.children = [
    b.container(
      t.header,
      [
        b.text(t.store, "{{store.name}}", "tc-receipt-store"),
        b.text(t.store, t.branch, "tc-receipt-branch"),
      ],
      ["tc-pagepad", "tc-receipt-head"],
    ),
  ];

  const line = (labelKey: string, value: string) =>
    b.row(
      t[labelKey],
      [b.text(t[labelKey], t[labelKey], "tc-muted"), b.text(t[labelKey], value)],
      "tc-line",
    );

  const schema = rootNode("preview");
  schema.children = [
    b.text(t.docTitle, t.ticket, "tc-receipt-title"),
    b.text(t.meta, t.orderLine, ["tc-muted", "tc-center"]),
    b.table(t.table, { marker: "tc-receipt-table" }),
    b.col(
      t.totals,
      [
        line("subtotal", "{{subtotal}}"),
        line("iva", "{{iva}}"),
        b.row(
          t.total,
          [
            b.text(t.total, t.total, ["tc-strong", "tc-base"]),
            b.text(t.total, "{{total}}", ["tc-strong", "tc-base"]),
          ],
          ["tc-line", "tc-receipt-total"],
        ),
        line("paymentLabel", "{{payment}}"),
      ],
      ["tc-stack", "tc-receipt-totals"],
    ),
    b.checkbox(t.check, t.received, { checked: true, marker: "tc-mt4" }),
    b.text(t.thanks, t.thanksText, ["tc-mt4", "tc-center", "tc-muted", "tc-receipt-thanks"]),
  ];

  const footer = rootNode("footer");
  footer.children = [
    b.row(
      t.footer,
      [
        b.text(t.footer, t.vatLine, ["tc-xs", "tc-muted"]),
        b.text(t.footer, "{{payment}}", ["tc-xs", "tc-muted"]),
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
      /* Ticket */
      .tc-receipt-head[class] { margin-top: 0; gap: 4px; align-items: center; text-align: center; }
      .tc-receipt-store[class] { padding: 0; font-size: 16px; font-weight: 700; color: #0f172a; }
      .tc-receipt-branch[class] { padding: 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: .1em; color: #94a3b8; }
      .tc-receipt-title[class] { margin-top: 8px; padding: 0; font-size: 24px; line-height: 1.3; font-weight: 900; text-transform: uppercase; letter-spacing: -0.01em; text-align: center; }
      .tc-receipt-table[class] { margin-top: 16px; border-top: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1; }
      .tc-receipt-table th, .tc-receipt-table td { padding: 8px; }
      .tc-receipt-table thead { background-color: transparent; border-bottom: 1px dashed #94a3b8; }
      .tc-receipt-table thead tr { color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: .08em; }
      .tc-receipt-table th:not(:first-child), .tc-receipt-table td:not(:first-child) { text-align: right; }
      .tc-receipt-totals[class] { margin-top: 12px; }
      .tc-receipt-total[class] { margin-top: 4px; padding-top: 4px; border-top: 1px dashed #94a3b8; }
      .tc-receipt-thanks[class] { font-style: italic; }
    `),
  };
};

export const receipt: PrebuiltTemplate = { id: "receipt", build };
