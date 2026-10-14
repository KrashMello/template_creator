import { LEGAL_CSS, logoSvg, makeBuilder, rootNode, templateCss } from "./helpers";
import type { BuildContext, PrebuiltTemplate, TemplateDoc, TemplateLocale } from "./types";

/** Textos del documento y nombres de nodo. */
const TXT: Record<TemplateLocale, Record<string, string>> = {
  es: {
    header: "Cabecera",
    footer: "Pie",
    logo: "Logotipo",
    org: "Organización",
    wordmark: "Rótulo",
    body: "Cuerpo del contrato",
    docTitle: "Título",
    meta: "Referencias",
    parties: "Preámbulo",
    clause1: "Cláusula 1",
    clause2: "Cláusula 2",
    clause3: "Cláusula 3",
    clause4: "Cláusula 4",
    clause5: "Cláusula 5",
    clause6: "Cláusula 6",
    clause7: "Cláusula 7",
    clause8: "Cláusula 8",
    clause9: "Cláusula 9",
    clause10: "Cláusula 10",
    closing: "Cierre",
    signs: "Firmas",
    signA: "Firma A",
    signB: "Firma B",
    roleLabel: "Cargo",
    placeLabel: "Lugar y fecha",
    contractWord: "Contrato",
    title: "Contrato de prestación de servicios",
    metaLine: "N.º {{contract.number}} · Lugar: {{contract.place}} · Fecha: {{contract.date}}",
    preamble:
      "Entre {{party.a.name}} (DNI {{party.a.id}}), en adelante «la parte A», y {{party.b.name}} (DNI {{party.b.id}}), en adelante «la parte B», se pacta lo siguiente:",
    clause1Title: "1. Objeto del contrato",
    clause1Text:
      "El presente contrato tiene por objeto la prestación de servicios de consultoría por parte de la parte prestadora a favor de la parte cliente, quienes convienen en regular por escrito las condiciones en que dichos servicios se prestarán, con la diligencia y dentro de los plazos acordados por ambas partes. Los servicios se prestarán de forma continuada durante toda la vigencia del contrato y podrán ampliarse o concretarse mediante acuerdo escrito de las partes.",
    clause2Title: "2. Alcance y obligaciones de las partes",
    clause2Text:
      "La parte prestadora ejecutará los servicios descritos en el anexo I con los medios humanos y materiales que estime oportunos, y comunicará por escrito cualquier circunstancia que pueda afectar a los plazos de entrega. La parte cliente, por su parte, facilitará la información, los accesos y los medios necesarios para el desarrollo de los servicios, designará una persona responsable ante la que canalizar todas las comunicaciones y abonará en tiempo y forma las cantidades recogidas en la cláusula tercera como contraprestación de los servicios recibidos.",
    clause3Title: "3. Precio y forma de pago",
    clause3Text:
      "El importe total de los servicios asciende a {{contract.amount}} más el IVA aplicable, con factura mensual que se emitirá durante los cinco primeros días de cada mes natural. El pago se realizará por transferencia bancaria a la cuenta que indique la parte prestadora dentro de los quince (15) días naturales siguientes a la fecha de emisión de cada factura. El retraso en el pago devengará los intereses legales de demora sin necesidad de requerimiento previo.",
    clause4Title: "4. Duración, prórroga y rescisión",
    clause4Text:
      "El contrato tendrá una duración de doce (12) meses contados desde la fecha de su firma y se prorrogará automáticamente por períodos iguales y sucesivos, salvo que cualquiera de las partes manifieste su voluntad de no renovar con treinta (30) días naturales de antelación a la fecha de terminación. Asimismo, cualquiera de las partes podrá resolverlo de manera anticipada si la otra incumpliera cualquiera de sus obligaciones y no subsanara el incumplimiento dentro de los diez (10) días hábiles siguientes a la notificación fehaciente.",
    clause5Title: "5. Confidencialidad",
    clause5Text:
      "Cada una de las partes se obliga a mantener la más estricta confidencialidad sobre toda la información documental, técnica, comercial o financiera que reciba de la otra con ocasión de la ejecución de este contrato, y a no comunicarla ni ponerla a disposición de terceros ajenos a su organización, ni utilizarla para fines distintos de los expresamente previstos en este documento. Esta obligación se mantendrá durante toda la vigencia del contrato y durante los doce (12) meses siguientes a su terminación.",
    clause6Title: "6. Propiedad intelectual",
    clause6Text:
      "Serán de titularidad exclusiva de la parte cliente los resultados, entregables y desarrollos creados específicamente para ella y abonados íntegramente en virtud de este contrato, sin perjuicio de las herramientas, metodologías y conocimientos preexistentes de la parte prestadora, que permanecerán bajo su exclusivo dominio. Cada parte garantiza que los materiales que aporta no infringen derechos de terceros.",
    clause7Title: "7. Responsabilidad",
    clause7Text:
      "La parte prestadora responderá únicamente de los daños directos y debidamente acreditados que su actuación negligente cause a la parte cliente, con límite del importe efectivamente abonado por los servicios correspondientes al período en que se produzca el hecho. En ningún caso las partes responderán por daños indirectos, pérdida de beneficios o de oportunidad de negocio, y procurarán resolver de buena fe cualquier diferencia antes de acudir a la vía judicial.",
    clause8Title: "8. Ley aplicable y jurisdicción",
    clause8Text:
      "El presente contrato se rige por la legislación española. Para cualquier controversia derivada de su interpretación o ejecución, las partes se someten a los Juzgados y Tribunales de la ciudad de Madrid, con renuncia expresa a cualquier otro fuero que pudiera corresponderles.",
    clause9Title: "9. Fuerza mayor",
    clause9Text:
      "Ninguna de las partes responderá del incumplimiento de sus obligaciones cuando este derive de una causa de fuerza mayor entendida como el acontecimiento imprevisible e inevitable que impida temporalmente su cumplimiento, siempre que la parte afectada lo comunique a la otra en un plazo máximo de cinco (5) días hábiles y quede acreditada la relación de causa a efecto.",
    clause10Title: "10. Íntegro del acuerdo y modificaciones",
    clause10Text:
      "El presente contrato, junto con el anexo I, constituye el acuerdo completo entre las partes y sustituye cualquier otra manifestación u entendimiento previo relativo a su objeto. Toda modificación, prórroga o renuncia deberá constar por escrito y ser firmada por ambas partes para resultar válida y exigible.",
    closingText:
      "En prueba de conformidad, ambas partes firman el presente documento en el lugar y la fecha indicados, por duplicado ejemplar y a un solo efecto, una vez leído y comprendido todo su contenido.",
    roleA: "La parte prestadora",
    roleB: "La parte cliente",
    placeDate: "{{contract.place}}, {{contract.date}}",
    orgLine: "{{organization.name}} · {{organization.city}}",
    refLine: "Contrato {{contract.number}}",
    dateText: "14 de octubre de 2026",
    place: "Madrid",
    amount: "1.200,00 €",
  },
  en: {
    header: "Header",
    footer: "Footer",
    logo: "Logo",
    org: "Organization",
    wordmark: "Wordmark",
    body: "Contract body",
    docTitle: "Title",
    meta: "Reference",
    parties: "Preamble",
    clause1: "Clause 1",
    clause2: "Clause 2",
    clause3: "Clause 3",
    clause4: "Clause 4",
    clause5: "Clause 5",
    clause6: "Clause 6",
    clause7: "Clause 7",
    clause8: "Clause 8",
    clause9: "Clause 9",
    clause10: "Clause 10",
    closing: "Closing",
    signs: "Signatures",
    signA: "Signature A",
    signB: "Signature B",
    roleLabel: "Role",
    placeLabel: "Place & date",
    contractWord: "Contract",
    title: "Service agreement",
    metaLine: "No. {{contract.number}} · Place: {{contract.place}} · Date: {{contract.date}}",
    preamble:
      "Between {{party.a.name}} (ID {{party.a.id}}), hereinafter “Party A”, and {{party.b.name}} (ID {{party.b.id}}), hereinafter “Party B”, the following is agreed:",
    clause1Title: "1. Purpose of this agreement",
    clause1Text:
      "This agreement governs the consulting services provided by the service provider to the client, who agree to set out in writing the terms under which such services shall be delivered, with the diligence and within the deadlines agreed by both parties. The services shall be provided on a continuous basis throughout the term of the agreement and may be extended or specified by written agreement of the parties.",
    clause2Title: "2. Scope and obligations of the parties",
    clause2Text:
      "The service provider shall carry out the services described in Annex I using the human and material resources it deems appropriate, and shall notify in writing any circumstance that may affect the delivery schedule. The client shall provide the information, access and resources needed for the performance of the services, shall appoint a single point of contact for all communications, and shall pay in good time the amounts set out in clause 3 as consideration for the services received.",
    clause3Title: "3. Price and payment",
    clause3Text:
      "The total fee amounts to {{contract.amount}} plus applicable VAT, invoiced monthly during the first five days of each calendar month. Payment shall be made by bank transfer to the account indicated by the service provider within fifteen (15) calendar days of the invoice date. Late payment shall accrue the statutory default interest without any further notice.",
    clause4Title: "4. Term, renewal and termination",
    clause4Text:
      "This agreement runs for twelve (12) months from its signature date and shall be automatically renewed for successive equal terms, unless either party gives notice of non-renewal at least thirty (30) calendar days before the expiry date. Either party may also terminate it early if the other party breaches any of its obligations and fails to remedy such breach within ten (10) business days of formal notice.",
    clause5Title: "5. Confidentiality",
    clause5Text:
      "Each party agrees to keep strictly confidential all documentary, technical, commercial or financial information received from the other party in connection with this agreement, and not to disclose it to third parties outside its organisation, nor to use it for any purpose other than those expressly set out in this document. This obligation shall survive during the entire term of the agreement and for the twelve (12) months following its termination.",
    clause6Title: "6. Intellectual property",
    clause6Text:
      "Results, deliverables and developments created specifically for the client and fully paid for under this agreement shall belong exclusively to the client, without prejudice to the pre-existing tools, methodologies and know-how of the service provider, which shall remain under its sole ownership. Each party warrants that the materials it supplies do not infringe the rights of third parties.",
    clause7Title: "7. Liability",
    clause7Text:
      "The service provider shall only be liable for direct, evidenced damage caused to the client by its negligent conduct, capped at the amount actually paid for the services during the period in which the incident occurred. In no event shall either party be liable for indirect damage, loss of profit or loss of business opportunity, and both parties shall seek to resolve any difference in good faith before resorting to the courts.",
    clause8Title: "8. Governing law and jurisdiction",
    clause8Text:
      "This agreement is governed by Spanish law. Any dispute arising from its interpretation or performance shall be submitted to the courts of the city of Madrid, expressly waiving any other jurisdiction that may apply.",
    clause9Title: "9. Force majeure",
    clause9Text:
      "Neither party shall be liable for any failure to perform its obligations when that failure results from a cause of force majeure, understood as an unforeseeable and unavoidable event that temporarily prevents performance, provided that the affected party notifies the other within five (5) business days and a causal link is evidenced.",
    clause10Title: "10. Entire agreement and amendments",
    clause10Text:
      "This agreement, together with Annex I, constitutes the entire understanding between the parties and supersedes any prior statement or arrangement regarding its subject matter. Any amendment, extension or waiver shall be made in writing and signed by both parties in order to be valid and binding.",
    closingText:
      "In witness whereof, both parties sign this document at the place and date stated, in two identical counterparts, having read and understood all of its contents.",
    roleA: "The service provider",
    roleB: "The client",
    placeDate: "{{contract.place}}, {{contract.date}}",
    orgLine: "{{organization.name}} · {{organization.city}}",
    refLine: "Contract {{contract.number}}",
    dateText: "October 14, 2026",
    place: "Madrid",
    amount: "€1,200.00",
  },
};

const dataFor = (t: Record<string, string>): Record<string, any> => ({
  organization: { name: "Acme Consulting", city: "Madrid" },
  contract: { number: "CS-2026-0148", date: t.dateText, place: t.place, amount: t.amount },
  party: {
    a: { name: "Ana Krashmello", id: "45.812.903-K" },
    b: { name: "Luis Krashmello", id: "52.104.776-M" },
  },
});

const build = ({ locale }: BuildContext): TemplateDoc => {
  const t = TXT[locale] ?? TXT.es;
  const b = makeBuilder("ct");
  const logo = logoSvg("A", "#334155");

  const header = rootNode("header");
  header.children = [
    b.row(
      t.header,
      [
        b.row(
          t.org,
          [
            b.image(t.logo, logo, "tc-legal-logo"),
            b.text(t.org, "{{organization.name}}", ["tc-strong", "tc-xs"]),
          ],
          "tc-rowcenter",
        ),
        b.text(t.wordmark, t.contractWord, "tc-legal-wordmark"),
      ],
      ["tc-pagepad", "tc-rowbetween"],
    ),
  ];

  /** Cabecera de cláusula + su párrafo. */
  const clause = (n: number, title: string, text: string) => [
    b.text(t[`clause${n}`], title, "tc-legal-clause"),
    b.text(t[`clause${n}`], text, "tc-legal-text"),
  ];

  const schema = rootNode("preview");
  schema.children = [
    b.container(
      t.body,
      [
        b.text(t.docTitle, t.title, "tc-legal-title"),
        b.text(t.meta, t.metaLine, ["tc-muted", "tc-legal-meta"]),
        b.text(t.parties, t.preamble, "tc-legal-parties"),
        ...clause(1, t.clause1Title, t.clause1Text),
        ...clause(2, t.clause2Title, t.clause2Text),
        ...clause(3, t.clause3Title, t.clause3Text),
        ...clause(4, t.clause4Title, t.clause4Text),
        ...clause(5, t.clause5Title, t.clause5Text),
        ...clause(6, t.clause6Title, t.clause6Text),
        ...clause(7, t.clause7Title, t.clause7Text),
        ...clause(8, t.clause8Title, t.clause8Text),
        ...clause(9, t.clause9Title, t.clause9Text),
        ...clause(10, t.clause10Title, t.clause10Text),
        b.text(t.closing, t.closingText, "tc-legal-closing"),
        b.row(
          t.signs,
          [
            b.col(
              t.signA,
              [
                b.text(t.signA, "{{party.a.name}}", "tc-sign-line"),
                b.text(t.roleLabel, t.roleA, "tc-sign-role"),
                b.text(t.placeLabel, t.placeDate, "tc-sign-detail"),
              ],
              ["tc-stack", "tc-sign-col"],
            ),
            b.col(
              t.signB,
              [
                b.text(t.signB, "{{party.b.name}}", "tc-sign-line"),
                b.text(t.roleLabel, t.roleB, "tc-sign-role"),
                b.text(t.placeLabel, t.placeDate, "tc-sign-detail"),
              ],
              ["tc-stack", "tc-sign-col"],
            ),
          ],
          ["tc-cols", "tc-signs"],
        ),
      ],
      "tc-legal-body",
    ),
  ];

  const footer = rootNode("footer");
  footer.children = [
    b.row(
      t.footer,
      [
        b.text(t.footer, t.orgLine, ["tc-xs", "tc-muted"]),
        b.text(t.footer, t.refLine, ["tc-xs", "tc-muted"]),
      ],
      ["tc-pagepad", "tc-rowbetween"],
    ),
  ];

  return {
    schema,
    header,
    footer,
    data: dataFor(t),
    cssCode: templateCss(LEGAL_CSS),
  };
};

export const contract: PrebuiltTemplate = { id: "contract", build };
