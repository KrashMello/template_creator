<template>
  <div
    class="col-span-3 bg-slate-300 border-r-2 border-slate-500 p-4 flex rounded-s-xl flex-col gap-2 shadow-lg h-full"
  >
    <div class="flex flex-col gap-2 h-full">
      <h2 class="text-xl font-bold mb-4 text-slate-800">Componentes</h2>
      <div id="componentes" class="space-y-3 h-full">
        <div
          class="grid grid-cols-3 items-start gap-2 w-full overflow-auto h-fit max-h-[85dvh]"
        >
          <ui-draggable-button
            v-for="comp in componentes"
            :key="`${comp.name}-dragable-comp`"
            :tag="comp.tag"
            :name="comp.name"
            :icon="comp.icon"
            :data="comp.data"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import paragraph from "../svg/paragraph.vue";
import table from "../svg/table.vue";
import row from "../svg/row.vue";
import col from "../svg/col.vue";
import image from "../svg/image.vue";
import container from "../svg/container.vue";

const componentes = shallowRef([
  {
    tag: "p",
    name: "Párrafo",
    icon: paragraph,
    data: {
      content: "type here...",
      class: "p-2 text-slate-800 text-sm whitespace-pre-wrap leading-relaxed",
    },
  },
  {
    tag: "table",
    name: "Tabla",
    icon: table,
    data: {
      table: true,
      columns: ["column 1", "column 2"],
      rows: [["column-row-1", "column-row-2"]],
      class: "w-full text-sm text-left rtl:text-right text-body",
    },
  },
  {
    tag: "div",
    name: "Row",
    icon: row,
    data: { class: "grid grid-cols-4 gap-4 min-h-16 w-full px-2" },
  },
  {
    tag: "div",
    name: "Columna",
    icon: col,
    data: { class: "flex flex-col gap-4 min-h-16 w-full " },
  },
  {
    tag: "img",
    name: "Imagen",
    icon: image,
    data: {
      class: "w-[30%] h-[30%] object-cover",
      src: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5Y2FjYmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cmVjdCB4PSIzIiB5PSIzIiB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHJ4PSIyIiByeT0iMiIvPjxjaXJjbGUgY3g9IjguNSIgY3k9IjguNSIgcj0iMS41Ii8+PHBhdGggZD0iTTIxIDE1bC01LTUtNCA0LTQtNC01IDUiLz48L3N2Zz4=",
    },
  },
  {
    tag: "div",
    name: "Container",
    icon: container,
    data: { class: "flex flex-col gap-1 m-auto w-full min-h-16 w-full px-2" },
  },
]);
</script>
