<template>
  <div class="flex items-center">
    <label for="tc-template-select" class="sr-only">{{ t('editor.templates.title') }}</label>
    <USelect
      id="tc-template-select"
      v-model="selected"
      :items="selectItems"
      :placeholder="t('editor.templates.placeholder')"
      size="sm"
      class="w-[170px]"
      @update:model-value="onChange"
    />

    <UModal v-model:open="dialogOpen" :title="confirmTitle" :ui="{ content: 'max-w-sm' }" :close="false">
      <template #body>
        <!-- Miniatura en vivo del documento que se va a cargar -->
        <span class="thumb block">
          <iframe
            v-if="pending && docs[pending.id]"
            class="thumb-frame"
            :srcdoc="docs[pending.id]"
            :title="itemTitle(pending.id)"
            aria-hidden="true"
            tabindex="-1"
          />
        </span>

        <p v-if="pending" class="mt-4 text-xs font-semibold text-accent">{{ itemTitle(pending.id) }}</p>
        <p class="mt-2 text-sm leading-relaxed text-content-muted">{{ confirmMessage }}</p>

        <div v-if="pending" class="mt-3 flex flex-wrap gap-1">
          <span
            v-for="feature in itemFeatures(pending.id)"
            :key="feature"
            class="rounded-full bg-surface-alt px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-content-muted"
          >
            {{ feature }}
          </span>
        </div>
      </template>

      <template #footer>
        <div class="ms-auto flex gap-2">
          <UButton color="neutral" variant="outline" size="sm" @click="cancel">
            {{ t('editor.templates.confirm.cancel') }}
          </UButton>
          <UButton color="primary" variant="solid" size="sm" @click="accept">
            {{ t('editor.templates.confirm.accept') }}
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { templateStore } from "../../stores/templateStore";
import { PREBUILT_TEMPLATES, renderTemplateDoc, toTemplateLocale } from "../../templates";
import type { PrebuiltTemplate } from "../../templates";

const { t, tm, locale } = useI18n();
const store = templateStore();

const templates = PREBUILT_TEMPLATES;

/** Plantilla realmente cargada; sirve para restaurar el select al cancelar. */
const applied = ref("");
const selected = ref("");
const pending = ref<PrebuiltTemplate | null>(null);

const selectItems = computed(() =>
  templates.map((tpl) => ({ label: itemTitle(tpl.id), value: tpl.id }))
);

/** Cerrar el modal (X, Esc, overlay) equivale a cancelar. */
const dialogOpen = computed({
  get: () => !!pending.value,
  set: (open) => {
    if (!open) cancel();
  },
});

/**
 * Miniatura en vivo: el HTML real de la plantilla (con Handlebars resuelto y
 * el CDN de Tailwind del propio documento) dentro de un iframe a escala.
 * Se regenera al cambiar de idioma.
 */
const docs = computed<Record<string, string>>(() => {
  const current = toTemplateLocale(locale.value);
  const out: Record<string, string> = {};
  for (const tpl of templates) {
    try {
      out[tpl.id] = renderTemplateDoc(tpl.build({ locale: current }));
    } catch (e) {
      console.error(`No se pudo renderizar la plantilla "${tpl.id}":`, e);
      out[tpl.id] = "";
    }
  }
  return out;
});

/** Sustituye el documento solo si hay algo que perder. */
const hasContent = computed(
  () =>
    store.schema.children.length > 0 ||
    store.header.children.length > 0 ||
    store.footer.children.length > 0 ||
    !!store.cssCode.trim(),
);

const confirmTitle = computed(() => t("editor.templates.confirm.title"));
const confirmMessage = computed(() => t("editor.templates.confirm.message"));

const itemTitle = (id: string) => t(`editor.templates.items.${id}.title`);
const itemFeatures = (id: string): string[] => {
  const key = `editor.templates.items.${id}.features`;
  const list = tm(key) as unknown[];
  if (!Array.isArray(list)) return [];
  return list.map((_, i) => t(`${key}.${i}`));
};

function onChange() {
  const tpl = templates.find((item) => item.id === selected.value);
  if (!tpl) return;
  if (hasContent.value) pending.value = tpl;
  else apply(tpl);
}

function apply(tpl: PrebuiltTemplate) {
  store.loadTemplate(tpl.build({ locale: toTemplateLocale(locale.value) }));
  applied.value = tpl.id;
  pending.value = null;
}

function cancel() {
  pending.value = null;
  selected.value = applied.value;
}

function accept() {
  if (pending.value) apply(pending.value);
}
</script>

<style scoped>
/*
 * Miniatura del modal: el documento se renderiza a tamaño real (794x1123,
 * proporción A4) y se escala al ancho de la tarjeta.
 */
.thumb {
  position: relative;
  width: 200px;
  height: 283px;
  margin: 0 auto;
  overflow: hidden;
  border: 1px solid var(--surface-alt);
  border-radius: 8px;
  background: #ffffff;
}

.thumb-frame {
  position: absolute;
  top: 0;
  left: 0;
  width: 794px;
  height: 1123px;
  border: 0;
  transform: scale(0.25188);
  transform-origin: top left;
  pointer-events: none;
}
</style>
