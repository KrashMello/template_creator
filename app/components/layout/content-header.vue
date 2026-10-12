<template>
  <div class="flex w-full flex-wrap items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-2 shadow-sm">
    <NuxtLink
      to="/"
      :title="t('editor.backToSite')"
      class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5 9.5V21h14V9.5" />
      </svg>
    </NuxtLink>

    <span class="mx-1 hidden h-5 w-px bg-slate-200 sm:block" />

    <!-- View tabs -->
    <div class="flex items-center gap-1">
      <ui-button
        v-for="tab in tabs"
        :key="tab.id"
        variant="ghost"
        class="h-8 w-8 p-0"
        :active="view === tab.id"
        :title="tab.label"
        @click="$emit('select', tab.id)"
      >
        <component :is="tab.icon" class="size-4" />
      </ui-button>
    </div>

    <span class="mx-1 hidden h-5 w-px bg-slate-200 sm:block" />

    <!-- History -->
    <ui-button
      variant="ghost"
      class="h-8 w-8 p-0"
      :title="t('editor.toolbar.undo')"
      :disabled="!store.history.length"
      @click="store.undo()"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 7v6h6" />
        <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
      </svg>
    </ui-button>
    <ui-button
      variant="ghost"
      class="h-8 w-8 p-0"
      :title="t('editor.toolbar.redo')"
      :disabled="!store.redoStack.length"
      @click="store.redo()"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 7v6h-6" />
        <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
      </svg>
    </ui-button>

    <div class="ml-auto flex items-center gap-2">
      <ui-locale-switcher class="hidden sm:inline-flex" />
      <ui-button variant="primary" class="h-8 px-3" :title="t('editor.toolbar.export')" @click="$emit('export')">
        <span class="text-xs font-semibold">
          {{ exporting ? t('editor.toolbar.exporting') : t('editor.toolbar.export') }}
        </span>
        <svg-download class="size-4" />
      </ui-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { templateStore } from "../../stores/templateStore";

const { t } = useI18n();

defineProps<{
  view: number;
  exporting?: boolean;
}>();

defineEmits(["select", "export"]);

const store = templateStore();

const tabs = computed(() => [
  { id: 1, label: t("editor.toolbar.preview"), icon: resolveComponent("svg-eye-open") },
  { id: 2, label: t("editor.toolbar.schema"), icon: resolveComponent("svg-code") },
  { id: 3, label: t("editor.toolbar.styles"), icon: resolveComponent("svg-css") },
  { id: 4, label: t("editor.toolbar.data"), icon: resolveComponent("svg-data") },
]);
</script>
