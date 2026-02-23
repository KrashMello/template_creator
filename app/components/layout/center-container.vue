<template>
  <div class="center-panel flex-1 flex flex-col h-full overflow-hidden" id="dropzone">
    <layout-content-header @select="selectView" @export="generateDocument" />
    <div class="flex-1 overflow-auto canvas-bg py-8 px-4" v-if="selectedView === 1">
      <div class="a4-page mx-auto bg-white rounded-sm shadow-xl overflow-hidden gap-2">
        <div class="zone-label zone-label--body">
          <svg class="w-3 h-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 9h6M9 12h6M9 15h4" />
          </svg>
          Dynamic Content Area
        </div>
        <div id="preview" v-html="previewHtml" @dragenter="onDragEnter" @dragleave="onDragLeave" @drop="onDrop">
        </div>
      </div>
    </div>
    <ui-data-editor v-if="selectedView === 2" v-model="schemaJson" title="Esquema" :readOnly="true" />
    <ui-style-editor v-if="selectedView === 3" />
    <ui-data-editor v-if="selectedView === 4" v-model="data" title="Data" />
  </div>
</template>
<script setup>
import { templateStore } from "../../stores/templateStore";
const previewHtml = computed(() => templateStore().previewHtml);
const schemaJson = computed(() => templateStore().schemaJson);
const selectedView = ref(1);
const selectView = (opt) => {
  selectedView.value = opt;
};

const data = computed({
  get() {
    return JSON.stringify(templateStore().data, null, 2);
  },
  set(newValue) {
    try {
      templateStore().data = JSON.parse(newValue);
      templateStore().renderPreview();
    }
    catch (e) { }
  },
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
const onDrop = templateStore().onDrop;
const generateDocument = templateStore().generateDocument;
</script>
<style scoped>
.center-panel {
  background: #f8fafc;
}

/* Canvas background grid */
.canvas-bg {
  background-color: #f1f5f9;
  background-image:
    linear-gradient(rgba(99, 125, 161, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(99, 125, 161, 0.08) 1px, transparent 1px);
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

.zone-empty-hint {
  font-size: 11px;
  color: #94a3b8;
  text-align: center;
  padding: 16px;
}

.section-breakdown-divider {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 16px;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #94a3b8;
  border-top: 1px dashed #e2e8f0;
}
</style>
