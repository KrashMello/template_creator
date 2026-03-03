<template>
  <aside class="left-panel flex flex-col h-full bg-white border-r border-slate-200">
    <div class="px-5 py-4 border-b border-slate-100">
      <span class="text-lg font-bold">
        <span class="text-slate-800">Template Creator</span>
      </span>
    </div>
    <div class="flex-1 overflow-y-auto px-3 py-4 space-y-5">
      <section>
        <h3 class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 px-1">
          Basic Components
        </h3>
        <div class="grid grid-cols-2 gap-2">
          <ui-draggable-button v-for="comp in componentes" :key="comp.tag + comp.name" :tag="comp.tag" :name="comp.name"
            :icon="comp.icon" :data="comp.data" :accent="comp.accent" />
        </div>
      </section>

    </div>

    <!-- <div class="px-4 py-3 border-t border-slate-100 bg-blue-50/50"> -->
    <!--   <p class="text-[10px] text-blue-500 leading-snug"> -->
    <!--     <span class="font-semibold">ℹ</span> Headers &amp; Footers will persist across all PDF pages automatically. -->
    <!--   </p> -->
    <!-- </div> -->
  </aside>
</template>
<script setup lang="ts">
import paragraph from "../svg/paragraph.vue";
import table from "../svg/table.vue";
import row from "../svg/row.vue";
import col from "../svg/col.vue";
import image from "../svg/image.vue";
import container from "../svg/container.vue";
import checkbox from "../svg/checkbox.vue";

const componentes = shallowRef([
  {
    tag: "p",
    name: "Párrafo",
    accent: "slate",
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
    accent: "blue",
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
    tag: "div",
    name: "Row",
    accent: "amber",
    icon: row,
    data: { class: "flex flex-row gap-4 min-h-16 w-full px-2" },
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
    accent: "purple",
    icon: image,
    data: {
      class: "size-24 object-cover",
      src: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5Y2FjYmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cmVjdCB4PSIzIiB5PSIzIiB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHJ4PSIyIiByeT0iMiIvPjxjaXJjbGUgY3g9IjguNSIgY3k9IjguNSIgcj0iMS41Ii8+PHBhdGggZD0iTTIxIDE1bC01LTUtNCA0LTQtNC01IDUiLz48L3N2Zz4=",
    },
  },
  {
    tag: "checkbox",
    name: "Checkbox",
    accent: "pink",
    icon: checkbox,
    data: {
      value: false,
      name: "checkbox"
    }
  },
  {
    tag: "div",
    name: "Container",
    accent: "emerald",
    icon: container,
    data: { class: "flex flex-col gap-1 m-auto w-full min-h-16 w-full px-2" },
  },
]);
</script>
<style scoped>
.left-panel {
  width: 240px;
  min-width: 240px;
  flex-shrink: 0;
}
</style>
