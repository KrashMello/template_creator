<template>
  <div
    class="group relative flex flex-col items-center justify-center gap-2 w-full h-auto px-4 py-4 rounded-xl border border-slate-200 bg-white transition-all duration-200 ease-in-out hover:border-slate-300 hover:bg-slate-50/50 hover:shadow-sm active:scale-[0.98] cursor-grab active:cursor-grabbing draggable-component"
    draggable="true"
    :data-tag="props.tag"
    :data-nombre="props.name"
    :data-data="JSON.stringify(props.data)"
    @dragstart="onDragStart"
  >
    <div
      class="flex items-center justify-center p-2 rounded-lg bg-slate-50 group-hover:bg-white transition-colors duration-200"
    >
      <component
        class="size-6 2xl:size-10 text-slate-600 group-hover:text-slate-900"
        :is="props.icon"
      />
    </div>

    <div class="space-y-0.5 text-center">
      <div
        class="text-xs 2xl:text-sm font-semibold tracking-tight text-slate-900"
      >
        {{ props.name }}
      </div>
      <div
        class="text-[10px] 2xl:text-xs font-medium uppercase tracking-wider text-slate-400"
      >
        {{ props.tag }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type propsType = {
  name: string;
  icon: any;
  tag: string;
  data: {
    table?: boolean;
    columns?: string[];
    content?: string;
    class?: string;
    row?: string;
  };
};
const props = defineProps<propsType>();
const onDragStart = (event) => {
  const tag =
    event.target.dataset.tag ||
    event.target.closest(".draggable-component")?.dataset.tag;
  const data = event.target.dataset.data
    ? JSON.parse(event.target.dataset.data)
    : {};
  const nombre = event.target.dataset.nombre;

  event.dataTransfer.setData(
    "text/plain",
    JSON.stringify({ tag, data, nombre }),
  );
  event.dataTransfer.effectAllowed = "move";
};
</script>
