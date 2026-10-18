<template>
  <button
    type="button"
    :class="[
      'group relative flex flex-col items-center justify-center gap-2 w-full rounded-xl border p-3',
      'transition-all duration-200 ease-in-out select-none',
      accentClasses.border,
      accentClasses.bg,
      'hover:shadow-sm hover:scale-[1.02] active:scale-[0.97]',
      'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40',
    ]"
    :title="description || undefined"
    @click="onClick"
  >
    <div :class="[
      'flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-200',
      accentClasses.iconBg,
    ]">
      <component :is="props.icon" :class="['w-4 h-4', accentClasses.icon]" />
    </div>

    <span class="text-xs font-semibold text-slate-700 text-center leading-tight">
      {{ props.name }}
    </span>
  </button>
</template>

<script setup lang="ts">
import { ACCENT_MAP } from "../../palette";

/**
 * Variante clicable de `ui-draggable-button`: misma estética que los botones
 * de la paleta, pero no se arrastra, se pulsa (carga una plantilla).
 */
const props = withDefaults(
  defineProps<{
    name: string;
    icon: any;
    accent?: string;
    /** Texto del tooltip (descripción). */
    description?: string;
    click?: () => void;
  }>(),
  { accent: "slate", description: "" }
);

const accentClasses = computed(
  () => ACCENT_MAP[props.accent as keyof typeof ACCENT_MAP] ?? ACCENT_MAP.slate
);

const onClick = () => props.click?.();
</script>
