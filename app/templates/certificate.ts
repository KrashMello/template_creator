import { logoSvg, makeBuilder, rootNode, sealSvg, templateCss } from "./helpers";
import type { BuildContext, PrebuiltTemplate, TemplateDoc, TemplateLocale } from "./types";

const TXT: Record<TemplateLocale, Record<string, string>> = {
  es: {
    header: "Cabecera",
    footer: "Pie",
    logo: "Logotipo",
    org: "Organización",
    wordmark: "Rótulo",
    card: "Cuerpo del certificado",
    signature: "Firmas",
    stamp: "Sello",
    check: "Casilla de verificación",
    nameLabel: "Nombre",
    textLabel: "Texto",
    subtitleLabel: "Subtítulo",
    titleLabel: "Título",
    title: "Certificado",
    subtitle: "Se certifica que",
    completion: "ha completado satisfactoriamente el programa",
    tail: "con una carga lectiva de",
    signatureLabel: "Firma",
    roleLabel: "Cargo",
    dateLabel: "Fecha",
    verified: "Documento verificado",
    orgLine: "{{organization.name}} · {{organization.city}}",
    certId: "ID del certificado: {{certificateId}}",
    certified: "Certificado oficial",
    programme: "Diseño de interfaces avanzado",
    dateText: "02 de octubre de 2026",
    roleText: "Director académico",
    hoursText: "40 horas",
  },
  en: {
    header: "Header",
    footer: "Footer",
    logo: "Logo",
    org: "Organization",
    wordmark: "Wordmark",
    card: "Certificate body",
    signature: "Signatures",
    stamp: "Seal",
    check: "Verification checkbox",
    nameLabel: "Name",
    textLabel: "Text",
    subtitleLabel: "Subtitle",
    titleLabel: "Title",
    title: "Certificate",
    subtitle: "This is to certify that",
    completion: "has successfully completed the programme",
    tail: "with a workload of",
    signatureLabel: "Signature",
    roleLabel: "Role",
    dateLabel: "Date",
    verified: "Document verified",
    orgLine: "{{organization.name}} · {{organization.city}}",
    certId: "Certificate ID: {{certificateId}}",
    certified: "Official certificate",
    programme: "Advanced interface design",
    dateText: "October 2, 2026",
    roleText: "Academic director",
    hoursText: "40 hours",
  },
};

const dataFor = (t: Record<string, string>): Record<string, any> => ({
  organization: { name: "Acme Academy", city: "Madrid" },
  certificateId: "CERT-2026-0117",
  recipient: { name: "Ana Krashmello", programme: t.programme, hours: t.hoursText },
  instructor: { name: "Luis Krashmello", role: t.roleText },
  date: t.dateText,
  programmeLine: `${t.completion} ${t.programme} ${t.tail} ${t.hoursText}`,
});

const build = ({ locale }: BuildContext): TemplateDoc => {
  const t = TXT[locale] ?? TXT.es;
  const b = makeBuilder("cert");
  const logo = logoSvg("A", "#4f46e5");
  const seal = sealSvg("#4f46e5", "#4f46e5");

  const header = rootNode("header");
  header.children = [
    b.row(
      t.header,
      [
        b.row(
          t.org,
          [
            b.image(t.logo, logo, "tc-cert-logo"),
            b.text(t.org, "{{organization.name}}", ["tc-strong", "tc-xs"]),
          ],
          "tc-rowcenter",
        ),
        b.text(t.wordmark, t.certified, "tc-cert-wordmark"),
      ],
      ["tc-pagepad", "tc-rowbetween"],
    ),
  ];

  const schema = rootNode("preview");
  schema.children = [
    b.container(
      t.card,
      [
        b.image(t.stamp, seal, "tc-cert-seal"),
        b.text(t.titleLabel, t.title, "tc-cert-title"),
        b.text(t.subtitleLabel, t.subtitle, "tc-cert-subtitle"),
        b.text(t.nameLabel, "{{recipient.name}}", "tc-cert-name"),
        b.text(t.textLabel, "{{programmeLine}}", "tc-cert-text"),
        b.row(
          t.signature,
          [
            b.col(
              t.signature,
              [
                b.text(t.nameLabel, "{{instructor.name}}", "tc-cert-sign"),
                b.text(t.roleLabel, t.roleLabel, "tc-cert-role"),
              ],
              ["tc-stack", "tc-cert-signcol"],
            ),
            b.col(
              t.signature,
              [
                b.text(t.dateLabel, "{{date}}", "tc-cert-sign"),
                b.text(t.dateLabel, t.dateLabel, "tc-cert-role"),
              ],
              ["tc-stack", "tc-cert-signcol"],
            ),
          ],
          ["tc-cols", "tc-cert-signs"],
        ),
        b.checkbox(t.check, t.verified, { checked: true, marker: "tc-cert-check" }),
      ],
      "tc-cert-card",
    ),
  ];

  const footer = rootNode("footer");
  footer.children = [
    b.row(
      t.footer,
      [
        b.text(t.footer, t.orgLine, ["tc-xs", "tc-muted"]),
        b.text(t.footer, t.certId, ["tc-xs", "tc-muted"]),
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
      /* Certificado */
      .tc-cert-logo[class] { width: 32px; height: 32px; border-radius: 8px; }
      .tc-cert-wordmark[class] { font-size: 11px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: #4f46e5; }
      .tc-cert-card[class] { min-height: 0; gap: 20px; margin-top: 8px; padding: 44px 40px; align-items: center; text-align: center; background-color: #fff; border: 4px double #3730a3; border-radius: 16px; }
      .tc-cert-card[class] p { font-family: Georgia, 'Times New Roman', serif; }
      .tc-cert-seal[class] { width: 80px; height: 80px; }
      .tc-cert-title[class] { padding: 0; font-size: 36px; line-height: 1.15; font-weight: 700; color: #312e81; }
      .tc-cert-subtitle[class] { padding: 0; font-size: 11px; font-weight: 600; letter-spacing: .3em; text-transform: uppercase; color: #64748b; }
      .tc-cert-name[class] { padding: 0; font-size: 30px; font-weight: 700; color: #0f172a; }
      .tc-cert-text[class] { padding: 0; max-width: 36rem; font-size: 16px; line-height: 1.6; color: #475569; }
      .tc-cert-signs[class] { margin-top: 24px; padding-left: 0; padding-right: 0; gap: 40px; }
      .tc-cert-signcol[class] { align-items: center; }
      .tc-cert-sign[class] { width: 100%; padding: 8px 0 0; border-top: 1px solid #cbd5e1; font-weight: 600; color: #0f172a; }
      .tc-cert-role[class] { padding: 0; font-size: 11px; text-transform: uppercase; letter-spacing: .1em; color: #94a3b8; }
      .tc-cert-check[class] { margin-top: 8px; }
    `),
  };
};

export const certificate: PrebuiltTemplate = { id: "certificate", build };
