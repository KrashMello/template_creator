import type { Component } from "vue";
import barcodeIcon from "./components/svg/barcode.vue";
import checkboxIcon from "./components/svg/checkbox.vue";
import colIcon from "./components/svg/col.vue";
import containerIcon from "./components/svg/container.vue";
import imageIcon from "./components/svg/image.vue";
import paragraphIcon from "./components/svg/paragraph.vue";
import rowIcon from "./components/svg/row.vue";
import tableIcon from "./components/svg/table.vue";

/**
 * Definiciones de los componentes de la paleta "Básicos".
 *
 * Es la única fuente de verdad: la barra izquierda las pinta como botones
 * arrastrables y las plantillas precreadas clonan exactamente estos `data`
 * (clases y markup de Handlebars incluidos), de modo que un nodo de plantilla
 * es el mismo componente que el que sueltas desde la paleta. Lo único que una
 * plantilla añade encima es una clase marcadora (`tc-…`) que usa su `cssCode`.
 */
export type PaletteId =
  | "text"
  | "table"
  | "row"
  | "col"
  | "image"
  | "checkbox"
  | "container"
  | "barcode";

export interface PaletteComponent {
  /** Clave estable; la usan las plantillas para pedir sus `data`. */
  id: PaletteId;
  tag: string;
  /** Clave de i18n con el nombre visible del componente. */
  nameKey: string;
  accent: keyof typeof ACCENT_MAP;
  icon: Component;
  /** Defaults exactos que se envían en el payload de arrastre. Nunca mutarlos. */
  data: Record<string, any>;
}

export const ACCENT_MAP = {
  slate: { border: "border-slate-200 hover:border-slate-300", bg: "bg-white hover:bg-slate-50", iconBg: "bg-slate-100", icon: "text-slate-600" },
  blue: { border: "border-blue-100 hover:border-blue-200", bg: "bg-blue-50/50 hover:bg-blue-50", iconBg: "bg-blue-100", icon: "text-blue-600" },
  indigo: { border: "border-indigo-100 hover:border-indigo-200", bg: "bg-indigo-50/50 hover:bg-indigo-50", iconBg: "bg-indigo-100", icon: "text-indigo-600" },
  emerald: { border: "border-emerald-100 hover:border-emerald-200", bg: "bg-emerald-50/50 hover:bg-emerald-50", iconBg: "bg-emerald-100", icon: "text-emerald-600" },
  purple: { border: "border-purple-100 hover:border-purple-200", bg: "bg-purple-50/50 hover:bg-purple-50", iconBg: "bg-purple-100", icon: "text-purple-600" },
  amber: { border: "border-amber-100 hover:border-amber-200", bg: "bg-amber-50/50 hover:bg-amber-50", iconBg: "bg-amber-100", icon: "text-amber-600" },
  pink: { border: "border-pink-100 hover:border-pink-200", bg: "bg-pink-50/50 hover:bg-pink-50", iconBg: "bg-pink-100", icon: "text-pink-600" },
} as const;

export const PALETTE_COMPONENTS: PaletteComponent[] = [
  {
    id: "text",
    tag: "p",
    nameKey: "editor.leftBar.components.text",
    accent: "slate",
    icon: paragraphIcon,
    data: {
      content: "type here...",
      class: "p-2 text-slate-800 text-sm whitespace-pre-wrap leading-relaxed",
    },
  },
  {
    id: "table",
    tag: "table",
    nameKey: "editor.leftBar.components.table",
    accent: "blue",
    icon: tableIcon,
    data: {
      table: true,
      columns: `{{#each table.cols}}
    <th class="p-4">{{this}}</th>
  {{/each}}`,
      rows: `{{#each table.rows}}
              <tr class="transition-colors hover:bg-zinc-50/80 dark:hover:bg-zinc-900/50">
{{#each this}}
    <td class="p-4">{{this}}</td>
  {{/each}}
</tr>
  {{/each}}`,
      class: "w-full text-sm text-left rtl:text-right text-body",
    },
  },
  {
    id: "row",
    tag: "div",
    nameKey: "editor.leftBar.components.row",
    accent: "amber",
    icon: rowIcon,
    data: { class: "flex flex-row gap-4 min-h-16 w-full px-2" },
  },
  {
    id: "col",
    tag: "div",
    nameKey: "editor.leftBar.components.col",
    accent: "slate",
    icon: colIcon,
    data: { class: "flex flex-col gap-4 min-h-16 w-full " },
  },
  {
    id: "image",
    tag: "img",
    nameKey: "editor.leftBar.components.image",
    accent: "purple",
    icon: imageIcon,
    data: {
      class: "size-24 object-cover",
      src: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5Y2FjYmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cmVjdCB4PSIzIiB5PSIzIiB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHJ4PSIyIiByeT0iMiIvPjxjaXJjbGUgY3g9IjguNSIgY3k9IjguNSIgcj0iMS41Ii8+PHBhdGggZD0iTTIxIDE1bC01LTUtNCA0LTQtNC01IDUiLz48L3N2Zz4=",
    },
  },
  {
    id: "checkbox",
    tag: "checkbox",
    nameKey: "editor.leftBar.components.checkbox",
    accent: "pink",
    icon: checkboxIcon,
    data: {
      value: false,
      name: "checkbox",
    },
  },
  {
    id: "container",
    tag: "div",
    nameKey: "editor.leftBar.components.container",
    accent: "emerald",
    icon: containerIcon,
    data: { class: "flex flex-col gap-1 m-auto w-full min-h-16 w-full px-2" },
  },
  {
    id: "barcode",
    tag: "barcode",
    nameKey: "editor.leftBar.components.barcode",
    accent: "indigo",
    icon: barcodeIcon,
    data: {
      content: "ES987654321098",
      height: 48,
      class: "block w-full",
    },
  },
];

const BY_ID = Object.fromEntries(PALETTE_COMPONENTS.map((c) => [c.id, c])) as Record<
  PaletteId,
  PaletteComponent
>;

export const paletteComponent = (id: PaletteId): PaletteComponent => BY_ID[id];

/** Copia profunda de los `data` de un componente: el store muta lo que recibe. */
export function paletteData(id: PaletteId): Record<string, any> {
  return JSON.parse(JSON.stringify(BY_ID[id].data));
}
