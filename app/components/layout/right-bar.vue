<template>
  <div class="right-panel flex flex-col h-full bg-white border-l border-slate-200 overflow-hidden">
    <!-- Panel header -->
    <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
      <div>
        <h2 class="text-sm font-bold text-slate-800">Component Settings</h2>
        <p class="text-[10px] uppercase tracking-wider text-slate-400 mt-0.5">
          {{ selectedNode ? nodeTypeLabel : 'No selection' }}
        </p>
      </div>
      <button
        v-if="selectedNode"
        @click="store.deleteNode(store.selectedComponentId!)"
        class="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
        title="Delete component"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
      </button>
    </div>

    <!-- Empty state -->
    <div
      v-if="!selectedNode"
      class="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6"
    >
      <div class="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 12h6M9 15h4"/></svg>
      </div>
      <p class="text-sm text-slate-400">Select a component on the canvas to edit its properties</p>
    </div>

    <!-- Properties form -->
    <div v-else class="flex-1 overflow-y-auto px-5 py-4 space-y-6">

      <!-- ── DATA BINDING (for p, data-field) ── -->
      <section v-if="showDataBinding">
        <SectionTitle>Data Binding</SectionTitle>
        <div class="space-y-2">
          <label class="block text-xs font-medium text-slate-600 mb-1">Binding Key</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <svg class="w-3.5 h-3.5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
            </div>
            <select
              v-model="localBinding"
              class="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
              @change="saveBinding"
            >
              <option value="">— none —</option>
              <option v-for="key in store.dataKeys" :key="key" :value="key">{{ key }}</option>
            </select>
          </div>

          <!-- Content for paragraphs -->
          <div v-if="selectedNode?.tag === 'p'">
            <label class="block text-xs font-medium text-slate-600 mb-1 mt-3">Text Content</label>
            <ui-variable-autocomplete
              v-model="localContent"
              placeholder="Type text or use {{ for variables"
              @blur="saveContent"
              @keydown.enter="saveContent"
            />
          </div>
        </div>
      </section>

      <!-- ── OUTPUT FORMAT (for data-field) ── -->
      <section v-if="selectedNode?.role === 'field'">
        <SectionTitle>Output Format</SectionTitle>
        <div class="grid grid-cols-2 gap-2">
          <FormatButton
            v-for="fmt in formats"
            :key="fmt.value"
            :label="fmt.label"
            :active="localFormat === fmt.value"
            @click="localFormat = fmt.value; saveFormat()"
          />
        </div>
      </section>

      <!-- ── STYLE & LAYOUT ── -->
      <section>
        <SectionTitle>Style &amp; Layout</SectionTitle>
        <div class="space-y-3">
          <!-- CSS Class -->
          <div>
            <label class="block text-xs font-medium text-slate-600 mb-1">CSS Classes</label>
            <input
              v-model="localClass"
              type="text"
              placeholder="e.g. text-lg font-bold mt-4"
              class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
              @blur="saveClass"
              @keydown.enter="saveClass"
            />
          </div>

          <!-- Font weight (for text nodes) -->
          <div v-if="selectedNode?.tag === 'p' || selectedNode?.role === 'field'">
            <label class="block text-xs font-medium text-slate-600 mb-1">Font Weight</label>
            <div class="flex gap-1">
              <button
                v-for="fw in fontWeights"
                :key="fw.value"
                :class="[
                  'flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors',
                  localFontWeight === fw.value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300',
                ]"
                @click="localFontWeight = fw.value; saveFontWeight()"
              >
                {{ fw.label }}
              </button>
            </div>
          </div>

          <!-- Color picker (for text nodes) -->
          <div v-if="selectedNode?.tag === 'p' || selectedNode?.role === 'field'">
            <label class="block text-xs font-medium text-slate-600 mb-1">Text Color</label>
            <div class="flex gap-2 items-center flex-wrap">
              <button
                v-for="color in presetColors"
                :key="color.class"
                :class="[
                  'w-6 h-6 rounded-full border-2 transition-all',
                  localColor === color.class ? 'border-blue-500 scale-110' : 'border-transparent',
                  color.bg,
                ]"
                @click="localColor = color.class; saveColor()"
                :title="color.label"
              />
              <input
                type="color"
                class="w-6 h-6 rounded-full border border-slate-200 cursor-pointer bg-transparent p-0"
                title="Custom color"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- ── COLUMNS (for table) ── -->
      <section v-if="selectedNode?.tag === 'table'">
        <SectionTitle>Table Data</SectionTitle>
        <p class="text-xs text-slate-500 mb-2">Columns and rows are bound to your JSON data via Handlebars templates.</p>
        <div class="space-y-2">
          <label class="block text-xs font-medium text-slate-600">Columns template</label>
          <textarea
            v-model="localColumns"
            rows="3"
            class="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
            @blur="saveTableData"
          />
          <label class="block text-xs font-medium text-slate-600 mt-2">Rows template</label>
          <textarea
            v-model="localRows"
            rows="3"
            class="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
            @blur="saveTableData"
          />
        </div>
      </section>

      <!-- ── IMAGE SOURCE ── -->
      <section v-if="selectedNode?.tag === 'img'">
        <SectionTitle>Image</SectionTitle>
        <div class="space-y-2">
          <label class="block text-xs font-medium text-slate-600">Image URL</label>
          <ui-variable-autocomplete v-model="localSrc" placeholder="https://... or {{imageUrl}}" @blur="saveSrc" />
          <label class="block text-xs font-medium text-slate-600 mt-2">Upload file</label>
          <input type="file" accept="image/*" @change="onImageFile" class="text-xs w-full" />
        </div>
      </section>

      <!-- ── COLUMNS CONTROL (for row div) ── -->
      <section v-if="selectedNode?.role === 'row'">
        <SectionTitle>Columns Layout</SectionTitle>
        <div class="flex items-center gap-3">
          <label class="text-xs text-slate-600">Number of columns</label>
          <div class="flex items-center gap-2 ml-auto">
            <button @click="removeColumn" class="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold text-sm transition-colors">−</button>
            <span class="text-sm font-semibold text-slate-800 min-w-[20px] text-center">{{ selectedNode.children?.length ?? 0 }}</span>
            <button @click="addColumn" class="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold text-sm transition-colors">+</button>
          </div>
        </div>
      </section>
    </div>

    <!-- Save button -->
    <div v-if="selectedNode" class="px-5 py-4 border-t border-slate-100 flex-shrink-0">
      <button
        @click="saveAll"
        class="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold rounded-xl transition-colors"
      >
        Save Component Changes
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, defineComponent, h } from "vue";
import { templateStore, type SchemaNode, createNodeFromTemplate } from "../../stores/templateStore";

const store = templateStore();

const selectedNode = computed(() => store.selectedNode);

const nodeTypeLabel = computed(() => {
  const n = selectedNode.value;
  if (!n) return "";
  const labels: Record<string, string> = {
    p: "Paragraph",
    table: "Table",
    img: "Image",
    hr: "Divider",
  };
  if (n.role === "row") return "Columns Row";
  if (n.role === "col") return "Column";
  if (n.role === "field") return "Dynamic Data Field";
  if (n.role === "header") return "Page Header";
  if (n.role === "footer") return "Page Footer";
  return labels[n.tag] ?? n.tag.toUpperCase();
});

const showDataBinding = computed(() => {
  const n = selectedNode.value;
  return n?.tag === "p" || n?.role === "field";
});

// Local state (synced from selected node)
const localContent = ref("");
const localBinding = ref("");
const localFormat = ref("default");
const localClass = ref("");
const localFontWeight = ref("");
const localColor = ref("");
const localColumns = ref("");
const localRows = ref("");
const localSrc = ref("");

function syncFromNode() {
  const n = selectedNode.value;
  if (!n) return;
  localContent.value = n.data.content ?? "";
  localBinding.value = n.data.binding ?? "";
  localFormat.value = n.data.format ?? "default";
  localClass.value = n.data.class ?? "";
  localFontWeight.value = extractFontWeight(n.data.class ?? "");
  localColor.value = extractTextColor(n.data.class ?? "");
  localColumns.value = n.data.columns ?? "";
  localRows.value = n.data.rows ?? "";
  localSrc.value = n.data.src ?? "";
}

watch(() => store.selectedComponentId, syncFromNode, { immediate: true });

// ── Save helpers ────────────────────────────────────────────────────────────
function saveContent() {
  if (!selectedNode.value) return;
  store.updateNodeData(selectedNode.value.id, { content: localContent.value });
}

function saveBinding() {
  if (!selectedNode.value) return;
  store.updateNodeData(selectedNode.value.id, { binding: localBinding.value });
}

function saveFormat() {
  if (!selectedNode.value) return;
  store.updateNodeData(selectedNode.value.id, { format: localFormat.value });
}

function saveClass() {
  if (!selectedNode.value) return;
  let cls = localClass.value;
  // Merge font-weight and color back
  if (localFontWeight.value) cls = `${cls} ${localFontWeight.value}`.trim();
  if (localColor.value) cls = `${cls} ${localColor.value}`.trim();
  store.updateNodeData(selectedNode.value.id, { class: cls });
}

function saveFontWeight() {
  if (!selectedNode.value) return;
  let cls = removeWeightClasses(localClass.value);
  if (localFontWeight.value) cls = `${cls} ${localFontWeight.value}`.trim();
  localClass.value = cls;
  store.updateNodeData(selectedNode.value.id, { class: cls });
}

function saveColor() {
  if (!selectedNode.value) return;
  let cls = removeColorClasses(localClass.value);
  if (localColor.value) cls = `${cls} ${localColor.value}`.trim();
  localClass.value = cls;
  store.updateNodeData(selectedNode.value.id, { class: cls });
}

function saveTableData() {
  if (!selectedNode.value) return;
  store.updateNodeData(selectedNode.value.id, {
    columns: localColumns.value,
    rows: localRows.value,
  });
}

function saveSrc() {
  if (!selectedNode.value) return;
  store.updateNodeData(selectedNode.value.id, { src: localSrc.value });
}

async function onImageFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file || !selectedNode.value) return;
  const base64 = await fileToBase64(file);
  store.updateNodeData(selectedNode.value.id, { src: base64 });
  localSrc.value = base64;
}

function saveAll() {
  saveContent();
  saveBinding();
  saveClass();
  if (selectedNode.value?.tag === "table") saveTableData();
  if (selectedNode.value?.tag === "img") saveSrc();
}

// ── Column management ────────────────────────────────────────────────────────
function addColumn() {
  const n = selectedNode.value;
  if (!n || n.role !== "row") return;
  store.addToNode(n.id, createNodeFromTemplate({ tag: "div", data: { class: "flex-1 min-h-16 min-w-0" }, nombre: "col" }));
  // Fix role
  const node = store.selectedNode;
  if (node?.children) {
    node.children[node.children.length - 1].role = "col";
  }
}

function removeColumn() {
  const n = selectedNode.value;
  if (!n || n.role !== "row" || !n.children?.length) return;
  const lastCol = n.children[n.children.length - 1];
  store.deleteNode(lastCol.id);
  store.selectComponent(n.id);
}

// ── Data ────────────────────────────────────────────────────────────────────
const formats = [
  { value: "default", label: "Default" },
  { value: "uppercase", label: "Uppercase" },
  { value: "currency", label: "Currency" },
  { value: "short-date", label: "Short Date" },
];

const fontWeights = [
  { value: "font-light", label: "L" },
  { value: "font-normal", label: "R" },
  { value: "font-bold", label: "B" },
];

const presetColors = [
  { class: "text-slate-900", bg: "bg-slate-900", label: "Black" },
  { class: "text-blue-600", bg: "bg-blue-600", label: "Blue" },
  { class: "text-indigo-600", bg: "bg-indigo-600", label: "Indigo" },
];

// ── Component helpers ────────────────────────────────────────────────────────
const SectionTitle = defineComponent({
  setup(_, { slots }) {
    return () => h(
      'h3',
      { class: 'text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3' },
      slots.default?.()
    );
  },
});

const FormatButton = defineComponent({
  props: { label: String, active: Boolean },
  emits: ['click'],
  setup(fProps, { emit }) {
    return () => h(
      'button',
      {
        class: ['py-2 text-xs font-semibold rounded-lg border transition-colors', fProps.active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'].join(' '),
        onClick: () => emit('click'),
      },
      fProps.label
    );
  },
});

function extractFontWeight(cls: string): string {
  const match = cls.match(/font-(light|normal|semibold|bold|extrabold)/);
  return match ? match[0] : "";
}

function extractTextColor(cls: string): string {
  const match = cls.match(/text-[a-z]+-\d+/);
  return match ? match[0] : "";
}

function removeWeightClasses(cls: string): string {
  return cls.replace(/font-(light|normal|semibold|bold|extrabold)/g, "").trim();
}

function removeColorClasses(cls: string): string {
  return cls.replace(/text-[a-z]+-\d+/g, "").trim();
}

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result?.toString() || "");
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
</script>

<style scoped>
.right-panel {
  width: 300px;
  min-width: 300px;
  flex-shrink: 0;
}
</style>
