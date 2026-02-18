<template>
  <button
    :type="props.type"
    :title="props.title"
    :class="[
      'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium',
      'transition-all duration-200 ease-in-out',
      'active:scale-[0.97]',
      'bg-primary text-primary-foreground shadow-sm',
      'hover:bg-primary/90 hover:shadow-md',
      'hover:-translate-y-[1px]',
      'dark:ring-offset-background',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50',
      '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:transition-transform',
      'hover:[&_svg]:scale-110',
      'h-9 px-4 py-2',
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
    default: () => {
      return;
    },
  },
  title: {
    type: String,
    default: "button",
  },
  type: {
    type: String,
    default: "button",
  },
});
</script>
