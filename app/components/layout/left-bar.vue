<template>
  <div
    class="col-span-3 bg-card border-r border-border p-6 flex flex-col gap-6 h-full transition-colors duration-300"
  >
    <div class="flex flex-col gap-4 h-full">
      <h2
        class="text-xs font-semibold tracking-wider text-muted-foreground uppercase"
      >
        Components
      </h2>
      <div id="componentes" class="flex-1 overflow-hidden">
        <div
          class="grid grid-cols-2 lg:grid-cols-3 gap-3 w-full h-full overflow-y-auto pr-2 pb-4 content-start"
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
    name: "Paragraph",
    icon: paragraph,
    data: {
      content: "Start writing here...",
      class: "p-4 text-foreground whitespace-pre-wrap leading-relaxed",
    },
  },
  {
    tag: "table",
    name: "Table",
    icon: table,
    data: {
      table: true,
      columns: ["Column 1", "Column 2"],
      rows: [["Cell 1", "Cell 2"]],
      class: "w-full text-sm text-left text-foreground border-collapse",
    },
  },
  {
    tag: "div",
    name: "Grid Row",
    icon: row,
    data: { class: "grid grid-cols-4 gap-4 min-h-[4rem] w-full p-2" },
  },
  {
    tag: "div",
    name: "Flex Col",
    icon: col,
    data: { class: "flex flex-col gap-4 min-h-[4rem] w-full p-2" },
  },
  {
    tag: "img",
    name: "Image",
    icon: image,
    data: {
      src: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      class: "w-full h-auto object-cover rounded-md",
    },
  },
  {
    tag: "div",
    name: "Container",
    icon: container,
    data: {
      class: "flex flex-col gap-2 mx-auto max-w-4xl min-h-[4rem] w-full px-4",
    },
  },
]);
</script>
