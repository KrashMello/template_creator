<template>
  <div
    class="componente w-full aspect-square flex flex-col items-center justify-center p-3 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-muted/50 cursor-grab active:cursor-grabbing transition-all duration-200 draggable-component group"
    draggable="true"
    :data-tag="props.tag"
    :data-nombre="props.name"
    :data-data="JSON.stringify(props.data)"
    @dragstart="onDragStart"
  >
    <div class="flex flex-col items-center gap-2">
      <div
        class="p-2 rounded-lg bg-muted text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors"
      >
        <component :is="props.icon" class="w-6 h-6" />
      </div>
      <div class="flex flex-col items-center text-xs">
        <span class="font-medium text-foreground">{{ props.name }}</span>
        <span class="text-[10px] text-muted-foreground font-mono mt-0.5">{{
          props.tag
        }}</span>
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
    rows?: string[][];
    src?: string;
  };
};

const props = defineProps<propsType>();

const onDragStart = (event: DragEvent) => {
  const target = event.target as HTMLElement;
  const draggable = target.closest(".draggable-component") as HTMLElement;
  if (!draggable) return;

  const tag = draggable.dataset.tag;
  const data = draggable.dataset.data ? JSON.parse(draggable.dataset.data) : {};
  const nombre = draggable.dataset.nombre;

  if (event.dataTransfer) {
    event.dataTransfer.setData(
      "text/plain",
      JSON.stringify({ tag, data, nombre }),
    );
    event.dataTransfer.effectAllowed = "move";

    // Optional: Set a custom drag image or styling here if desired
  }
};
</script>
