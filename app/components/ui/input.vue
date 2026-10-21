<template>
  <div class="flex flex-col gap-2">
    <!-- Checkbox: UCheckbox ya trae label; el resto de tipos llevan label propio -->
    <UCheckbox
      v-if="props.type === 'checkbox'"
      :model-value="props.modelValue === true || props.modelValue === 'true'"
      :label="props.title"
      size="sm"
      @update:model-value="onCheck"
    />

    <template v-else>
      <label class="block text-xs font-medium text-content-muted mb-1" :for="inputId">{{ props.title }}</label>
      <UTextarea
        v-if="props.type === 'textarea'"
        :id="inputId"
        v-bind="$attrs"
        :model-value="props.modelValue"
        :placeholder="props.placeholder"
        :rows="3"
        size="md"
        class="w-full"
        @update:model-value="onTextareaUpdate"
        @keydown="onKeyDown"
        @blur="onBlur"
      />
      <UInput
        v-else-if="props.type !== 'file'"
        :id="inputId"
        :type="props.type"
        :model-value="props.modelValue"
        :placeholder="props.placeholder"
        size="md"
        class="w-full"
        @update:model-value="onUpdate"
        @change="props.onChange"
        @blur="onBlur"
      />
      <input
        v-else
        type="file"
        :id="inputId"
        :accept="props.accept"
        :placeholder="props.placeholder"
        class="block w-full text-xs text-content-muted file:me-3 file:cursor-pointer file:rounded-lg file:border file:border-content/10 file:bg-surface file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-content hover:file:border-content/25"
        @change="props.onChange"
      />
    </template>

    <Teleport to="body">
      <div v-if="showDropdown && filteredKeys.length" :style="dropdownStyle"
        class="fixed z-[9999] bg-surface border border-content/10 rounded-xl shadow-2xl overflow-hidden w-56">
        <div class="px-3 py-2 border-b border-content/10 bg-surface-alt">
          <span class="text-[10px] font-semibold uppercase tracking-wider text-content-muted">{{ t('editor.views.variables') }}</span>
        </div>
        <ul class="max-h-48 overflow-y-auto py-1">
          <li v-for="(key, i) in filteredKeys" :key="key" :class="[
            'flex items-center gap-2 px-3 py-2 cursor-pointer text-sm transition-colors',
            i === activeIndex ? 'bg-accent/10 text-accent' : 'text-content hover:bg-surface-alt',
          ]" @mousedown.prevent="selectKey(key)">
            <span class="text-accent/80 font-mono text-xs">&#123;&#123;</span>
            <span class="font-mono font-medium">{{ key }}</span>
            <span class="text-accent/80 font-mono text-xs">&#125;&#125;</span>
          </li>
        </ul>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { templateStore } from "../../stores/templateStore";

const props = withDefaults(
  defineProps<{
    title?: string;
    /** text | textarea | number | checkbox | file (los únicos usados por el editor) */
    type?: string;
    id?: string;
    placeholder?: string;
    modelValue?: string | number | boolean;
    /** Acepta solo para type="file" (antes había un prop "acepted" con typo que nunca funcionó) */
    accept?: string;
    onChange?: (e: Event) => void;
    onBlur?: (e: FocusEvent) => void;
  }>(),
  {
    title: "",
    type: "text",
    id: "",
    placeholder: "",
    modelValue: "",
    accept: "",
    onChange: () => {},
    onBlur: () => {},
  },
);

const emit = defineEmits(["update:modelValue"]);

const activeIndex = ref(0);
const showDropdown = ref(false);
const dropdownStyle = ref({});
const store = templateStore();
const { t } = useI18n();
// Id único y estable entre servidor y cliente.
const uid = useId();
const inputId = computed(() => props.id || `ui-input-${uid}`);

/** Los campos numéricos emiten Number (equivalente al antiguo v-model.number). */
function onUpdate(value: string | number) {
  emit("update:modelValue", props.type === "number" ? Number(value) : value);
}

function onCheck(checked: boolean) {
  emit("update:modelValue", checked);
}

function updateDropdownPosition() {
  const el = document.getElementById(inputId.value);
  if (!el) return;
  const rect = el.getBoundingClientRect();
  dropdownStyle.value = {
    top: `${rect.bottom + 4}px`,
    left: `${rect.left}px`,
  };
}
const filteredKeys = computed(() => {
  const val = props.modelValue ?? "";
  const triggerIdx = val.lastIndexOf("{{");
  if (triggerIdx === -1) return store.dataKeys;
  const prefix = val.slice(triggerIdx + 2);
  if (!prefix) return store.dataKeys;
  return store.dataKeys.filter((k) => k.toLowerCase().includes(prefix.toLowerCase()));
});

function onTextareaUpdate(val: string) {
  emit("update:modelValue", val);

  const triggerIdx = val.lastIndexOf("{{");
  if (triggerIdx !== -1) {
    showDropdown.value = true;
    activeIndex.value = 0;
    nextTick(updateDropdownPosition);
  } else {
    showDropdown.value = false;
  }
}
function selectKey(key: string) {
  const val = props.modelValue ?? "";
  const triggerIdx = val.lastIndexOf("{{");
  const before = triggerIdx !== -1 ? val.slice(0, triggerIdx) : val;
  emit("update:modelValue", `${before}{{${key}}}`);
  showDropdown.value = false;
  nextTick(() => document.getElementById(inputId.value)?.focus());
}
function onBlur(e: FocusEvent) {
  setTimeout(() => {
    showDropdown.value = false;
  }, 150);
  // Guardia declarada como prop por los call sites (p. ej. right-bar @blur)
  props.onBlur(e);
}
function onKeyDown(e: KeyboardEvent) {
  if (!showDropdown.value) return;

  if (e.key === "ArrowDown") {
    e.preventDefault();
    activeIndex.value = Math.min(activeIndex.value + 1, filteredKeys.value.length - 1);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    activeIndex.value = Math.max(activeIndex.value - 1, 0);
  } else if (e.key === "Enter" && filteredKeys.value.length) {
    e.preventDefault();
    selectKey(filteredKeys.value[activeIndex.value]);
  } else if (e.key === "Escape") {
    showDropdown.value = false;
  }
}
</script>
