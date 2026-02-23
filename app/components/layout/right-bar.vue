<template>
  <div class="right-panel flex flex-col h-full bg-white border-l border-slate-200 overflow-hidden">
    <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
      <div>
        <h2 class="text-sm font-bold text-slate-800">Component Settings</h2>
        <p class="text-[10px] uppercase tracking-wider text-slate-400 mt-0.5">
          {{ selectedElement ? `${selectedElement.tagName} ${selectedNode.name}` : 'No selection' }}
        </p>
      </div>
      <button v-if="selectedElement" @click="deleteElement"
        class="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
        title="Delete component">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6M14 11v6" />
          <path d="M9 6V4h6v2" />
        </svg>
      </button>
    </div>
    <div v-if="!selectedElement" class="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
      <div class="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#94a3b8"
          stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 9h6M9 12h6M9 15h4" />
        </svg>
      </div>
      <p class="text-sm text-slate-400">Select a component on the canvas to edit its properties</p>
    </div>
    <div id="options" v-else class="flex-1">
      <form @submit.prevent="saveDataOptions" class="h-full flex flex-col gap-2">
        <div class="flex-1 px-5">
          <ui-input v-if="selectedNode.data.content" v-model="options.content" type="textarea" title="texto"
            @blur="saveContent" placeholder="content" />
          <ui-input v-if="selectedNode.data.columns" v-model="options.columns" type="textarea" title="columns"
            placeholder="columns" />
          <ui-input v-if="selectedNode.data.src" @change="onImageFile" title="file" placeholder="src" type="file"
            acepted="image/*" />
          <ui-input v-if="selectedNode.data.rows" v-model="options.rows" type="textarea" title="rows"
            placeholder="rows" />
          <section>
            <span>Style &amp; Layout</span>
            <ui-input v-model="options.class" title="CSS classes" placeholder="classes" />
            <div v-if="selectedNode.tag === 'p'" class="space-y-3 pt-2">
              <div>
                <label class=" block text-xs font-medium text-slate-600 mb-1">Font Weight</label>
                <div class="flex gap-1">
                  <button v-for="fw in fontWeights" :key="fw.value" :class="[
                    'flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors',
                    localFontWeight === fw.value
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300',
                  ]" @click.prevent="localFontWeight = fw.value; saveFontWeight()">
                    {{ fw.label }}
                  </button>
                </div>
              </div>

              <div>
                <label class="block text-xs font-medium text-slate-600 mb-1">Text Color</label>
                <div class="flex gap-2 items-center flex-wrap">
                  <button v-for="color in presetColors" :key="color.class" :class="[
                    'w-6 h-6 rounded-full border-2 transition-all',
                    localColor === color.class ? 'border-blue-500 scale-110' : 'border-transparent',
                    color.bg,
                  ]" @click.prevent="localColor = color.class; saveColor()" :title="color.label" />
                  <input type="color"
                    class="w-6 h-6 rounded-full border border-slate-200 cursor-pointer bg-transparent p-0"
                    title="Custom color" @change="(e) => console.log(e.target.value)" />
                </div>
              </div>
            </div>
          </section>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, computed } from "vue";
const store = templateStore();
const selectedElement = computed(() => store.selectedElement);
const selectedNode = computed(() => store.selectedNode);
const options = computed(() => store.options);
const saveDataOptions = store.saveDataOptions;
const deleteElement = store.deleteElement;
const localFontWeight = ref("");
const localColor = ref("");


function removeWeightClasses(cls: string): string {
  return cls.replace(/font-(light|normal|semibold|bold|extrabold)/g, "").trim();
}

function removeColorClasses(cls: string): string {
  return cls.replace(/text-[a-z]+-\d+/g, "").trim();
}
function saveContent() {
  if (!selectedNode.value) return;
  store.saveDataOptions()
}
function saveColor() {
  if (!selectedNode.value) return;
  let cls = removeColorClasses(options.value.class);
  if (localColor.value) cls = `${cls} ${localColor.value}`.trim();
  options.value.class = cls;
  store.saveDataOptions();
}
function saveFontWeight() {
  if (!selectedNode.value) return;
  let cls = removeWeightClasses(options.value.class);
  if (localFontWeight.value) cls = `${cls} ${localFontWeight.value}`.trim();
  options.value.class = cls;
  store.saveDataOptions();
}
async function onImageFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file || !selectedNode.value) return;
  options.value.src = file;
  store.saveDataOptions();
}

const formats = [
  { value: "default", label: "Default" },
  { value: "uppercase", label: "Uppercase" },
  { value: "currency", label: "Currency" },
  { value: "short-date", label: "Short Date" },
];

const fontWeights = [
  { value: "font-light", label: "L" },
  { value: "font-normal", label: "N" },
  { value: "font-bold", label: "B" },
];

const presetColors = [
  { class: "text-slate-900", bg: "bg-slate-900", label: "Black" },
  { class: "text-blue-600", bg: "bg-blue-600", label: "Blue" },
  { class: "text-indigo-600", bg: "bg-indigo-600", label: "Indigo" },
  { class: "text-green-600", bg: "bg-green-600", label: "Green" },
  { class: "text-yellow-600", bg: "bg-yellow-600", label: "Yellow" },
  { class: "text-red-600", bg: "bg-red-600", label: "Red" },

];

const handleKeyDown = (event) => {
  if (selectedElement.value && event.key === "Backspace") {
    const isInput = ["INPUT", "TEXTAREA"].includes(
      document.activeElement.tagName,
    );
    if (!isInput) {
      deleteElement();
    }
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
});
</script>
<style scoped>
.right-panel {
  width: 300px;
  min-width: 300px;
  flex-shrink: 0;
}
</style>
