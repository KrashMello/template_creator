<template>
  <div class="right-panel flex flex-col h-full bg-surface border-l border-content/10 overflow-hidden">
    <div class="h-14 px-5 border-b border-content/10 flex items-center justify-between flex-shrink-0">
      <div class="min-w-0">
        <h2 class="text-sm font-bold text-content">{{ t('editor.settings.title') }}</h2>
        <p class="mt-0.5 truncate text-[10px] uppercase tracking-wider text-content-muted">
          {{ selectedElement ? `${selectedElement.tagName} ${selectedNode.name}` : '—' }}
        </p>
      </div>
      <UButton
        v-if="selectedElement"
        icon="i-lucide-trash-2"
        color="error"
        variant="ghost"
        square
        size="sm"
        :title="t('editor.settings.delete')"
        @click="deleteElement"
      />
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
              <ui-input v-model="store.page.margins.top" type="number"
                :title="t('editor.doc.margins.top')" />
              <ui-input v-model="store.page.margins.bottom" type="number"
                :title="t('editor.doc.margins.bottom')" />
              <ui-input v-model="store.page.margins.left" type="number"
                :title="t('editor.doc.margins.left')" />
              <ui-input v-model="store.page.margins.right" type="number"
                :title="t('editor.doc.margins.right')" />
            </div>
          </div>

          <div>
            <span class="block text-xs font-medium text-content-muted mb-1.5">{{ t('editor.doc.format') }}</span>
            <div class="grid grid-cols-4 gap-1">
              <UButton v-for="f in pageFormats" :key="f" size="xs" block
                :color="store.page.format === f ? 'primary' : 'neutral'"
                :variant="store.page.format === f ? 'solid' : 'outline'"
                @click.prevent="store.page.format = f">
                {{ t(`editor.doc.formats.${f}`) }}
              </UButton>
            </div>
          </div>

          <div>
            <span class="block text-xs font-medium text-content-muted mb-1.5">{{ t('editor.doc.orientation') }}</span>
            <div class="grid grid-cols-2 gap-1">
              <UButton v-for="o in pageOrientations" :key="o" size="xs" block
                :color="store.page.orientation === o ? 'primary' : 'neutral'"
                :variant="store.page.orientation === o ? 'solid' : 'outline'"
                @click.prevent="store.page.orientation = o">
                {{ t(`editor.doc.orientations.${o}`) }}
              </UButton>
            </div>
          </div>

          <div class="space-y-1.5 pt-1">
            <UCheckbox
              :model-value="store.page.headerRepeat"
              size="sm"
              :label="t('editor.doc.headerRepeat')"
              @update:model-value="store.page.headerRepeat = $event"
            />
            <UCheckbox
              :model-value="store.page.footerRepeat"
              size="sm"
              :label="t('editor.doc.footerRepeat')"
              @update:model-value="store.page.footerRepeat = $event"
            />
            <p class="text-[10px] leading-snug text-content-muted">{{ t('editor.doc.onlyFirstHint') }}</p>
          </div>
        </div>
      </section>

      <div v-if="!selectedElement" class="px-6 py-16">
        <UEmpty icon="i-lucide-mouse-pointer-2" :title="t('editor.settings.noSelection')" />
      </div>

      <form v-else id="options" @submit.prevent="saveDataOptions" class="flex flex-col gap-4 px-5 py-4">
        <ui-input v-model="options.nodeName" type="text"
          :title="t('editor.settings.fields.nodeName')" :placeholder="selectedNode.name" @update:model-value="saveContent" />
        <ui-input v-if="selectedNode.data.content" v-model="options.content" type="textarea"
          :title="t('editor.settings.fields.content')" @blur="saveContent" :placeholder="t('editor.settings.fields.content')" />
        <ui-input v-if="selectedNode.data.height != null" v-model="options.height" type="number"
          :title="t('editor.settings.fields.height')" :placeholder="t('editor.settings.fields.height')" @update:model-value="saveContent" />
        <ui-input v-if="selectedNode.data.name" v-model="options.name" type="text"
          :title="t('editor.settings.fields.name')" :placeholder="t('editor.settings.fields.name')" @update:model-value="saveContent" />
        <ui-input v-if="selectedNode.data.value != null" v-model="options.checkValue" type="checkbox"
          :title="t('editor.settings.fields.value')" @update:model-value="saveContent" />
        <ui-input v-if="selectedNode.data.columns" v-model="options.columns" type="textarea"
          :title="t('editor.settings.fields.columns')" :placeholder="t('editor.settings.fields.columns')" />
        <ui-input v-if="selectedNode.data.src" @change="onImageFile" :title="t('editor.settings.fields.file')"
          :placeholder="t('editor.settings.fields.file')" type="file" accept="image/*" />
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
                  <UButton v-for="fw in fontWeights" :key="fw.value" size="xs" block
                    :color="localFontWeight === fw.value ? 'primary' : 'neutral'"
                    :variant="localFontWeight === fw.value ? 'solid' : 'outline'"
                    @click.prevent="localFontWeight = fw.value; saveFontWeight()">
                    {{ fw.label }}
                  </UButton>
                </div>
              </div>

              <div>
                <label class="block text-xs font-medium text-content-muted mb-1.5">{{ t('editor.settings.fields.textColor') }}</label>
                <div class="flex gap-2 items-center flex-wrap">
                  <!-- Colores de papel: clases Tailwind reales, no dependen del tema de la app -->
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

const pageFormats: Array<"letter" | "legal" | "oficio" | "a4"> = ["letter", "legal", "oficio", "a4"];
const pageOrientations: Array<"portrait" | "landscape"> = ["portrait", "landscape"];

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
    const el = document.activeElement;
    // UCheckbox y el diálogo de plantillas renderizan botones/dialogs (Reka),
    // no INPUT/TEXTAREA: sin esta guarda, Backspace borraría el elemento.
    const isInput = ["INPUT", "TEXTAREA"].includes(el.tagName)
      || !!el.closest?.('[role="dialog"], [role="checkbox"], [role="menu"], [role="listbox"]')
      || el.isContentEditable;
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
