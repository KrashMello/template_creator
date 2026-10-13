<template>
  <div class="right-panel flex flex-col h-full bg-white border-l border-slate-200 overflow-hidden">
    <div class="px-5 py-4 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
      <div class="min-w-0">
        <h2 class="text-sm font-bold text-slate-800">{{ t('editor.settings.title') }}</h2>
        <p class="mt-0.5 truncate text-[10px] uppercase tracking-wider text-slate-400">
          {{ selectedElement ? `${selectedElement.tagName} ${selectedNode.name}` : '—' }}
        </p>
      </div>
      <button v-if="selectedElement" @click="deleteElement"
        :title="t('editor.settings.delete')"
        class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50 transition-colors">
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
      <div class="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8"
          stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 9h6M9 12h6M9 15h4" />
        </svg>
      </div>
      <p class="max-w-[200px] text-sm leading-relaxed text-slate-400">{{ t('editor.settings.noSelection') }}</p>
    </div>

    <div id="options" v-else class="flex-1 overflow-y-auto">
      <form @submit.prevent="saveDataOptions" class="flex flex-col gap-4 px-5 py-4">
        <ui-input v-model="options.nodeName" type="text"
          :title="t('editor.settings.fields.nodeName')" :placeholder="selectedNode.name" :onInputt="saveContent" />
        <ui-input v-if="selectedNode.data.content" v-model="options.content" type="textarea"
          :title="t('editor.settings.fields.content')" @blur="saveContent" :placeholder="t('editor.settings.fields.content')" />
        <ui-input v-if="selectedNode.data.height != null" v-model="options.height" type="number"
          :title="t('editor.settings.fields.height')" :placeholder="t('editor.settings.fields.height')" :onInputt="saveContent" />
        <ui-input v-if="selectedNode.data.name" v-model="options.name" type="text"
          :title="t('editor.settings.fields.name')" :placeholder="t('editor.settings.fields.name')" :onInputt="saveContent" />
        <ui-input v-if="selectedNode.data.value != null" v-model="options.checkValue" type="checkbox"
          :title="t('editor.settings.fields.value')" :onChange="saveContent" />
        <ui-input v-if="selectedNode.data.columns" v-model="options.columns" type="textarea"
          :title="t('editor.settings.fields.columns')" :placeholder="t('editor.settings.fields.columns')" />
        <ui-input v-if="selectedNode.data.src" @change="onImageFile" :title="t('editor.settings.fields.file')"
          :placeholder="t('editor.settings.fields.file')" type="file" acepted="image/*" />
        <ui-input v-if="selectedNode.data.rows" v-model="options.rows" type="textarea"
          :title="t('editor.settings.fields.rows')" :placeholder="t('editor.settings.fields.rows')" />

        <section class="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
          <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {{ t('editor.settings.fields.styleLayout') }}
          </span>
          <div class="mt-3 space-y-3">
            <ui-input v-model="options.class" :title="t('editor.settings.fields.class')" placeholder="classes" />

            <div v-if="selectedNode.tag === 'p'" class="space-y-4 pt-1">
              <div>
                <label class="block text-xs font-medium text-slate-600 mb-1.5">{{ t('editor.settings.fields.fontWeight') }}</label>
                <div class="flex gap-1">
                  <button v-for="fw in fontWeights" :key="fw.value" :class="[
                    'flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40',
                    localFontWeight === fw.value
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300',
                  ]" @click.prevent="localFontWeight = fw.value; saveFontWeight()">
                    {{ fw.label }}
                  </button>
                </div>
              </div>

              <div>
                <label class="block text-xs font-medium text-slate-600 mb-1.5">{{ t('editor.settings.fields.textColor') }}</label>
                <div class="flex gap-2 items-center flex-wrap">
                  <button v-for="color in presetColors" :key="color.class" :class="[
                    'w-6 h-6 rounded-full border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40',
                    localColor === color.class ? 'border-blue-500 scale-110' : 'border-transparent hover:scale-110',
                    color.bg,
                  ]" @click.prevent="localColor = color.class; saveColor()" :title="t(`editor.settings.colors.${color.key}`)" />
                  <input type="color"
                    class="w-6 h-6 rounded-full border border-slate-200 cursor-pointer bg-transparent p-0"
                    :title="t('editor.settings.fields.customColor')"
                    @change="(e) => console.log(e.target.value)" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, computed } from "vue";
const store = templateStore();
const { t } = useI18n();
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

const fontWeights = [
  { value: "font-light", label: "L" },
  { value: "font-normal", label: "N" },
  { value: "font-bold", label: "B" },
];

const presetColors = [
  { key: "black", class: "text-slate-900", bg: "bg-slate-900" },
  { key: "blue", class: "text-blue-600", bg: "bg-blue-600" },
  { key: "indigo", class: "text-indigo-600", bg: "bg-indigo-600" },
  { key: "green", class: "text-green-600", bg: "bg-green-600" },
  { key: "yellow", class: "text-yellow-600", bg: "bg-yellow-600" },
  { key: "red", class: "text-red-600", bg: "bg-red-600" },
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
