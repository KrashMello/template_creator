<template>
  <div class="flex h-full flex-col gap-2 p-4">
    <h2 class="text-sm font-bold text-content">{{ t('editor.views.styles') }}</h2>
    <div class="min-h-0 flex-1">
      <textarea
        v-model="cssCode"
        class="h-full w-full resize-none rounded-lg border border-content/10 bg-surface p-3 font-mono text-sm text-content transition-colors hover:border-content/25 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
        spellcheck="false"
        placeholder="/* Tailwind / CSS */"
      />
    </div>
  </div>
</template>

<script setup>
import { templateStore } from "../../stores/templateStore";
const { t } = useI18n();
const setStyleElTexContent = templateStore().setStyleElTexContent;
const cssCode = computed({
  get() {
    return templateStore().cssCode;
  },
  set(val) {
    templateStore().cssCode = val;
  },
});
if (process.client) {
  // Reutiliza el `<style data-dynamic-css>` si ya existe (lo crea el store al
  // cargar una plantilla o en una visita anterior a esta pestaña).
  templateStore().ensureStyleEl();

  setStyleElTexContent(cssCode.value);

  watch(cssCode, (val) => {
    setStyleElTexContent(val);
  });
}
</script>
