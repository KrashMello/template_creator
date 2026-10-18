<template>
  <div class="flex h-full flex-col gap-2 p-4">
    <h2 class="text-sm font-bold text-slate-800">{{ t('editor.views.styles') }}</h2>
    <div class="min-h-0 flex-1">
      <textarea
        v-model="cssCode"
        class="h-full w-full resize-none rounded-lg border border-slate-200 bg-white p-3 font-mono text-sm text-slate-700 transition-colors hover:border-slate-300 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
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
