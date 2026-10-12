<template>
  <aside class="left-panel flex flex-col h-full bg-white border-r border-slate-200">
    <div class="flex items-center gap-2.5 border-b border-slate-200 px-4 py-3.5">
      <NuxtLink to="/" class="group flex items-center gap-2.5 focus-visible:outline-none">
        <img
          src="/short-logo.png"
          alt=""
          class="h-7 w-7 rounded-md shadow-sm ring-1 ring-slate-200 transition-transform group-hover:scale-105"
        />
        <span class="text-sm font-bold tracking-tight text-slate-900">Template Creator</span>
      </NuxtLink>
    </div>

    <div class="flex-1 overflow-y-auto px-3 py-4 space-y-4">
      <section>
        <h3 class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 px-1">
          {{ t('editor.leftBar.section') }}
        </h3>
        <div class="grid grid-cols-2 gap-2">
          <ui-draggable-button
            v-for="comp in components"
            :key="comp.tag + comp.name"
            :tag="comp.tag"
            :name="comp.name"
            :icon="comp.icon"
            :data="comp.data"
            :accent="comp.accent"
          />
        </div>
        <p class="mt-4 rounded-lg bg-slate-50 px-3 py-2.5 text-center text-[11px] leading-relaxed text-slate-400">
          {{ t('editor.leftBar.hint') }}
        </p>
      </section>
    </div>
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

const { t } = useI18n();

const rawComponents = shallowRef([
  {
    tag: "p",
    nameKey: "editor.leftBar.components.paragraph",
    accent: "slate",
    icon: paragraph,
    data: {
      content: "type here...",
      class: "p-2 text-slate-800 text-sm whitespace-pre-wrap leading-relaxed",
    },
  },
  {
    tag: "table",
    nameKey: "editor.leftBar.components.table",
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
    nameKey: "editor.leftBar.components.row",
    accent: "amber",
    icon: row,
    data: { class: "flex flex-row gap-4 min-h-16 w-full px-2" },
  },
  {
    tag: "div",
    nameKey: "editor.leftBar.components.col",
    icon: col,
    data: { class: "flex flex-col gap-4 min-h-16 w-full " },
  },
  {
    tag: "img",
    nameKey: "editor.leftBar.components.image",
    accent: "purple",
    icon: image,
    data: {
      class: "size-24 object-cover",
      src: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5Y2FjYmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cmVjdCB4PSIzIiB5PSIzIiB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHJ4PSIyIiByeT0iMiIvPjxjaXJjbGUgY3g9IjguNSIgY3k9IjguNSIgcj0iMS41Ii8+PHBhdGggZD0iTTIxIDE1bC01LTUtNCA0LTQtNC01IDUiLz48L3N2Zz4=",
    },
  },
  {
    tag: "checkbox",
    nameKey: "editor.leftBar.components.checkbox",
    accent: "pink",
    icon: checkbox,
    data: {
      value: false,
      name: "checkbox"
    }
  },
  {
    tag: "div",
    nameKey: "editor.leftBar.components.container",
    accent: "emerald",
    icon: container,
    data: { class: "flex flex-col gap-1 m-auto w-full min-h-16 w-full px-2" },
  },
]);

const components = computed(() =>
  rawComponents.value.map((comp) => ({ ...comp, name: t(comp.nameKey) }))
);
</script>
<style scoped>
.left-panel {
  width: 240px;
  min-width: 240px;
  flex-shrink: 0;
}
</style>
