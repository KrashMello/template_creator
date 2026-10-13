import handlebars from "handlebars";
import { generateLayoutHtml } from "../stores/template";
import type { ElementDataSet } from "../stores/template";
import { certificate } from "./certificate";
import { invoice } from "./invoice";
import { receipt } from "./receipt";
import { report } from "./report";
import { shippingLabel } from "./shipping-label";
import { showcase } from "./showcase";
import type { PrebuiltTemplate, TemplateDoc, TemplateLocale } from "./types";

/** Orden en que aparecen en la barra izquierda. */
export const PREBUILT_TEMPLATES: PrebuiltTemplate[] = [
  invoice,
  report,
  certificate,
  receipt,
  shippingLabel,
  showcase,
];

export type { PrebuiltTemplate, TemplateDoc, TemplateLocale };

export const toTemplateLocale = (code: string): TemplateLocale =>
  code === "en" ? "en" : "es";

/**
 * HTML completo (cabecera + cuerpo + pie) de una plantilla, listo para usarse
 * como `srcdoc` de las miniaturas de la galería: `pdf: true` evita el envoltorio
 * editable del editor y el CDN de Tailwind del propio documento los estiliza.
 */
export function renderTemplateDoc(doc: TemplateDoc): string {
  const root: ElementDataSet = {
    id: "preview",
    type: "container",
    tag: "div",
    name: "preview",
    data: {},
    children: [...doc.header.children, ...doc.schema.children, ...doc.footer.children],
  };
  const html = generateLayoutHtml({ schema: root, cssCode: doc.cssCode, pdf: true });
  return handlebars.compile(html)(doc.data);
}
