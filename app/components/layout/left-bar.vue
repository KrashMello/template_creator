<template>
  <aside class="left-panel flex flex-col h-full bg-white border-r border-slate-200">
    <!-- Logo area -->
    <div class="px-5 py-4 border-b border-slate-100">
      <span class="text-lg font-bold">
        <span class="text-blue-600">Report</span><span class="text-slate-800">Builder</span>
      </span>
    </div>

    <!-- Components list -->
    <div class="flex-1 overflow-y-auto px-3 py-4 space-y-5">
      <!-- Basic -->
      <section>
        <h3 class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 px-1">
          Basic Components
        </h3>
        <div class="grid grid-cols-2 gap-2">
          <ui-draggable-button
            v-for="comp in basicComponents"
            :key="comp.tag + comp.name"
            :tag="comp.tag"
            :name="comp.name"
            :icon="comp.icon"
            :data="comp.data"
            :accent="comp.accent"
          />
        </div>
      </section>

      <!-- Advanced -->
      <section>
        <h3 class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 px-1">
          Advanced Components
        </h3>
        <div class="grid grid-cols-2 gap-2">
          <ui-draggable-button
            v-for="comp in advancedComponents"
            :key="comp.tag + comp.name"
            :tag="comp.tag"
            :name="comp.name"
            :icon="comp.icon"
            :data="comp.data"
            :accent="comp.accent"
          />
        </div>
      </section>
    </div>

    <!-- Footer hint -->
    <div class="px-4 py-3 border-t border-slate-100 bg-blue-50/50">
      <p class="text-[10px] text-blue-500 leading-snug">
        <span class="font-semibold">ℹ</span> Headers &amp; Footers will persist across all PDF pages automatically.
      </p>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { shallowRef } from "vue";
// SVG icons
import paragraph from "../svg/paragraph.vue";
import tableIcon from "../svg/table.vue";
import rowIcon from "../svg/row.vue";
import colIcon from "../svg/col.vue";
import imageIcon from "../svg/image.vue";
import containerIcon from "../svg/container.vue";
import dataIcon from "../svg/data.vue";
import downloadIcon from "../svg/download.vue";

// ── Inline SVGs for new icons ────────────────────────────────────────────────
const pageHeaderIcon = defineComponent({
  template: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"/><path d="M3 9V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4"/><line x1="12" y1="12" x2="12" y2="17"/><line x1="9.5" y1="14.5" x2="14.5" y2="14.5"/></svg>`,
});

const pageFooterIcon = defineComponent({
  template: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5z"/><path d="M3 15v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4"/><line x1="12" y1="8" x2="12" y2="12"/></svg>`,
});

const dividerIcon = defineComponent({
  template: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/></svg>`,
});

// ── Component definitions ────────────────────────────────────────────────────
const basicComponents = shallowRef([
  {
    tag: "p",
    name: "Paragraph",
    icon: paragraph,
    accent: "slate",
    data: {
      content: "Type here...",
      class: "text-slate-800 text-sm leading-relaxed",
    },
  },
  {
    tag: "table",
    name: "Table",
    icon: tableIcon,
    accent: "emerald",
    data: {
      table: true,
      class: "w-full text-sm text-left",
    },
  },
  {
    tag: "img",
    name: "Image",
    icon: imageIcon,
    accent: "purple",
    data: {
      class: "w-full max-h-48 object-cover",
      src: "",
    },
  },
  {
    tag: "columns",
    name: "Columns",
    icon: colIcon,
    accent: "amber",
    data: { cols: 2 },
  },
]);

const advancedComponents = shallowRef([
  {
    tag: "page-header",
    name: "Page Header",
    icon: pageHeaderIcon,
    accent: "blue",
    data: {},
  },
  {
    tag: "page-footer",
    name: "Page Footer",
    icon: pageFooterIcon,
    accent: "blue",
    data: {},
  },
  {
    tag: "data-field",
    name: "Data Field",
    icon: dataIcon,
    accent: "indigo",
    data: { binding: "", format: "default" },
  },
  {
    tag: "hr",
    name: "Divider",
    icon: dividerIcon,
    accent: "slate",
    data: { class: "border-slate-300 my-2" },
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
