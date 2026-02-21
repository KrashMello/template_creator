<template>
  <div
    :class="[
      'group relative flex flex-col items-center justify-center gap-2 w-full rounded-xl border p-3',
      'transition-all duration-200 ease-in-out cursor-grab active:cursor-grabbing select-none',
      accentClasses.border,
      accentClasses.bg,
      'hover:shadow-sm hover:scale-[1.02] active:scale-[0.97]',
    ]"
    draggable="true"
    :data-tag="props.tag"
    :data-nombre="props.name"
    :data-data="JSON.stringify(props.data)"
    @dragstart="onDragStart"
  >
    <div
      :class="[
        'flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-200',
        accentClasses.iconBg,
      ]"
    >
      <component
        :is="props.icon"
        :class="['w-4 h-4', accentClasses.icon]"
      />
    </div>

    <span
      class="text-xs font-semibold text-slate-700 text-center leading-tight"
    >
      {{ props.name }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

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

const accentMap: Record<string, { border: string; bg: string; iconBg: string; icon: string }> = {
  slate:   { border: "border-slate-200 hover:border-slate-300",   bg: "bg-white hover:bg-slate-50",  iconBg: "bg-slate-100",  icon: "text-slate-600" },
  blue:    { border: "border-blue-100 hover:border-blue-200",     bg: "bg-blue-50/50 hover:bg-blue-50",  iconBg: "bg-blue-100",   icon: "text-blue-600" },
  indigo:  { border: "border-indigo-100 hover:border-indigo-200", bg: "bg-indigo-50/50 hover:bg-indigo-50",  iconBg: "bg-indigo-100", icon: "text-indigo-600" },
  emerald: { border: "border-emerald-100 hover:border-emerald-200", bg: "bg-emerald-50/50 hover:bg-emerald-50", iconBg: "bg-emerald-100", icon: "text-emerald-600" },
  purple:  { border: "border-purple-100 hover:border-purple-200", bg: "bg-purple-50/50 hover:bg-purple-50",  iconBg: "bg-purple-100", icon: "text-purple-600" },
  amber:   { border: "border-amber-100 hover:border-amber-200",   bg: "bg-amber-50/50 hover:bg-amber-50",   iconBg: "bg-amber-100",  icon: "text-amber-600" },
};

const accentClasses = computed(() => accentMap[props.accent] ?? accentMap.slate);

function onDragStart(event: DragEvent) {
  const tag = (event.target as HTMLElement).dataset.tag
    ?? (event.target as HTMLElement).closest("[data-tag]")?.getAttribute("data-tag")
    ?? props.tag;
  const dataStr = (event.target as HTMLElement).dataset.data;
  const data = dataStr ? JSON.parse(dataStr) : {};
  event.dataTransfer!.setData(
    "text/plain",
    JSON.stringify({ tag, data, nombre: props.name })
  );
  event.dataTransfer!.effectAllowed = "copy";
}
</script>
