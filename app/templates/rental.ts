import { LEGAL_CSS, logoSvg, makeBuilder, rootNode, templateCss } from "./helpers";
import type { BuildContext, PrebuiltTemplate, TemplateDoc, TemplateLocale } from "./types";

/** Textos del documento y nombres de nodo. */
const TXT: Record<TemplateLocale, Record<string, string>> = {
  es: {
    header: "Cabecera",
    footer: "Pie",
    logo: "Logotipo",
    org: "Inmobiliaria",
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
    roleLabel: "Condición",
    placeLabel: "Lugar y fecha",
    leaseWord: "Arrendamiento",
    title: "Contrato de arrendamiento",
    metaLine: "N.º {{lease.number}} · Lugar: {{lease.place}} · Fecha: {{lease.date}}",
    preamble:
      "Entre {{party.a.name}} ({{party.a.id}}), como arrendador, y {{party.b.name}} (DNI {{party.b.id}}), como arrendatario, se celebra el presente contrato sobre la vivienda descrita:",
    clause1Title: "1. Objeto y destino",
    clause1Text:
      "El arrendador cede en arrendamiento al arrendatario, quien acepta, la vivienda sita en {{property.address}}, compuesta por tres dormitorios, salón, cocina independiente, dos baños, trastero y plaza de garaje, con todos sus anexos, instalaciones y mobiliario, conforme al inventario que ambas partes firman en anexo y que se considera parte integrante del presente contrato. El arrendatario declara haber visitado la vivienda y conocer su estado actual de conservación.",
    clause2Title: "2. Duración",
    clause2Text:
      "El presente contrato tendrá una duración de doce (12) meses, contados a partir del día uno de noviembre de dos mil veintiséis, prorrogable conforme a lo dispuesto en la Ley de Arrendamientos Urbanos salvo que cualquiera de las partes manifieste su voluntad de no renovar con treinta (30) días de antelación como mínimo a la fecha de terminación del período en curso.",
    clause3Title: "3. Renta y forma de pago",
    clause3Text:
      "La renta mensual asciende a {{lease.rent}}, más {{lease.expenses}} en concepto de cuota de comunidad, contribución al impuesto sobre bienes inmuebles y suministros no incluidos, y se abonará por transferencia bancaria dentro de los cinco primeros días de cada mes natural. El retraso devengará los intereses legales de demora y facultará al arrendador para suspender los servicios tras treinta (30) días de impago. No se admitirán pagos en efectivo salvo acuerdo expreso de las partes por escrito.",
    clause4Title: "4. Fianza y actualización",
    clause4Text:
      "El arrendatario deja en concepto de fianza la cantidad de {{lease.deposit}}, que el arrendador conservará durante toda la vigencia del contrato y devolverá, en su caso, tras la inspección de la vivienda y dentro del mes siguiente a la fecha de terminación, descontando los gastos legalmente imputables. La renta podrá actualizarse una vez al año conforme al índice legal que resulte aplicable.",
    clause5Title: "5. Uso de la vivienda y subarriendo",
    clause5Text:
      "El arrendatario destinará la vivienda exclusivamente a vivienda permanente de su unidad familiar, respetará las normas de régimen de la comunidad de propietarios y no podrá subarrendar, ceder o transmitir, en todo o en parte, el presente contrato sin el consentimiento previo y por escrito del arrendador. Tampoco podrá modificar la vivienda, instalar aparatos o realizar obras sin dicho consentimiento.",
    clause6Title: "6. Conservación y reparaciones",
    clause6Text:
      "El arrendador realizará las reparaciones necesarias para conservar la vivienda en condiciones de habitabilidad, correspondiendo al arrendatario los desperfectos derivados de un uso indebido o de su negligencia. Cualquiera de las partes comunicará a la otra, de forma inmediata, cualquier avería o incidencia que afecte a la vivienda o a sus instalaciones. Las mejoras o añadidos que realice el arrendatario podrán retirarse por el arrendador al término del contrato, salvo pacto en contrario.",
    clause7Title: "7. Resolución anticipada",
    clause7Text:
      "El arrendatario podrá desistir del presente contrato una vez que hayan transcurrido al menos seis meses, con preaviso de treinta (30) días y mediante el abono de la compensación legal correspondiente. El arrendador podrá resolverlo, asimismo, por falta de pago, por falta de pago de la fianza o por destinar la vivienda a un fin distinto del pactado.",
    clause8Title: "8. Ley aplicable y jurisdicción",
    clause8Text:
      "El presente contrato se rige por la legislación española y, con carácter supletorio, por la Ley de Arrendamientos Urbanos. Para cualquier controversia derivada de su interpretación o ejecución, las partes se someten a los Juzgados y Tribunales de la ciudad de Madrid, con renuncia expresa a cualquier otro fuero.",
    clause9Title: "9. Comunicaciones y notificaciones",
    clause9Text:
      "Las partes quedan designadas en los domicilios que constan en el encabezamiento del presente contrato para recibir notificaciones. Cualquier comunicación deberá efectuarse por escrito y se entenderá recibida en el día hábil siguiente a su envío, sin perjuicio de que puedan utilizarse medios electrónicos con acuse de recibo.",
    clause10Title: "10. Anexos e integración",
    clause10Text:
      "El inventario de la vivienda y la ficha de estado inicial, firmados por ambas partes, forman parte integrante de este contrato a todos los efectos. La nulidad de alguna de las cláusulas no afectará a la validez del resto, que permanecerán plenamente en vigor.",
    closingText:
      "En prueba de conformidad, ambas partes firman el presente contrato en el lugar y la fecha indicados, por duplicado ejemplar, tras haber leído y comprendido íntegramente su contenido.",
    roleA: "El arrendador",
    roleB: "El arrendatario",
    placeDate: "{{lease.place}}, {{lease.date}}",
    orgLine: "{{organization.name}} · {{organization.city}}",
    refLine: "Arrendamiento {{lease.number}}",
    dateText: "14 de octubre de 2026",
    place: "Madrid",
    rent: "950,00 €",
    expenses: "80,00 €",
    deposit: "950,00 €",
  },
  en: {
    header: "Header",
    footer: "Footer",
    logo: "Logo",
    org: "Agency",
    wordmark: "Wordmark",
    body: "Lease body",
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
    leaseWord: "Lease",
    title: "Residential lease agreement",
    metaLine: "No. {{lease.number}} · Place: {{lease.place}} · Date: {{lease.date}}",
    preamble:
      "Between {{party.a.name}} ({{party.a.id}}), as landlord, and {{party.b.name}} (ID {{party.b.id}}), as tenant, this agreement is entered into for the dwelling described below:",
    clause1Title: "1. Object and use",
    clause1Text:
      "The landlord leases to the tenant, who accepts, the dwelling located at {{property.address}}, comprising three bedrooms, a living room, an independent kitchen, two bathrooms, a storage room and a parking space, together with all its annexes, installations and furniture, in accordance with the inventory signed by both parties as an annex, which forms an integral part of this agreement. The tenant declares that it has visited the dwelling and is aware of its current state of preservation.",
    clause2Title: "2. Term",
    clause2Text:
      "This agreement shall run for twelve (12) months starting on 1 November 2026, renewable in accordance with the Spanish Urban Leases Act unless either party gives notice of non-renewal at least thirty (30) days before the end of the current term.",
    clause3Title: "3. Rent and payment",
    clause3Text:
      "The monthly rent amounts to {{lease.rent}}, plus {{lease.expenses}} for community fees, property tax and utilities not included, payable by bank transfer within the first five days of each calendar month. Late payment shall accrue the statutory default interest and shall entitle the landlord to suspend the services after thirty (30) days of non-payment. Cash payments shall not be accepted unless the parties agree otherwise in writing.",
    clause4Title: "4. Deposit and updates",
    clause4Text:
      "The tenant leaves {{lease.deposit}} as a deposit, which the landlord shall hold for the entire term of the agreement and shall return, where applicable, after inspecting the dwelling and within one month of the termination date, deducting any amounts lawfully charged. The rent may be updated once a year in accordance with the applicable legal index.",
    clause5Title: "5. Use of the dwelling and subletting",
    clause5Text:
      "The tenant shall use the dwelling exclusively as the permanent home of its family unit, shall comply with the community rules of the owners' association and may not sublet, assign or transfer, in whole or in part, this agreement without the landlord's prior written consent. Nor may it alter the dwelling, install appliances or carry out works without such consent.",
    clause6Title: "6. Maintenance and repairs",
    clause6Text:
      "The landlord shall carry out the repairs needed to keep the dwelling in habitable conditions, while the tenant shall be responsible for any damage arising from misuse or negligence. Either party shall immediately notify the other of any breakdown or incident affecting the dwelling or its installations. Any improvements or additions made by the tenant may be removed by the landlord at the end of the agreement, unless otherwise agreed.",
    clause7Title: "7. Early termination",
    clause7Text:
      "The tenant may withdraw from this agreement once at least six months have elapsed, with thirty (30) days notice and payment of the legally established compensation. The landlord may also terminate it for non-payment of rent or of the deposit, or for using the dwelling for a purpose other than the one agreed.",
    clause8Title: "8. Governing law and jurisdiction",
    clause8Text:
      "This agreement is governed by Spanish law and, subsidiarily, by the Spanish Urban Leases Act. For any dispute arising from its interpretation or performance, the parties submit to the courts of the city of Madrid, expressly waiving any other jurisdiction that may apply.",
    clause9Title: "9. Communications and notices",
    clause9Text:
      "The parties designate the addresses stated in the header of this agreement for the purpose of receiving notices. Any communication shall be made in writing and shall be deemed received on the business day following its dispatch, without prejudice to the use of electronic means with confirmation of receipt.",
    clause10Title: "10. Annexes and integration",
    clause10Text:
      "The inventory of the dwelling and the initial condition report, signed by both parties, form an integral part of this agreement for all purposes. The nullity of any clause shall not affect the validity of the remainder, which shall remain fully in force.",
    closingText:
      "In witness whereof, both parties sign this agreement at the place and date stated, in two identical counterparts, having read and fully understood its contents.",
    roleA: "The landlord",
    roleB: "The tenant",
    placeDate: "{{lease.place}}, {{lease.date}}",
    orgLine: "{{organization.name}} · {{organization.city}}",
    refLine: "Lease {{lease.number}}",
    dateText: "October 14, 2026",
    place: "Madrid",
    rent: "€950.00",
    expenses: "€80.00",
    deposit: "€950.00",
  },
};

const dataFor = (t: Record<string, string>): Record<string, any> => ({
  organization: { name: "Acme Inmobiliaria", city: "Madrid" },
  lease: {
    number: "AR-2026-0091",
    date: t.dateText,
    place: t.place,
    rent: t.rent,
    expenses: t.expenses,
    deposit: t.deposit,
  },
  property: { address: "Calle Alcalá 120, 3.º B, Madrid" },
  party: {
    a: { name: "Acme Inmobiliaria S.L.", id: "B-12345678" },
    b: { name: "Ana Krashmello", id: "45.812.903-K" },
  },
});

const build = ({ locale }: BuildContext): TemplateDoc => {
  const t = TXT[locale] ?? TXT.es;
  const b = makeBuilder("ren");
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
        b.text(t.wordmark, t.leaseWord, "tc-legal-wordmark"),
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

export const rental: PrebuiltTemplate = { id: "rental", build };
