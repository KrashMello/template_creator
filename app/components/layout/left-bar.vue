<template>
  <aside class="left-panel flex flex-col h-full bg-surface border-r border-content/10">
    <div class="flex items-center gap-2.5 border-b border-content/10 px-4 py-3.5">
      <NuxtLink to="/" class="flex items-center gap-2.5 focus-visible:outline-none">
        <img src="/logo-light.png" alt="" class="h-7 w-7 dark:hidden" />
        <img src="/logo-dark.png" alt="" class="hidden h-7 w-7 dark:block" />
        <span class="text-sm font-bold tracking-tight text-content">Template Creator</span>
      </NuxtLink>
    </div>

    <div class="flex-1 overflow-y-auto px-3 py-4 space-y-4">
      <section>
        <h3 class="text-[10px] font-bold uppercase tracking-widest text-content-muted mb-3 px-1">
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
        <p class="mt-4 rounded-lg bg-surface-alt px-3 py-2.5 text-center text-[11px] leading-relaxed text-content-muted">
          {{ t('editor.leftBar.hint') }}
        </p>
      </section>
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
