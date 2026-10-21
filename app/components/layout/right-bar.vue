<template>
  <div class="right-panel flex flex-col h-full bg-surface border-l border-content/10 overflow-hidden">
    <div class="px-5 py-4 border-b border-content/10 flex items-center justify-between flex-shrink-0">
      <div class="min-w-0">
        <h2 class="text-sm font-bold text-content">{{ t('editor.settings.title') }}</h2>
        <p class="mt-0.5 truncate text-[10px] uppercase tracking-wider text-content-muted">
          {{ selectedElement ? `${selectedElement.tagName} ${selectedNode.name}` : '—' }}
        </p>
      </div>
      <button v-if="selectedElement" @click="deleteElement"
        :title="t('editor.settings.delete')"
        class="w-8 h-8 rounded-lg flex items-center justify-center text-content-muted hover:bg-danger/10 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/50 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6M14 11v6" />
          <path d="M9 6V4h6v2" />
        </svg>
      </button>
    </div>

    <!-- Ajustes de documento: siempre visibles, aunque no haya selección -->
    <div class="flex-1 overflow-y-auto">
      <section class="border-b border-content/10 bg-surface-alt/60 px-5 py-4">
        <span class="text-[10px] font-bold uppercase tracking-widest text-content-muted">
          {{ t('editor.doc.title') }}
        </span>

        <div class="mt-3 space-y-3">
          <div>
            <span class="block text-xs font-medium text-content-muted mb-1.5">
              {{ t('editor.doc.margins.title') }}
            </span>
            <div class="grid grid-cols-2 gap-x-3 gap-y-1">
              <ui-input v-model.number="store.page.margins.top" type="number"
                :title="t('editor.doc.margins.top')" />
              <ui-input v-model.number="store.page.margins.bottom" type="number"
                :title="t('editor.doc.margins.bottom')" />
              <ui-input v-model.number="store.page.margins.left" type="number"
                :title="t('editor.doc.margins.left')" />
              <ui-input v-model.number="store.page.margins.right" type="number"
                :title="t('editor.doc.margins.right')" />
            </div>
          </div>

          <div>
            <span class="block text-xs font-medium text-content-muted mb-1.5">{{ t('editor.doc.format') }}</span>
            <div class="grid grid-cols-4 gap-1">
              <button v-for="f in pageFormats" :key="f" :class="segmentClass(store.page.format === f)"
                @click.prevent="store.page.format = f">
                {{ t(`editor.doc.formats.${f}`) }}
              </button>
            </div>
          </div>

          <div>
            <span class="block text-xs font-medium text-content-muted mb-1.5">{{ t('editor.doc.orientation') }}</span>
            <div class="grid grid-cols-2 gap-1">
              <button v-for="o in pageOrientations" :key="o" :class="segmentClass(store.page.orientation === o)"
                @click.prevent="store.page.orientation = o">
                {{ t(`editor.doc.orientations.${o}`) }}
              </button>
            </div>
          </div>

          <div class="space-y-1.5 pt-1">
            <label class="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" class="mt-0.5 size-4 shrink-0 accent-primary cursor-pointer"
                :checked="store.page.headerRepeat"
                @change="store.page.headerRepeat = $event.target.checked" />
              <span class="text-xs font-medium text-content-muted">{{ t('editor.doc.headerRepeat') }}</span>
            </label>
            <label class="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" class="mt-0.5 size-4 shrink-0 accent-primary cursor-pointer"
                :checked="store.page.footerRepeat"
                @change="store.page.footerRepeat = $event.target.checked" />
              <span class="text-xs font-medium text-content-muted">{{ t('editor.doc.footerRepeat') }}</span>
            </label>
            <p class="text-[10px] leading-snug text-content-muted">{{ t('editor.doc.onlyFirstHint') }}</p>
          </div>
        </div>
      </section>

      <div v-if="!selectedElement" class="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
        <div class="w-14 h-14 rounded-2xl bg-surface-alt flex items-center justify-center text-content-muted">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 9h6M9 12h6M9 15h4" />
          </svg>
        </div>
        <p class="max-w-[200px] text-sm leading-relaxed text-content-muted">{{ t('editor.settings.noSelection') }}</p>
      </div>

      <form v-else id="options" @submit.prevent="saveDataOptions" class="flex flex-col gap-4 px-5 py-4">
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

        <section class="rounded-xl border border-content/10 bg-surface-alt/60 p-4">
          <span class="text-[10px] font-bold uppercase tracking-widest text-content-muted">
            {{ t('editor.settings.fields.styleLayout') }}
          </span>
          <div class="mt-3 space-y-3">
            <ui-input v-model="options.class" :title="t('editor.settings.fields.class')" placeholder="classes" />

            <div v-if="selectedNode.tag === 'p'" class="space-y-4 pt-1">
              <div>
                <label class="block text-xs font-medium text-content-muted mb-1.5">{{ t('editor.settings.fields.fontWeight') }}</label>
                <div class="flex gap-1">
                  <button v-for="fw in fontWeights" :key="fw.value" :class="[
                    'flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40',
                    localFontWeight === fw.value
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-surface text-content-muted border-content/10 hover:border-content/25',
                  ]" @click.prevent="localFontWeight = fw.value; saveFontWeight()">
                    {{ fw.label }}
                  </button>
                </div>
              </div>

              <div>
                <label class="block text-xs font-medium text-content-muted mb-1.5">{{ t('editor.settings.fields.textColor') }}</label>
                <div class="flex gap-2 items-center flex-wrap">
                  <button v-for="color in presetColors" :key="color.class" :class="[
                    'w-6 h-6 rounded-full border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40',
                    localColor === color.class ? 'border-primary scale-110' : 'border-transparent hover:scale-110',
                    color.bg,
                  ]" @click.prevent="localColor = color.class; saveColor()" :title="t(`editor.settings.colors.${color.key}`)" />
                  <input type="color"
                    class="w-6 h-6 rounded-full border border-content/10 cursor-pointer bg-transparent p-0"
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

/** Botones segmentados de la tarjeta Documento (formato y orientación). */
const pageFormats: Array<"letter" | "legal" | "oficio" | "a4"> = ["letter", "legal", "oficio", "a4"];
const pageOrientations: Array<"portrait" | "landscape"> = ["portrait", "landscape"];
function segmentClass(active: boolean) {
  return [
    "flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
    active
      ? "bg-primary text-primary-foreground border-primary shadow-sm"
      : "bg-surface text-content-muted border-content/10 hover:border-content/25",
  ];
}

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
