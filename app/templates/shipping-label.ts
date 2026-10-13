import { logoSvg, makeBuilder, rootNode, templateCss } from "./helpers";
import type { BuildContext, PrebuiltTemplate, TemplateDoc, TemplateLocale } from "./types";

const TXT: Record<TemplateLocale, Record<string, string>> = {
  es: {
    header: "Cabecera",
    footer: "Pie",
    logo: "Logotipo",
    sender: "Remitente",
    word: "Rótulo",
    destination: "Destinatario",
    trackingBox: "Seguimiento",
    weightBox: "Peso",
    flags: "Casillas",
    barcode: "Código de barras",
    barcodeText: "Texto del código",
    wordMain: "Envío",
    from: "Remitente",
    to: "Destinatario",
    trackingLabel: "N.º de seguimiento",
    weightLabel: "Peso",
    serviceLabel: "Servicio",
    fragile: "Frágil",
    priority: "Prioridad alta",
    barcodeCaption: "{{shipment.tracking}} · {{shipment.service}}",
    senderLine: "{{sender.name}} · {{sender.address}}",
    serviceFooter: "{{shipment.service}} · {{shipment.weight}}",
    express: "Exprés 24 h",
  },
  en: {
    header: "Header",
    footer: "Footer",
    logo: "Logo",
    sender: "Sender",
    word: "Label title",
    destination: "Recipient",
    trackingBox: "Tracking",
    weightBox: "Weight",
    flags: "Checkboxes",
    barcode: "Barcode",
    barcodeText: "Barcode caption",
    wordMain: "Shipment",
    from: "Sender",
    to: "Recipient",
    trackingLabel: "Tracking number",
    weightLabel: "Weight",
    serviceLabel: "Service",
    fragile: "Fragile",
    priority: "Priority",
    barcodeCaption: "{{shipment.tracking}} · {{shipment.service}}",
    senderLine: "{{sender.name}} · {{sender.address}}",
    serviceFooter: "{{shipment.service}} · {{shipment.weight}}",
    express: "Express 24h",
  },
};

const dataFor = (t: Record<string, string>): Record<string, any> => ({
  sender: {
    name: "Acme Studios",
    address: "Calle Mayor 12, Madrid",
    contact: "pedidos@acme.studio",
  },
  destination: {
    name: "Krashmello S.L.",
    address: "Av. Diagonal 47",
    city: "08008 Barcelona",
    phone: "+34 600 123 456",
  },
  shipment: { tracking: "ES9876 5432 1098", service: t.express, weight: "2,4 kg" },
});

const build = ({ locale }: BuildContext): TemplateDoc => {
  const t = TXT[locale] ?? TXT.es;
  const b = makeBuilder("lbl");
  const logo = logoSvg("A", "#0f172a");

  const header = rootNode("header");
  header.children = [
    b.row(
      t.header,
      [
        b.row(
          t.sender,
          [
            b.image(t.logo, logo, "tc-lbl-logo"),
            b.text(t.sender, "{{sender.name}}", "tc-strong"),
          ],
          "tc-rowcenter",
        ),
        b.text(t.from, t.from, "tc-lbl-from"),
      ],
      ["tc-pagepad", "tc-rowbetween"],
    ),
  ];

  const schema = rootNode("preview");
  schema.children = [
    b.row(
      t.word,
      [
        b.text(t.word, t.wordMain, "tc-lbl-title"),
        b.text(t.word, "{{shipment.service}}", "tc-lbl-service"),
      ],
      ["tc-rowbetween", "tc-flush", "tc-lbl-word"],
    ),
    b.container(
      t.destination,
      [
        b.text(t.to, t.to, "tc-lbl-tolabel"),
        b.text(t.destination, "{{destination.name}}", "tc-lbl-destname"),
        b.text(t.destination, "{{destination.address}}", "tc-lbl-destaddr"),
        b.text(t.destination, "{{destination.city}}", "tc-lbl-destaddr"),
        b.text(t.destination, "{{destination.phone}}", "tc-muted"),
      ],
      "tc-lbl-dest",
    ),
    b.row(
      t.trackingBox,
      [
        b.col(
          t.trackingBox,
          [
            b.text(t.trackingLabel, t.trackingLabel, "tc-lbl-boxlabel"),
            b.text(t.trackingBox, "{{shipment.tracking}}", ["tc-mono", "tc-lbl-bigval"]),
          ],
          ["tc-stack", "tc-lbl-box"],
        ),
        b.col(
          t.weightBox,
          [
            b.text(t.weightLabel, t.weightLabel, "tc-lbl-boxlabel"),
            b.text(t.weightBox, "{{shipment.weight}}", "tc-lbl-bigval"),
          ],
          ["tc-stack", "tc-lbl-box"],
        ),
      ],
      ["tc-cols", "tc-mt4"],
    ),
    b.row(
      t.flags,
      [
        b.checkbox(t.flags, t.fragile, { checked: false }),
        b.checkbox(t.flags, t.priority, { checked: true }),
      ],
      ["tc-flush", "tc-lbl-flags"],
    ),
    // Código de barras real (Code 39) generado desde el dato de seguimiento.
    b.barcode(t.barcode, "{{shipment.tracking}}", { height: 48, marker: "tc-lbl-barcode" }),
    b.text(t.barcodeText, t.barcodeCaption, [
      "tc-mt2",
      "tc-center",
      "tc-mono",
      "tc-xs",
      "tc-muted",
    ]),
  ];

  const footer = rootNode("footer");
  footer.children = [
    b.row(
      t.footer,
      [
        b.text(t.footer, t.senderLine, ["tc-xs", "tc-muted"]),
        b.text(t.footer, t.serviceFooter, ["tc-xs", "tc-muted"]),
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
      /* Etiqueta de envío: el código de barras es un SVG Code 39 real */
      .tc-lbl-logo[class] { width: 32px; height: 32px; border-radius: 4px; }
      .tc-lbl-from[class] { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .15em; color: #94a3b8; }
      .tc-lbl-word[class] { padding-bottom: 12px; border-bottom: 2px solid #0f172a; }
      .tc-lbl-title[class] { padding: 0; font-size: 30px; line-height: 1.15; font-weight: 900; text-transform: uppercase; letter-spacing: -0.02em; color: #0f172a; }
      .tc-lbl-service[class] { padding: 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: .02em; color: #2563eb; }
      .tc-lbl-dest[class] { min-height: 0; margin-top: 16px; gap: 4px; padding: 16px; background-color: #ffffff; border: 2px solid #0f172a; border-radius: 12px; }
      .tc-lbl-tolabel[class] { padding: 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .15em; color: #94a3b8; }
      .tc-lbl-destname[class] { padding: 0; font-size: 24px; line-height: 1.3; font-weight: 700; color: #0f172a; }
      .tc-lbl-destaddr[class] { padding: 0; font-size: 16px; color: #334155; }
      .tc-lbl-box[class] { padding: 12px; background-color: #f1f5f9; border-radius: 8px; }
      .tc-lbl-boxlabel[class] { padding: 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; color: #64748b; }
      .tc-lbl-bigval[class] { padding: 0; font-size: 18px; font-weight: 700; color: #0f172a; }
      .tc-lbl-flags[class] { min-height: 0; margin-top: 16px; gap: 24px; }
      .tc-lbl-barcode[class] { margin-top: 24px; }
    `),
  };
};

export const shippingLabel: PrebuiltTemplate = { id: "shipping-label", build };
