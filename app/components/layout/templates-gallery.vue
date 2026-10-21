<template>
  <section>
    <button
      type="button"
      class="flex w-full items-center justify-between rounded-lg px-1 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      :aria-expanded="open"
      :aria-controls="'templates-gallery'"
      @click="open = !open"
    >
      <span class="text-[10px] font-bold uppercase tracking-widest text-content-muted">
        {{ t('editor.leftBar.templates.title') }}
      </span>
      <svg
        class="h-3.5 w-3.5 text-content-muted transition-transform duration-200"
        :class="{ 'rotate-180': !open }"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>

    <div v-if="open" id="templates-gallery" class="mt-3 space-y-3">
      <p class="rounded-lg bg-surface-alt px-3 py-2.5 text-center text-[11px] leading-relaxed text-content-muted">
        {{ t('editor.leftBar.templates.hint') }}
      </p>

      <!-- Mismo aspecto que los botones de la paleta; el pulso carga la plantilla. -->
      <div class="grid grid-cols-2 gap-2">
        <ui-template-button
          v-for="tpl in templates"
          :key="tpl.id"
          :name="itemTitle(tpl.id)"
          :icon="ICONS[tpl.id]"
          :accent="ACCENTS[tpl.id]"
          :description="itemDesc(tpl.id)"
          :click="() => requestLoad(tpl)"
        />
      </div>
    </div>

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
              <span class="text-xs font-semibold">{{ t('editor.leftBar.templates.confirm.cancel') }}</span>
            </ui-button>
            <ui-button variant="primary" class="h-8 px-3" :click="accept">
              <span class="text-xs font-semibold">{{ t('editor.leftBar.templates.confirm.accept') }}</span>
            </ui-button>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<script setup lang="ts">
import certificateIcon from "../svg/certificate.vue";
import contractIcon from "../svg/contract.vue";
import invoiceIcon from "../svg/invoice.vue";
import ndaIcon from "../svg/nda.vue";
import rentalIcon from "../svg/rental.vue";
import reportIcon from "../svg/report.vue";
import shippingIcon from "../svg/shipping.vue";
import showcaseIcon from "../svg/showcase.vue";
import ticketIcon from "../svg/ticket.vue";
import { templateStore } from "../../stores/templateStore";
import { PREBUILT_TEMPLATES, renderTemplateDoc, toTemplateLocale } from "../../templates";
import type { PrebuiltTemplate } from "../../templates";

const { t, tm, locale } = useI18n();
const store = templateStore();

const open = ref(true);
const pending = ref<PrebuiltTemplate | null>(null);
const dialogRef = ref<HTMLElement | null>(null);

const templates = PREBUILT_TEMPLATES;

const ICONS: Record<string, any> = {
  invoice: invoiceIcon,
  report: reportIcon,
  certificate: certificateIcon,
  contract: contractIcon,
  nda: ndaIcon,
  rental: rentalIcon,
  receipt: ticketIcon,
  "shipping-label": shippingIcon,
  showcase: showcaseIcon,
};

const ACCENTS: Record<string, string> = {
  invoice: "blue",
  report: "indigo",
  certificate: "amber",
  contract: "slate",
  nda: "purple",
  rental: "emerald",
  receipt: "pink",
  "shipping-label": "emerald",
  showcase: "purple",
};

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

const confirmTitle = computed(() => t("editor.leftBar.templates.confirm.title"));
const confirmMessage = computed(() => t("editor.leftBar.templates.confirm.message"));

const itemTitle = (id: string) => t(`editor.leftBar.templates.items.${id}.title`);
const itemDesc = (id: string) => t(`editor.leftBar.templates.items.${id}.desc`);
const itemFeatures = (id: string): string[] => {
  const key = `editor.leftBar.templates.items.${id}.features`;
  const list = tm(key) as unknown[];
  if (!Array.isArray(list)) return [];
  return list.map((_, i) => t(`${key}.${i}`));
};

function requestLoad(tpl: PrebuiltTemplate) {
  if (hasContent.value) pending.value = tpl;
  else apply(tpl);
}

function apply(tpl: PrebuiltTemplate) {
  store.loadTemplate(tpl.build({ locale: toTemplateLocale(locale.value) }));
  pending.value = null;
}

function cancel() {
  pending.value = null;
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
