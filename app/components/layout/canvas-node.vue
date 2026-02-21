<template>
  <div class="canvas-node-wrapper relative">
    <!-- Drop indicator BEFORE -->
    <div v-if="dropPos === 'before'" class="drop-indicator drop-indicator--before" />

    <!-- ── ROW ──────────────────────────────────────────────────────── -->
    <div
      v-if="isRow"
      :class="nodeClass('flex flex-row gap-1.5 min-h-12 w-full p-1.5 rounded-lg border-2 border-dashed')"
      @click.stop="select"
      @dragstart.stop="onDragStart"
      @dragover.prevent.stop="onDragOver"
      @dragleave.stop="onDragLeave"
      @drop.stop="(e) => onDrop(e, 'inside')"
      draggable="true"
    >
      <div class="node-toolbar">
        <svg class="w-3 h-3" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="5" width="14" height="2" rx="1"/><rect x="1" y="9" width="14" height="2" rx="1"/><rect x="1" y="1" width="4" height="14" rx="1" opacity=".4"/><rect x="6" y="1" width="4" height="14" rx="1" opacity=".4"/><rect x="11" y="1" width="4" height="14" rx="1" opacity=".4"/></svg>
        <span>Row</span>
        <button class="delete-btn" @click.stop="remove">×</button>
      </div>
      <LayoutCanvasNode v-for="child in node.children" :key="child.id" :node="child" class="flex-1 min-w-0" />
      <div v-if="!node.children?.length" class="col-empty-hint">Drop columns here</div>
    </div>

    <!-- ── COL ──────────────────────────────────────────────────────── -->
    <div
      v-else-if="isCol"
      :class="nodeClass('flex flex-col gap-1.5 min-h-12 flex-1 min-w-0 p-1.5 rounded-lg border-2 border-dashed')"
      @click.stop="select"
      @dragstart.stop="onDragStart"
      @dragover.prevent.stop="onDragOver"
      @dragleave.stop="onDragLeave"
      @drop.stop="(e) => onDrop(e, 'inside')"
      draggable="true"
    >
      <div class="node-toolbar">
        <svg class="w-3 h-3" viewBox="0 0 16 16" fill="currentColor"><rect x="2" y="2" width="12" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="6" y="2" width="1.5" height="12" opacity=".5"/><rect x="9" y="2" width="1.5" height="12" opacity=".5"/></svg>
        <span>Column</span>
        <button class="delete-btn" @click.stop="remove">×</button>
      </div>
      <LayoutCanvasNode v-for="child in node.children" :key="child.id" :node="child" />
      <div v-if="!node.children?.length" class="col-empty-hint">Drop here</div>
    </div>

    <!-- ── PARAGRAPH ─────────────────────────────────────────────────── -->
    <div
      v-else-if="node.tag === 'p'"
      :class="nodeClass('p-0 rounded-lg border-2 border-dashed cursor-pointer')"
      draggable="true"
      @click.stop="select"
      @dragstart.stop="onDragStart"
      @dragover.prevent.stop="onDragOver"
      @dragleave.stop="onDragLeave"
      @drop.stop="onDrop()"
    >
      <div class="node-toolbar">
        <svg class="w-3 h-3" viewBox="0 0 16 16" fill="currentColor"><path d="M3 3h7a3 3 0 0 1 0 6H8v4H6V9H3V3zm3 4h4a1 1 0 0 0 0-2H6v2z"/></svg>
        <span>Paragraph</span>
        <button class="delete-btn" @click.stop="remove">×</button>
      </div>
      <p class="px-3 pb-3 text-sm leading-relaxed" :class="node.data.class">
        <UiVariableChips :text="node.data.content ?? 'Type here...'" />
      </p>
    </div>

    <!-- ── TABLE ──────────────────────────────────────────────────────── -->
    <div
      v-else-if="node.tag === 'table'"
      :class="nodeClass('rounded-lg overflow-hidden border-2 border-dashed cursor-pointer')"
      draggable="true"
      @click.stop="select"
      @dragstart.stop="onDragStart"
      @dragover.prevent.stop="onDragOver"
      @dragleave.stop="onDragLeave"
      @drop.stop="onDrop()"
    >
      <div class="node-toolbar">
        <svg class="w-3 h-3" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="1" width="14" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M1 5h14M5 1v14M1 9h14" stroke="currentColor" stroke-width="1.2"/></svg>
        <span>Table</span>
        <button class="delete-btn" @click.stop="remove">×</button>
      </div>
      <table class="w-full text-sm text-left">
        <thead class="bg-slate-800 text-white">
          <tr>
            <th v-for="col in tableCols" :key="col" class="px-4 py-2.5 font-semibold">
              <UiVariableChips :text="col" />
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, ri) in tableRows" :key="ri" class="border-b border-slate-100 odd:bg-white even:bg-slate-50/50">
            <td v-for="(cell, ci) in row" :key="ci" class="px-4 py-2 text-slate-700">
              <UiVariableChips :text="String(cell ?? '')" />
            </td>
          </tr>
          <tr v-if="!tableRows.length" class="text-slate-300">
            <td :colspan="tableCols.length" class="px-4 py-3 text-center text-xs">(no data rows — bound at runtime)</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ── IMAGE ──────────────────────────────────────────────────────── -->
    <div
      v-else-if="node.tag === 'img'"
      :class="nodeClass('rounded-lg overflow-hidden border-2 border-dashed cursor-pointer')"
      draggable="true"
      @click.stop="select"
      @dragstart.stop="onDragStart"
      @dragover.prevent.stop="onDragOver"
      @dragleave.stop="onDragLeave"
      @drop.stop="(e) => onDrop(e)"
    >
      <div class="node-toolbar">
        <svg class="w-3 h-3" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="1" width="14" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="5.5" cy="5.5" r="1.5"/><path d="M1 11l4-4 3 3 2-2 5 5" stroke="currentColor" stroke-width="1.2" fill="none" stroke-linejoin="round"/></svg>
        <span>Image</span>
        <button class="delete-btn" @click.stop="remove">×</button>
      </div>
      <img :src="node.data.src || placeholderSrc" :class="node.data.class || 'w-full max-h-48 object-cover'" alt="" />
    </div>

    <!-- ── DATA FIELD ────────────────────────────────────────────────── -->
    <div
      v-else-if="node.role === 'field'"
      :class="nodeClass('rounded-lg border-2 border-dashed cursor-pointer')"
      draggable="true"
      @click.stop="select"
      @dragstart.stop="onDragStart"
      @dragover.prevent.stop="onDragOver"
      @dragleave.stop="onDragLeave"
      @drop.stop="(e) => onDrop(e)"
    >
      <div class="node-toolbar">
        <svg class="w-3 h-3" viewBox="0 0 16 16" fill="currentColor"><path d="M2 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4zm3 1h6v1.5H5V5zm0 3h6v1.5H5V8zm0 3h4v1.5H5V11z"/></svg>
        <span class="text-blue-600">Data Field</span>
        <button class="delete-btn" @click.stop="remove">×</button>
      </div>
      <div class="px-3 pb-3 font-mono text-sm text-slate-600">
        <UiVariableChips :text="node.data.binding ? `{{${node.data.binding}}}` : '(no binding set)'" />
      </div>
    </div>

    <!-- ── HR / DIVIDER ──────────────────────────────────────────────── -->
    <div
      v-else-if="node.tag === 'hr'"
      :class="nodeClass('py-2 rounded-lg border-2 border-dashed cursor-pointer')"
      draggable="true"
      @click.stop="select"
      @dragstart.stop="onDragStart"
      @dragover.prevent.stop="onDragOver"
      @dragleave.stop="onDragLeave"
      @drop.stop="(e) => onDrop(e)"
    >
      <div class="node-toolbar">
        <svg class="w-3 h-3" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="7.5" width="14" height="1.5" rx=".75"/></svg>
        <span>Divider</span>
        <button class="delete-btn" @click.stop="remove">×</button>
      </div>
      <hr class="mx-3 mb-1" :class="node.data.class ?? 'border-slate-300'" />
    </div>

    <!-- ── PAGE HEADER / FOOTER ──────────────────────────────────────── -->
    <div
      v-else-if="node.role === 'header' || node.role === 'footer'"
      :class="nodeClass('rounded-lg border-2 border-dashed cursor-pointer')"
      draggable="true"
      @click.stop="select"
      @dragstart.stop="onDragStart"
      @dragover.prevent.stop="onDragOver"
      @dragleave.stop="onDragLeave"
      @drop.stop="(e) => onDrop(e)"
    >
      <div class="node-toolbar">
        <svg v-if="node.role === 'header'" class="w-3 h-3" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="1" width="14" height="4" rx="1.5"/><rect x="1" y="7" width="14" height="1.5" rx=".75" opacity=".4"/><rect x="1" y="10" width="14" height="1.5" rx=".75" opacity=".4"/><rect x="1" y="13" width="8" height="1.5" rx=".75" opacity=".4"/></svg>
        <svg v-else class="w-3 h-3" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="11" width="14" height="4" rx="1.5"/><rect x="1" y="3" width="14" height="1.5" rx=".75" opacity=".4"/><rect x="1" y="6" width="14" height="1.5" rx=".75" opacity=".4"/><rect x="1" y="9" width="8" height="1.5" rx=".75" opacity=".4"/></svg>
        <span class="text-indigo-600">{{ node.role === 'header' ? 'Page Header' : 'Page Footer' }}</span>
        <button class="delete-btn" @click.stop="remove">×</button>
      </div>
      <div class="px-3 pb-3 text-sm text-slate-500 italic">
        <UiVariableChips :text="node.data.content ?? '(page header/footer content)'" />
      </div>
    </div>

    <!-- ── GENERIC FALLBACK ──────────────────────────────────────────── -->
    <div
      v-else
      :class="nodeClass('p-1.5 rounded-lg border-2 border-dashed cursor-pointer')"
      draggable="true"
      @click.stop="select"
      @dragstart.stop="onDragStart"
      @dragover.prevent.stop="onDragOver"
      @dragleave.stop="onDragLeave"
      @drop.stop="(e) => onDrop(e, 'inside')"
    >
      <div class="node-toolbar">
        <svg class="w-3 h-3" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="1" width="14" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
        <span>{{ node.tag }}</span>
        <button class="delete-btn" @click.stop="remove">×</button>
      </div>
      <LayoutCanvasNode v-for="child in node.children" :key="child.id" :node="child" />
    </div>

    <!-- Drop indicator AFTER -->
    <div v-if="dropPos === 'after'" class="drop-indicator drop-indicator--after" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { templateStore, type SchemaNode } from "../../stores/templateStore";

const props = defineProps<{ node: SchemaNode }>();
const store = templateStore();

const isSelected = computed(() => store.selectedComponentId === props.node.id);
const isRow = computed(() => props.node.tag === "div" && props.node.role === "row");
const isCol = computed(() => props.node.tag === "div" && props.node.role === "col");

const dropPos = ref<"before" | "after" | null>(null);

const placeholderSrc =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgNDAwIDIwMCI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmMWY1ZjkiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5NGEzYjgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBQbGFjZWhvbGRlcjwvdGV4dD48L3N2Zz4=";

const tableCols = computed(() => props.node.data.cols_data ?? store.data?.table?.cols ?? ["Column 1", "Column 2"]);
const tableRows = computed(() => props.node.data.rows_data ?? store.data?.table?.rows ?? []);

function nodeClass(extra: string) {
  const sel = isSelected.value;
  return [
    "canvas-node relative group",
    extra,
    sel ? "ring-2 ring-blue-400 ring-offset-1 border-blue-300" : "border-slate-200 hover:border-slate-300",
    dropPos.value !== null && !isRow.value && !isCol.value ? "opacity-70" : "",
  ].filter(Boolean).join(" ");
}

function select() {
  store.selectComponent(props.node.id);
}

function remove() {
  store.deleteNode(props.node.id);
}

function onDragStart(e: DragEvent) {
  e.dataTransfer!.setData("text/plain", JSON.stringify({
    action: "move",
    id: props.node.id,
    tag: props.node.tag,
    data: props.node.data,
    nombre: props.node.tag,
  }));
  e.dataTransfer!.effectAllowed = "move";
}

function onDragOver(e: DragEvent) {
  if (isRow.value || isCol.value) return; // containers show inner highlight
  const el = e.currentTarget as HTMLElement;
  const rect = el.getBoundingClientRect();
  dropPos.value = (e.clientY - rect.top) < rect.height / 2 ? "before" : "after";
}

function onDragLeave() {
  dropPos.value = null;
}

function onDrop(e: DragEvent, forcedPos?: "before" | "after" | "inside") {
  const pos = forcedPos ?? dropPos.value ?? "after";
  dropPos.value = null;
  store.onDrop(e, props.node.id, "body", pos as any);
}
</script>

<style>
.canvas-node-wrapper {
  position: relative;
}

/* Toolbar strip at top of every node */
.node-toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94a3b8;
  border-bottom: 1px solid #f1f5f9;
  user-select: none;
}

.node-toolbar span {
  flex: 1;
}

.delete-btn {
  opacity: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 4px;
  background: #fee2e2;
  color: #ef4444;
  font-size: 12px;
  font-weight: bold;
  line-height: 1;
  border: none;
  cursor: pointer;
  transition: all 0.15s;
}
.canvas-node:hover .delete-btn { opacity: 1; }
.delete-btn:hover { background: #ef4444; color: white; }

/* Drop indicators */
.drop-indicator {
  position: absolute;
  left: 4px;
  right: 4px;
  height: 3px;
  background: #3b82f6;
  border-radius: 2px;
  z-index: 10;
  box-shadow: 0 0 6px rgba(59, 130, 246, 0.5);
}
.drop-indicator--before { top: -2px; }
.drop-indicator--after  { bottom: -2px; }

/* Empty column hint */
.col-empty-hint {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: #cbd5e1;
  pointer-events: none;
  min-height: 36px;
}
</style>
