import { makeBuilder, rootNode, templateCss } from "./helpers";
import type { BuildContext, PrebuiltTemplate, TemplateDoc, TemplateLocale } from "./types";

const TXT: Record<TemplateLocale, Record<string, string>> = {
  es: {
    header: "Cabecera",
    footer: "Pie",
    heading: "Título",
    summarySection: "Resumen ejecutivo",
    kpiSection: "Indicadores clave",
    kpiBox: "Indicador",
    metricsSection: "Detalle por trimestre",
    monthsSection: "Evolución mensual",
    metricsTable: "Tabla de indicadores",
    monthsTable: "Tabla mensual",
    docTitle: "Informe de resultados",
    metaLine: "{{report.period}} · {{report.author}}",
    summary:
      "El tercer trimestre cierra con un crecimiento sostenido en todos los canales. La mejora del ticket medio y la reducción del coste de adquisición explican la mayor parte de la variación positiva frente al trimestre anterior.",
    metric: "Métrica",
    quarter2: "T2",
    quarter3: "T3",
    variation: "Variación",
    month: "Mes",
    orders: "Pedidos",
    avgTicket: "Ticket medio",
    periodFooter: "Documento interno · {{report.period}}",
    preparedBy: "Preparado por {{report.author}}",
    reportTitle: "Informe de resultados",
    period: "Tercer trimestre 2026",
    author: "Equipo de Analítica",
    revenueLabel: "Ingresos",
    ordersLabel: "Pedidos",
    aovLabel: "Ticket medio",
    costsLabel: "Costes",
    marginLabel: "Margen",
    july: "Julio",
    august: "Agosto",
    september: "Septiembre",
  },
  en: {
    header: "Header",
    footer: "Footer",
    heading: "Title",
    summarySection: "Executive summary",
    kpiSection: "Key indicators",
    kpiBox: "Indicator",
    metricsSection: "Quarterly detail",
    monthsSection: "Monthly trend",
    metricsTable: "Metrics table",
    monthsTable: "Monthly table",
    docTitle: "Results report",
    metaLine: "{{report.period}} · {{report.author}}",
    summary:
      "The third quarter closes with steady growth across every channel. A higher average order value and a lower acquisition cost explain most of the positive variance against the previous quarter.",
    metric: "Metric",
    quarter2: "Q2",
    quarter3: "Q3",
    variation: "Variance",
    month: "Month",
    orders: "Orders",
    avgTicket: "Avg. order value",
    periodFooter: "Internal document · {{report.period}}",
    preparedBy: "Prepared by {{report.author}}",
    reportTitle: "Results report",
    period: "Third quarter 2026",
    author: "Analytics team",
    revenueLabel: "Revenue",
    ordersLabel: "Orders",
    aovLabel: "Avg. order value",
    costsLabel: "Costs",
    marginLabel: "Margin",
    july: "July",
    august: "August",
    september: "September",
  },
};

const dataFor = (t: Record<string, string>): Record<string, any> => ({
  report: { title: t.reportTitle, period: t.period, author: t.author },
  kpi: {
    revenue: { label: t.revenueLabel, value: "128.400 €", delta: "+12,4 %" },
    orders: { label: t.ordersLabel, value: "1.942", delta: "+6,1 %" },
    aov: { label: t.aovLabel, value: "66,10 €", delta: "+5,9 %" },
  },
  // Primera tabla con la forma exacta del componente Tabla de la paleta.
  table: {
    cols: [t.metric, t.quarter2, t.quarter3, t.variation],
    rows: [
      [t.revenueLabel, "114.200 €", "128.400 €", "+12,4 %"],
      [t.costsLabel, "71.300 €", "76.900 €", "+7,9 %"],
      [t.marginLabel, "37,6 %", "40,1 %", "+2,5 pp"],
    ],
  },
  // Segunda tabla: un documento solo admite una clave `table`, así que esta
  // lleva clave propia y markup equivalente (la excepción del reuso estricto).
  months: {
    cols: [t.month, t.orders, t.avgTicket],
    rows: [
      [t.july, "612", "63,80 €"],
      [t.august, "587", "64,40 €"],
      [t.september, "743", "69,90 €"],
    ],
  },
});

const build = ({ locale }: BuildContext): TemplateDoc => {
  const t = TXT[locale] ?? TXT.es;
  const b = makeBuilder("rep");

  const kpiBox = (key: string) =>
    b.col(
      t.kpiBox,
      [
        b.text(t.kpiBox, `{{kpi.${key}.value}}`, "tc-report-kpi-value"),
        b.text(t.kpiBox, `{{kpi.${key}.label}}`, ["tc-xs", "tc-muted"]),
        b.text(t.kpiBox, `{{kpi.${key}.delta}}`, ["tc-xs", "tc-report-kpi-delta"]),
      ],
      ["tc-stack", "tc-report-kpi"],
    );

  const header = rootNode("header");
  header.children = [
    b.row(
      t.header,
      [
        b.text(t.heading, "{{report.title}}", ["tc-strong", "tc-xs"]),
        b.text(t.heading, "{{report.period}}", ["tc-muted", "tc-xs"]),
      ],
      ["tc-pagepad", "tc-rowbetween"],
    ),
  ];

  const schema = rootNode("preview");
  schema.children = [
    b.text(t.heading, t.docTitle, "tc-report-title"),
    b.text(t.heading, t.metaLine, "tc-muted"),
    b.text(t.summarySection, t.summarySection, "tc-report-section"),
    b.text(t.summarySection, t.summary, "tc-mt2"),
    b.text(t.kpiSection, t.kpiSection, "tc-report-section"),
    b.row(t.kpiSection, [kpiBox("revenue"), kpiBox("orders"), kpiBox("aov")], [
      "tc-cols",
      "tc-mt3",
    ]),
    b.text(t.metricsSection, t.metricsSection, "tc-report-section"),
    b.table(t.metricsTable, { marker: "tc-report-table" }),
    b.text(t.monthsSection, t.monthsSection, "tc-report-section"),
    b.table(t.monthsTable, {
      marker: "tc-report-table",
      columns: `{{#each months.cols}}<th class="p-4">{{this}}</th>{{/each}}`,
      rows: `{{#each months.rows}}<tr class="transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-900/50">{{#each this}}<td class="p-4">{{this}}</td>{{/each}}</tr>{{/each}}`,
    }),
  ];

  const footer = rootNode("footer");
  footer.children = [
    b.row(
      t.footer,
      [
        b.text(t.footer, t.periodFooter, ["tc-xs", "tc-muted"]),
        b.text(t.footer, t.preparedBy, ["tc-xs", "tc-muted", "tc-right"]),
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
      /* Informe */
      .tc-report-title[class] { padding: 0; font-size: 24px; line-height: 1.3; font-weight: 700; letter-spacing: -0.02em; color: #0f172a; }
      .tc-report-section[class] { margin-top: 24px; padding: 0 0 6px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: .12em; color: #2563eb; border-bottom: 2px solid #dbeafe; }
      .tc-report-kpi[class] { padding: 12px; background: #f8fafc; border-left: 4px solid #2563eb; border-radius: 8px; }
      .tc-report-kpi-value[class] { font-size: 20px; font-weight: 700; color: #0f172a; }
      .tc-report-kpi-delta[class] { font-weight: 600; color: #059669; }
      .tc-report-table[class] { margin-top: 12px; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; }
      .tc-report-table th, .tc-report-table td { padding: 8px 12px; }
      .tc-report-table th { font-size: 11px; text-transform: uppercase; letter-spacing: .05em; }
      .tc-report-table thead th { color: #f1f5f9; }
      .tc-report-table th:not(:first-child), .tc-report-table td:not(:first-child) { text-align: right; }
      .tc-report-table td:first-child { font-weight: 600; color: #0f172a; }
      .tc-report-table tbody tr:nth-child(even) { background-color: #f8fafc; }
    `),
  };
};

export const report: PrebuiltTemplate = { id: "report", build };
