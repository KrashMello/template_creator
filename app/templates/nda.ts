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
    body: "Cuerpo del acuerdo",
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
    roleLabel: "Condición",
    placeLabel: "Lugar y fecha",
    ndaWord: "Confidencial",
    title: "Acuerdo de confidencialidad",
    metaLine: "N.º {{nda.number}} · Lugar: {{nda.place}} · Fecha: {{nda.date}}",
    preamble:
      "Entre {{party.a.name}} (DNI {{party.a.id}}), en adelante «la parte divulgante», y {{party.b.name}} (DNI {{party.b.id}}), en adelante «la parte receptora», se pacta lo siguiente:",
    clause1Title: "1. Definición de información confidencial",
    clause1Text:
      "A efectos del presente acuerdo, se considera información confidencial cualquier dato, documento, material o soporte —ya sea oral, escrito, gráfico o electrónico— facilitado por una de las partes a la otra, incluyendo, sin carácter limitativo, fórmulas, prototipos, planes de negocio, listas de clientes, precios, propiedad intelectual y cualquier información identificada razonablemente como confidencial en el momento de su comunicación. La información entregada en soporte tangible se considerará confidencial aunque no lleve identificación expresa.",
    clause2Title: "2. Exclusiones",
    clause2Text:
      "Quedan excluidos de la obligación de confidencialidad los datos que: (i) pasen a ser de dominio público sin incumplimiento del presente acuerdo; (ii) ya fueren conocidos legítimamente por la parte receptora con anterioridad a su recepción; o (iii) deban revelarse por mandato legal o de autoridad competente, siempre que se dé cuenta a la parte divulgante con la mayor antelación posible.",
    clause3Title: "3. Obligaciones de la parte receptora",
    clause3Text:
      "La parte receptora utilizará la información única y exclusivamente para la finalidad expresamente pactada en este acuerdo, y la mantendrá custodiada con al menos el mismo grado de diligencia que el que emplea para proteger su propia información sensible, y en ningún caso inferior al de un profesional razonable en circunstancias similares. El incumplimiento de estas obligaciones facultará a la parte divulgante a exigir la cesación inmediata de los actos que lo supongan, sin perjuicio de las indemnizaciones que puedan corresponder.",
    clause4Title: "4. Divulgación a terceros",
    clause4Text:
      "La parte receptora no comunicará ni pondrá la información a disposición de terceros, con excepción de sus empleados, colaboradores o asesores que precise conocerla para el cumplimiento de la finalidad del acuerdo, quienes quedarán sujetos a las mismas condiciones aquí previstas y por cuyo cumplimiento responderá solidariamente la parte receptora.",
    clause5Title: "5. Duración del acuerdo",
    clause5Text:
      "El presente acuerdo entrará en vigor en la fecha de su firma y permanecerá vigente durante cinco (5) años. Las obligaciones de confidencialidad se mantendrán tanto durante la vigencia del acuerdo como con posterioridad a su extinción, mientras la información conserve su carácter confidencial. Asimismo, la parte receptora velará por que estas obligaciones se recuerden expresamente a todo el personal que tenga acceso a la información.",
    clause6Title: "6. Devolución o destrucción",
    clause6Text:
      "Finalizada la relación o a solicitud escrita de la parte divulgante, la parte receptora devolverá o destruirá dentro del plazo de diez (10) días todos los documentos, copias y soportes que contengan la información recibida, dejando constancia fehaciente de su destrucción cuando así se le requiera.",
    clause7Title: "7. Sin licencia ni garantía",
    clause7Text:
      "Nada de lo previsto en este acuerdo concederá derechos de propiedad industrial o intelectual sobre la información intercambiada, ni supondrá la obligación de celebrar contrato alguno entre las partes. La información se facilita «tal cual», sin garantía alguna sobre su exactitud, actualidad o idoneidad para un fin concreto.",
    clause8Title: "8. Ley aplicable y jurisdicción",
    clause8Text:
      "El presente acuerdo se rige por la legislación española y, para cualquier controversia derivada de su interpretación o cumplimiento, las partes se someten a los Juzgados y Tribunales de la ciudad de Madrid, con renuncia expresa a cualquier otro fuero.",
    clause9Title: "9. Notificaciones",
    clause9Text:
      "Cualquier comunicación prevista en el presente acuerdo deberá efectuarse por escrito y mediante carta certificada, correo electrónico con acuse de recibo o notificación fehaciente, a las direcciones que las partes hagan constar, y se entenderá producida en el día hábil siguiente a su envío.",
    clause10Title: "10. Íntegro del acuerdo y modificaciones",
    clause10Text:
      "El presente acuerdo constituye la íntegra de las obligaciones entre las partes en relación con su objeto y sustituye cualquier entendimiento anterior sobre el mismo. Toda enmienda, renuncia o tolerancia deberá constar por escrito y ser firmada por ambas partes para resultar válida.",
    closingText:
      "En prueba de conformidad, las partes firman el presente acuerdo en el lugar y la fecha indicados, por duplicado ejemplar, una vez leído y comprendido todo su contenido.",
    roleA: "La parte divulgante",
    roleB: "La parte receptora",
    placeDate: "{{nda.place}}, {{nda.date}}",
    orgLine: "{{organization.name}} · {{organization.city}}",
    refLine: "NDA {{nda.number}}",
    dateText: "14 de octubre de 2026",
    place: "Madrid",
  },
  en: {
    header: "Header",
    footer: "Footer",
    logo: "Logo",
    org: "Organization",
    wordmark: "Wordmark",
    body: "Agreement body",
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
    roleLabel: "Capacity",
    placeLabel: "Place & date",
    ndaWord: "Confidential",
    title: "Non-disclosure agreement",
    metaLine: "No. {{nda.number}} · Place: {{nda.place}} · Date: {{nda.date}}",
    preamble:
      "Between {{party.a.name}} (ID {{party.a.id}}), hereinafter “the disclosing party”, and {{party.b.name}} (ID {{party.b.id}}), hereinafter “the receiving party”, the following is agreed:",
    clause1Title: "1. Definition of confidential information",
    clause1Text:
      "For the purposes of this agreement, confidential information means any data, document, material or medium —whether oral, written, graphic or electronic— disclosed by one party to the other, including but not limited to formulas, prototypes, business plans, customer lists, pricing, intellectual property and any information reasonably identified as confidential at the time of disclosure. Information supplied in tangible form shall be deemed confidential even without an express label.",
    clause2Title: "2. Exclusions",
    clause2Text:
      "The confidentiality obligations shall not apply to information that: (i) is or becomes public domain without breach of this agreement; (ii) was legitimately known by the receiving party before its disclosure; or (iii) must be disclosed by law or by order of a competent authority, provided the disclosing party is notified as early as possible.",
    clause3Title: "3. Obligations of the receiving party",
    clause3Text:
      "The receiving party shall use the information solely for the purpose expressly agreed in this agreement, and shall keep it with at least the same degree of care it uses to protect its own sensitive information, and in no case less than that of a reasonable professional in similar circumstances. Any breach of these obligations shall entitle the disclosing party to require the immediate cessation of the acts involved, without prejudice to any compensation that may be due.",
    clause4Title: "4. Disclosure to third parties",
    clause4Text:
      "The receiving party shall not disclose or make the information available to third parties, except to its employees, contractors or advisers who need to know it for the purpose of this agreement, who shall be bound by these same terms and for whose compliance the receiving party shall be jointly responsible.",
    clause5Title: "5. Term of the agreement",
    clause5Text:
      "This agreement enters into force on the date of its signature and shall remain in effect for five (5) years. The confidentiality obligations shall survive both during the term of the agreement and after its termination, for as long as the information retains its confidential nature. The receiving party shall also ensure that these obligations are expressly brought to the attention of all personnel with access to the information.",
    clause6Title: "6. Return or destruction",
    clause6Text:
      "Once the relationship ends or upon the disclosing party's written request, the receiving party shall return or destroy within ten (10) days all documents, copies and media containing the information received, providing reliable evidence of such destruction where required.",
    clause7Title: "7. No licence or warranty",
    clause7Text:
      "Nothing in this agreement shall grant any industrial or intellectual property rights over the information exchanged, nor shall it create any obligation for the parties to enter into a contract. The information is provided “as is”, without any warranty as to its accuracy, completeness or fitness for a particular purpose.",
    clause8Title: "8. Governing law and jurisdiction",
    clause8Text:
      "This agreement is governed by Spanish law and, for any dispute arising from its interpretation or performance, the parties submit to the courts of the city of Madrid, expressly waiving any other jurisdiction that may apply.",
    clause9Title: "9. Notices",
    clause9Text:
      "Any communication contemplated in this agreement shall be made in writing by registered letter, read-receipt email or formal notice to the addresses stated by the parties, and shall be deemed served on the business day following its dispatch.",
    clause10Title: "10. Entire agreement and amendments",
    clause10Text:
      "This agreement constitutes the entire obligation between the parties as to its subject matter and supersedes any prior understanding on the same. Any amendment, waiver or indulgence shall be made in writing and signed by both parties in order to be valid.",
    closingText:
      "In witness whereof, the parties sign this agreement at the place and date stated, in two identical counterparts, having read and understood all of its contents.",
    roleA: "The disclosing party",
    roleB: "The receiving party",
    placeDate: "{{nda.place}}, {{nda.date}}",
    orgLine: "{{organization.name}} · {{organization.city}}",
    refLine: "NDA {{nda.number}}",
    dateText: "October 14, 2026",
    place: "Madrid",
  },
};

const dataFor = (t: Record<string, string>): Record<string, any> => ({
  organization: { name: "Acme Technologies", city: "Madrid" },
  nda: { number: "NDA-2026-0033", date: t.dateText, place: t.place },
  party: {
    a: { name: "Acme Technologies S.L.", id: "B-87654321" },
    b: { name: "Krashmello S.L.", id: "ESA87654321" },
  },
});

const build = ({ locale }: BuildContext): TemplateDoc => {
  const t = TXT[locale] ?? TXT.es;
  const b = makeBuilder("nda");
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
        b.text(t.wordmark, t.ndaWord, "tc-legal-wordmark"),
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

export const nda: PrebuiltTemplate = { id: "nda", build };
