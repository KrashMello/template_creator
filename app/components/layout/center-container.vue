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
              <UIcon name="i-lucide-panel-top" class="size-3" />
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
              <UIcon name="i-lucide-panel-top-open" class="size-3" />
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
              <UIcon name="i-lucide-panel-bottom" class="size-3" />
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
          <UButton
            v-for="mode in ['form', 'json']"
            :key="mode"
            size="xs"
            :color="dataMode === mode ? 'primary' : 'neutral'"
            :variant="dataMode === mode ? 'solid' : 'outline'"
            @click="dataMode = mode"
          >
            {{ t(`editor.dataForm.mode.${mode}`) }}
          </UButton>
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
