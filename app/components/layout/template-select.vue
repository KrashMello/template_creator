<template>
  <div class="flex items-center">
    <label for="tc-template-select" class="sr-only">{{ t('editor.templates.title') }}</label>
    <select
      id="tc-template-select"
      v-model="selected"
      :class="SELECT_CLASS"
      @change="onChange"
    >
      <option value="" disabled>{{ t('editor.templates.placeholder') }}</option>
      <option v-for="tpl in templates" :key="tpl.id" :value="tpl.id">
        {{ itemTitle(tpl.id) }}
      </option>
    </select>

    <Teleport to="body">
      <div
        v-if="pending"
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
        @click.self="cancel"
      >
        <div
          ref="dialogRef"
          role="dialog"
          aria-modal="true"
          :aria-label="confirmTitle"
          tabindex="-1"
          class="w-full max-w-sm max-h-[90vh] overflow-y-auto rounded-2xl border border-content/10 bg-surface p-5 shadow-2xl focus-visible:outline-none"
          @keydown.esc="cancel"
        >
          <!-- Miniatura en vivo del documento que se va a cargar -->
          <span class="thumb block">
            <iframe
              v-if="docs[pending.id]"
              class="thumb-frame"
              :srcdoc="docs[pending.id]"
              :title="itemTitle(pending.id)"
              aria-hidden="true"
              tabindex="-1"
            />
          </span>

          <h3 class="mt-4 text-sm font-bold text-content">{{ confirmTitle }}</h3>
          <p class="mt-1 text-xs font-semibold text-accent">{{ itemTitle(pending.id) }}</p>
          <p class="mt-2 text-sm leading-relaxed text-content-muted">{{ confirmMessage }}</p>

          <div class="mt-3 flex flex-wrap gap-1">
            <span
              v-for="feature in itemFeatures(pending.id)"
              :key="feature"
              class="rounded-full bg-surface-alt px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-content-muted"
            >
              {{ feature }}
            </span>
          </div>

          <div class="mt-5 flex justify-end gap-2">
            <ui-button variant="outline" class="h-8 px-3" :click="cancel">
              <span class="text-xs font-semibold">{{ t('editor.templates.confirm.cancel') }}</span>
            </ui-button>
            <ui-button variant="primary" class="h-8 px-3" :click="accept">
              <span class="text-xs font-semibold">{{ t('editor.templates.confirm.accept') }}</span>
            </ui-button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { templateStore } from "../../stores/templateStore";
import { PREBUILT_TEMPLATES, renderTemplateDoc, toTemplateLocale } from "../../templates";
import type { PrebuiltTemplate } from "../../templates";

const { t, tm, locale } = useI18n();
const store = templateStore();

const SELECT_CLASS =
  "h-8 max-w-[170px] cursor-pointer rounded-lg border border-content/10 bg-surface px-2 text-xs font-semibold text-content transition-colors hover:border-content/25 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40";

const templates = PREBUILT_TEMPLATES;

/** Plantilla realmente cargada; sirve para restaurar el select al cancelar. */
const applied = ref("");
const selected = ref("");
const pending = ref<PrebuiltTemplate | null>(null);
const dialogRef = ref<HTMLElement | null>(null);

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

watch(pending, (value) => {
  if (value) nextTick(() => dialogRef.value?.focus());
});
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
  border: 1px solid #e2e8f0;
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
