<template>
  <button
    :type="props.type"
    :title="props.title"
    :aria-pressed="props.active"
    :class="[
      'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium',
      'transition-all duration-150 ease-in-out active:scale-[0.97]',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40',
      'disabled:pointer-events-none disabled:opacity-40',
      '[&_svg]:pointer-events-none [&_svg]:shrink-0',
      variantClasses,
      activeClasses,
      $attrs.class,
    ]"
    @click="props.click"
  >
    <slot />
  </button>
</template>

<script setup>
const props = defineProps({
  click: {
    type: Function,
    default: () => {},
  },
  title: {
    type: String,
    default: "button",
  },
  type: {
    type: String,
    default: "button",
  },
  variant: {
    type: String,
    default: "primary", // primary | ghost | outline
    validator: (v) => ["primary", "ghost", "outline"].includes(v),
  },
  active: {
    type: Boolean,
    default: false,
  },
});

const variantClasses = computed(() => {
  switch (props.variant) {
    case "ghost":
      return "text-slate-500 hover:bg-slate-100 hover:text-slate-800";
    case "outline":
      return "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50";
    default:
      return "bg-blue-600 text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700 hover:shadow-md";
  }
});

const activeClasses = computed(() => {
  if (!props.active) return "";
  return props.variant === "ghost"
    ? "bg-slate-900 text-white shadow-sm hover:bg-slate-900 hover:text-white"
    : "ring-2 ring-blue-500/40";
});
</script>
