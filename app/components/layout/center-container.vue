<template>
  <div class="center-panel flex-1 flex flex-col h-full overflow-hidden" id="dropzone">
    <layout-content-header
      :view="selectedView"
      :exporting="exporting"
      @select="selectView"
      @export="onExport"
    />
    <div class="flex-1 overflow-auto canvas-bg py-8 px-4" v-if="selectedView === 1">
      <div class="a4-page mx-auto bg-white rounded-sm shadow-xl overflow-hidden gap-2">

        <div class="zone-header flex flex-col">
          <div>
            <div class="zone-label zone-label--header">
              <svg class="w-3 h-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2">
                <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" />
                <path d="M3 9V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4" />
              </svg>
              {{ t('editor.zones.header') }}
            </div>
          </div>
          <div id="header" class="flex flex-1 h-full" v-html="previewHtmlHeader" @dragenter="onDragEnter"
            @dragleave="onDragLeave" @drop="(event) => onDrop(event, 'header')">
          </div>
        </div>
        <div class="zone-body flex flex-col">
          <div>
            <div class="zone-label zone-label--body">
              <svg class="w-3 h-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M9 9h6M9 12h6M9 15h4" />
              </svg>
              {{ t('editor.zones.body') }}
            </div>
          </div>
          <div id="preview" class="flex flex-1 h-full" v-html="previewHtml" @dragenter="onDragEnter"
            @dragleave="onDragLeave" @drop="onDrop">
          </div>
        </div>
        <div class="zone-footer flex flex-col">
          <div>
            <div class="zone-label zone-label--footer">
              <svg class="w-3 h-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2">
                <path d="M3 5h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5z" />
                <path d="M3 15v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4" />
              </svg>
              {{ t('editor.zones.footer') }}
            </div>
          </div>
          <div id="footer" class="flex flex-1 h-full" v-html="previewHtmlFooter" @dragenter="onDragEnter"
            @dragleave="onDragLeave" @drop="(event) => onDrop(event, 'footer')">
          </div>
        </div>
      </div>
    </div>
    <div v-if="selectedView === 2" class="min-h-0 flex-1">
      <ui-data-editor v-model="schemaJson" :title="t('editor.views.schema')" :readOnly="true" />
    </div>
    <div v-if="selectedView === 3" class="min-h-0 flex-1">
      <ui-style-editor />
    </div>
    <div v-if="selectedView === 4" class="min-h-0 flex-1 flex flex-col">
      <div class="flex shrink-0 items-center justify-between gap-2 px-4 pt-4">
        <h2 class="text-sm font-bold text-content">{{ t('editor.views.data') }}</h2>
        <div class="flex gap-1">
          <button type="button" :class="segmentClass(dataMode === 'form')" @click="dataMode = 'form'">
            {{ t('editor.dataForm.mode.form') }}
          </button>
          <button type="button" :class="segmentClass(dataMode === 'json')" @click="dataMode = 'json'">
            {{ t('editor.dataForm.mode.json') }}
          </button>
        </div>
      </div>
      <div v-if="dataMode === 'form'" class="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        <ui-data-form :obj="store.data" @change="onDataChange" />
      </div>
      <div v-else class="min-h-0 flex-1">
        <ui-data-editor v-model="data" :title="''" />
      </div>
    </div>
  </div>
</template>
<script setup>
import { templateStore } from "../../stores/templateStore";
const store = templateStore();
const { t } = useI18n();
const previewHtml = computed(() => templateStore().previewHtml);
const previewHtmlFooter = computed(() => store.previewHtmlFooter);
const previewHtmlHeader = computed(() => store.previewHtmlHeader);
const schemaJson = computed(() => store.schemaJson);
const selectedView = ref(1);
const exporting = ref(false);
/** Modo de la pestaña Datos: formulario tipado o editor JSON. */
const dataMode = ref("form");

const selectView = (opt) => {
  selectedView.value = opt;
};

const data = computed({
  get() {
    return JSON.stringify(store.data, null, 2);
  },
  set(newValue) {
    try {
      store.data = JSON.parse(newValue);
      store.renderPreview();
    }
    catch (e) { }
  },
});

/** El formulario muta store.data en vivo; debounce para no recompilar por tecla. */
let dataRenderTimer = null;
function onDataChange() {
  if (dataRenderTimer) clearTimeout(dataRenderTimer);
  dataRenderTimer = setTimeout(() => {
    dataRenderTimer = null;
    store.renderPreview();
  }, 300);
}
onBeforeUnmount(() => {
  if (dataRenderTimer) clearTimeout(dataRenderTimer);
});

/** Botones segmentados (mismo estilo que la tarjeta Documento del right-bar). */
function segmentClass(active) {
  return [
    "px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
    active
      ? "bg-primary text-primary-foreground border-primary shadow-sm"
      : "bg-surface text-content-muted border-content/10 hover:border-content/25",
  ];
}
const onDragEnter = (event) => {
  event.preventDefault();
  event.stopPropagation();

  const target = event.target.closest(".draggable-component");

  if (target) {
    target.classList.add("border-slate-600", "border-solid");
    target.classList.remove("border-dashed", "border-slate-400");
  }
};
const onDragLeave = (event) => {
  event.preventDefault();
  event.stopPropagation();

  const target = event.target.closest(".draggable-component");

  if (target) {
    target.classList.remove("border-slate-600", "border-solid");
    target.classList.add("border-dashed", "border-slate-400");
  }
};
const onDrop = store.onDrop;

async function onExport() {
  if (exporting.value) return;
  exporting.value = true;
  try {
    await store.generateDocument();
  } catch (e) {
    console.error("Error exportando PDF:", e);
  } finally {
    exporting.value = false;
  }
}
</script>
<style scoped>
/* Workspace around the paper follows the theme; the A4 page itself stays white */
.center-panel {
  background: var(--surface);
}

/* Canvas background grid */
.canvas-bg {
  background-color: var(--surface-alt);
  background-image:
    linear-gradient(rgba(129, 161, 193, 0.14) 1px, transparent 1px),
    linear-gradient(90deg, rgba(129, 161, 193, 0.14) 1px, transparent 1px);
  background-size: 20px 20px;
}

/* A4 proportions at 96dpi */
.a4-page {
  width: 794px;
  min-height: 1123px;
  display: flex;
  flex-direction: column;
}

/* Zones */
.zone-header {
  border-bottom: 2px dashed #bfdbfe;
  background: #eff6ff;
  min-height: 60px;
}

.zone-body {
  flex: 1;
  background: white;
}

.zone-footer {
  border-top: 2px dashed #e2e8f0;
  background: #f8fafc;
  min-height: 60px;
}

.zone-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  padding: 4px 10px;
  border-radius: 0 0 8px 0;
}

.zone-label--header {
  background: #bfdbfe;
  color: #1e40af;
}

.zone-label--body {
  background: #e2e8f0;
  color: #475569;
}

.zone-label--footer {
  background: #e2e8f0;
  color: #64748b;
}
</style>
