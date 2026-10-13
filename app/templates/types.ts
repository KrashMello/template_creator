import type { ElementDataSet } from "../stores/template";

/** Idiomas soportados por las plantillas precreadas (coincide con `i18n.locales`). */
export type TemplateLocale = "es" | "en";

/** Documento completo que una plantilla inyecta en el store. */
export interface TemplateDoc {
  schema: ElementDataSet;
  header: ElementDataSet;
  footer: ElementDataSet;
  data: Record<string, any>;
  cssCode: string;
}

export interface BuildContext {
  locale: TemplateLocale;
}

export interface PrebuiltTemplate {
  /** Id estable, también usado como clave de i18n en la galería. */
  id: string;
  /** Genera una copia nueva del documento: el store muta el árbol que recibe. */
  build: (ctx: BuildContext) => TemplateDoc;
}
