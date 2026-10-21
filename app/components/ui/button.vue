<template>
  <button
    :type="props.type"
    :title="props.title"
    :aria-pressed="props.active"
    :class="[
      'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium',
      'transition-all duration-150 ease-in-out active:scale-[0.97]',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40',
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
      return "text-content-muted hover:bg-surface-alt hover:text-content";
    case "outline":
      return "border border-content/10 bg-surface text-content-muted hover:border-content/25 hover:bg-surface-alt";
    default:
      return "bg-primary text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary-hover hover:shadow-md";
  }
});

const activeClasses = computed(() => {
  if (!props.active) return "";
  return props.variant === "ghost"
    ? "bg-content text-surface shadow-sm hover:bg-content hover:text-surface"
    : "ring-2 ring-accent/40";
});
</script>
