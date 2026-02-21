<template>
  <ClientOnly>
    <ui-code-editor
      v-model="cssCode"
      language="css"
      :height="height"
    />
    <template #fallback>
      <textarea
        v-model="cssCode"
        class="w-full h-full font-mono text-sm border border-slate-200 rounded-lg p-3 resize-none focus:outline-none"
        spellcheck="false"
      />
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { templateStore } from "../../stores/templateStore";

withDefaults(defineProps<{ height?: string }>(), { height: "400px" });

const store = templateStore();

const cssCode = computed({
  get() { return store.cssCode; },
  set(val) {
    store.cssCode = val;
    // inject styles into live page
    if (process.client) {
      let el = document.querySelector("style[data-dynamic-css]") as HTMLStyleElement | null;
      if (!el) {
        el = document.createElement("style");
        el.setAttribute("data-dynamic-css", "true");
        document.head.appendChild(el);
      }
      el.textContent = val;
    }
  },
});

// Apply on mount
if (process.client) {
  watch(
    () => store.cssCode,
    (val) => {
      const el = document.querySelector("style[data-dynamic-css]") as HTMLStyleElement | null;
      if (el) el.textContent = val;
    },
    { immediate: true }
  );
}
</script>
