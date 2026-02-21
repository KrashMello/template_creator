<template>
  <div
    class="center-panel flex-1 flex flex-col h-full overflow-hidden"
    @click.self="store.clearSelection()"
  >
    <!-- Top navigation bar -->
    <div class="flex items-center gap-2 px-4 py-2.5 border-b border-slate-200 bg-white flex-shrink-0">

      <!-- Mode toggle -->
      <div class="flex items-center bg-slate-100 rounded-lg p-0.5 gap-0.5">
        <button
          v-for="mode in modes"
          :key="mode.value"
          :class="[
            'px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all',
            store.canvasMode === mode.value
              ? 'bg-white text-slate-800 shadow-sm'
              : 'text-slate-500 hover:text-slate-700',
          ]"
          @click="store.canvasMode = mode.value as any"
        >
          {{ mode.label }}
        </button>
      </div>

      <!-- Undo / Redo -->
      <div class="flex items-center gap-1 ml-2">
        <button
          @click="store.undo()"
          :disabled="!store.history.length"
          class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-colors"
          title="Undo"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
        </button>
        <button
          @click="store.redo()"
          :disabled="!store.redoStack.length"
          class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-colors"
          title="Redo"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/></svg>
        </button>
      </div>

      <!-- Export button -->
      <button
        @click="store.generateDocument()"
        class="ml-auto flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M0 0h24v24H0z" fill="none"/><path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z"/></svg>
        Export to PDF
      </button>
    </div>

    <!-- Design mode -->
    <div
      v-if="store.canvasMode === 'design'"
      class="flex-1 overflow-auto canvas-bg py-8 px-4"
      @click.self="store.clearSelection()"
    >
      <!-- A4 page -->
      <div
        class="a4-page mx-auto bg-white rounded-sm shadow-xl overflow-hidden"
        @click.self="store.clearSelection()"
      >
        <!-- Header zone – only visible when content exists -->
        <div
          v-if="store.schema.header"
          class="zone-header"
          @dragover.prevent
          @drop.stop="(e) => store.onDrop(e, null, 'header')"
          @click.self="store.clearSelection()"
        >
          <div class="zone-label zone-label--header">
            <svg class="w-3 h-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"/><path d="M3 9V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4"/></svg>
            Global Page Header
          </div>
          <div class="p-3">
            <LayoutCanvasNode :node="store.schema.header" />
          </div>
        </div>

        <!-- Body zone -->
        <div
          class="zone-body"
          @dragover.prevent
          @drop.stop="onBodyDrop"
          @click.self="store.clearSelection()"
        >
          <div class="zone-label zone-label--body">
            <svg class="w-3 h-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 12h6M9 15h4"/></svg>
            Dynamic Content Area
          </div>

          <div class="body-content p-4 flex flex-col gap-3 min-h-64">
            <LayoutCanvasNode
              v-for="node in store.schema.children"
              :key="node.id"
              :node="node"
            />
            <div
              v-if="!store.schema.children.length"
              class="flex-1 flex flex-col items-center justify-center gap-3 py-16 text-slate-300 select-none pointer-events-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 12h6M9 15h4"/></svg>
              <p class="text-sm">Drag components here to build your template</p>
            </div>
          </div>


        </div>

        <!-- Footer zone – only visible when content exists -->
        <div
          v-if="store.schema.footer"
          class="zone-footer"
          @dragover.prevent
          @drop.stop="(e) => store.onDrop(e, null, 'footer')"
          @click.self="store.clearSelection()"
        >
          <div class="zone-label zone-label--footer">
            <svg class="w-3 h-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 5h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5z"/><path d="M3 15v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4"/></svg>
            Page Footer
          </div>
          <div class="p-3">
            <LayoutCanvasNode :node="store.schema.footer" />
          </div>
        </div>
      </div>
    </div>

    <!-- Data Binding mode -->
    <div v-else class="flex-1 flex flex-col overflow-hidden bg-slate-50">
      <div class="flex-1 overflow-hidden p-4">
        <div class="h-full rounded-xl overflow-hidden border border-slate-200 shadow-sm">
          <div class="bg-slate-800 px-4 py-2 flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-red-400"></span>
            <span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span class="text-slate-400 text-xs ml-2 font-mono">data.json</span>
          </div>
          <ClientOnly>
            <ui-code-editor
              v-model="dataJson"
              language="json"
              height="100%"
            />
          </ClientOnly>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { templateStore } from "../../stores/templateStore";

const store = templateStore();

const modes = [
  { value: "design", label: "Design" },
  { value: "data", label: "Data Binding" },
];

// JSON data model for Monaco editor
const dataJson = computed({
  get() {
    return JSON.stringify(store.data, null, 2);
  },
  set(val: string) {
    try {
      store.data = JSON.parse(val);
    } catch {
      // Invalid JSON, do nothing
    }
  },
});

function onBodyDrop(e: DragEvent) {
  store.onDrop(e, null, "body");
}
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
