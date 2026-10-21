<template>
  <div class="flex min-h-14 w-full flex-wrap items-center gap-1.5 border-b border-content/10 bg-surface px-2.5">
    <UButton
      to="/"
      icon="i-lucide-house"
      color="neutral"
      variant="ghost"
      square
      size="sm"
      :title="t('editor.backToSite')"
    />

    <span class="mx-1 hidden h-5 w-px bg-content/15 sm:block" />

    <!-- View tabs -->
    <div class="flex items-center gap-1">
      <UButton
        v-for="tab in tabs"
        :key="tab.id"
        :icon="tab.icon"
        color="neutral"
        :variant="view === tab.id ? 'solid' : 'ghost'"
        square
        size="sm"
        :title="tab.label"
        @click="$emit('select', tab.id)"
      />
    </div>

    <span class="mx-1 hidden h-5 w-px bg-content/15 sm:block" />

    <!-- History -->
    <UButton
      icon="i-lucide-undo-2"
      color="neutral"
      variant="ghost"
      square
      size="sm"
      :title="t('editor.toolbar.undo')"
      :disabled="!store.history.length"
      @click="store.undo()"
    />
    <UButton
      icon="i-lucide-redo-2"
      color="neutral"
      variant="ghost"
      square
      size="sm"
      :title="t('editor.toolbar.redo')"
      :disabled="!store.redoStack.length"
      @click="store.redo()"
    />

    <span class="mx-1 hidden h-5 w-px bg-content/15 sm:block" />

    <!-- Plantillas precreadas -->
    <layout-template-select />

    <div class="ml-auto flex items-center gap-2">
      <ui-locale-switcher class="hidden sm:inline-flex" />
      <ui-theme-toggle class="hidden sm:inline-flex" />
      <UButton
        color="primary"
        variant="solid"
        icon="i-lucide-download"
        size="sm"
        :title="t('editor.toolbar.export')"
        :loading="exporting"
        @click="$emit('export')"
      >
        {{ exporting ? t('editor.toolbar.exporting') : t('editor.toolbar.export') }}
      </UButton>
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
  { id: 1, label: t("editor.toolbar.preview"), icon: "i-lucide-eye" },
  { id: 2, label: t("editor.toolbar.schema"), icon: "i-lucide-code-xml" },
  { id: 3, label: t("editor.toolbar.styles"), icon: "i-lucide-braces" },
  { id: 4, label: t("editor.toolbar.data"), icon: "i-lucide-database" },
]);
</script>
