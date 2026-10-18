<template>
  <aside class="left-panel flex flex-col h-full bg-white border-r border-slate-200">
    <div class="flex items-center gap-2.5 border-b border-slate-200 px-4 py-3.5">
      <NuxtLink to="/" class="group flex items-center gap-2.5 focus-visible:outline-none">
        <img
          src="/short-logo.png"
          alt=""
          class="h-7 w-7 rounded-md shadow-sm ring-1 ring-slate-200 transition-transform group-hover:scale-105"
        />
        <span class="text-sm font-bold tracking-tight text-slate-900">Template Creator</span>
      </NuxtLink>
    </div>

    <div class="flex-1 overflow-y-auto px-3 py-4 space-y-4">
      <section>
        <h3 class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 px-1">
          {{ t('editor.leftBar.section') }}
        </h3>
        <div class="grid grid-cols-2 gap-2">
          <ui-draggable-button
            v-for="comp in components"
            :key="comp.tag + comp.name"
            :tag="comp.tag"
            :name="comp.name"
            :icon="comp.icon"
            :data="comp.data"
            :accent="comp.accent"
          />
        </div>
        <p class="mt-4 rounded-lg bg-slate-50 px-3 py-2.5 text-center text-[11px] leading-relaxed text-slate-400">
          {{ t('editor.leftBar.hint') }}
        </p>
      </section>

      <layout-templates-gallery />
    </div>
  </aside>
</template>
<script setup lang="ts">
import { PALETTE_COMPONENTS } from "../../palette";

const { t } = useI18n();

/**
 * La paleta vive en `app/palette.ts`: las mismas definiciones (y los mismos
 * `data`) que clonan las plantillas precreadas al construirse.
 */
const components = computed(() =>
  PALETTE_COMPONENTS.map((comp) => ({
    ...comp,
    name: t(comp.nameKey),
    data:
      comp.id === "text"
        ? { ...comp.data, content: t("editor.leftBar.components.defaultText") }
        : comp.data,
  })),
);
</script>
<style scoped>
.left-panel {
  width: 240px;
  min-width: 240px;
  flex-shrink: 0;
}
</style>
