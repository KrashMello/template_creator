/**
 * Markup de tabla (`data.columns` / `data.rows`) manipulado desde los ajustes
 * del componente, sin obligar a tocar el Handlebars del textarea.
 *
 * - Clases de etiqueta: `<th class="p-4">` → `p-4`.
 * - Ruta de datos: el `table.cols` / `table.rows` del `{{#each}}` externo.
 */
export const readTagClass = (markup: string | undefined, tag: string): string =>
  new RegExp(`<${tag}\\b[^>]*?\\bclass="([^"]*)"`).exec(markup || "")?.[1] ?? "";

export const patchTagClass = (markup: string | undefined, tag: string, cls: string): string =>
  // shortcut: solo retoca etiquetas que ya llevan class=""; el markup de la paleta y las plantillas siempre lo traen.
  (markup || "").replace(
    new RegExp(`(<${tag}\\b[^>]*?\\bclass=")[^"]*(")`, "g"),
    (_match, before: string, after: string) =>
      `${before}${cls.replace(/"/g, "&quot;")}${after}`,
  );

export const readEachPath = (markup: string | undefined): string =>
  /\{\{#each\s+([\s\S]*?)\}\}/.exec(markup || "")?.[1]?.trim() ?? "";

/** Solo el primer `{{#each}}`: el `{{#each this}}` interno de las filas no se toca. */
export const patchEachPath = (markup: string | undefined, path: string): string =>
  (markup || "").replace(/\{\{#each\s+[\s\S]*?\}\}/, `{{#each ${path}}}`);

