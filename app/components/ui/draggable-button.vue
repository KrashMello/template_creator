<template>
  <div :class="[
    'group relative flex flex-col items-center justify-center gap-2 w-full rounded-xl border p-3',
    'transition-all duration-200 ease-in-out cursor-grab active:cursor-grabbing select-none',
    accentClasses.border,
    accentClasses.bg,
    'hover:shadow-sm hover:scale-[1.02] active:scale-[0.97]',
  ]" draggable="true" :data-tag="props.tag" :data-nombre="props.name" :data-data="JSON.stringify(props.data)"
    @dragstart="onDragStart">
    <div :class="[
      'flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-200',
      accentClasses.iconBg,
    ]">
      <component :is="props.icon" :class="['w-4 h-4', accentClasses.icon]" />
    </div>

    <span class="text-xs font-semibold text-content text-center leading-tight">
      {{ props.name }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ACCENT_MAP } from "../../palette";

const props = withDefaults(
  defineProps<{
    name: string;
    icon: any;
    tag: string;
    accent?: string;
    data: Record<string, any>;
  }>(),
  { accent: "slate" }
);

const accentClasses = computed(
  () => ACCENT_MAP[props.accent as keyof typeof ACCENT_MAP] ?? ACCENT_MAP.slate
);
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
