<template>
  <div class="flex flex-col gap-4 h-full">
    <div class="flex items-center justify-between">
      <h2
        class="text-xs font-semibold tracking-wider text-muted-foreground uppercase"
      >
        Custom CSS
      </h2>
      <div
        class="px-2 py-1 rounded bg-muted text-[10px] font-mono text-muted-foreground"
      >
        style.css
      </div>
    </div>
    <div
      class="flex-1 relative border border-border rounded-xl overflow-hidden bg-card shadow-sm"
    >
      <textarea
        v-model="cssCode"
        class="w-full h-full p-4 font-mono text-xs leading-relaxed text-foreground bg-transparent resize-none focus:outline-none selection:bg-primary/20"
        spellcheck="false"
        placeholder="/* Add your custom CSS here */"
      />
    </div>
  </div>
</template>

<script setup>
import { templateStore } from "../../stores/templateStore";

const store = templateStore();
const setStyleElTexContent = store.setStyleElTexContent;
const setStyleEl = store.setStyleEl;

const cssCode = computed({
  get: () => store.cssCode,
  set: (val) => (store.cssCode = val),
});

onMounted(() => {
  const el = document.createElement("style");
  el.setAttribute("data-dynamic-css", "true");
  document.head.appendChild(el);
  setStyleEl(el);
  setStyleElTexContent(cssCode.value);

  watch(cssCode, (val) => {
    setStyleElTexContent(val);
  });
});
</script>
