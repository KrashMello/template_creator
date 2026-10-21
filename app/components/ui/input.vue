<template>
  <div class="flex flex-col gap-2">
    <label class=" block text-xs font-medium text-content-muted mb-1" :for="inputId">{{ props.title }}</label>
    <div v-if="props.type === 'textarea'" class="relative">
      <!-- <textarea :id="inputId" v-model="proxyValue" :class="CLASS" :placeholder="props.placeholder"></textarea> -->
      <textarea ref="inputRef" :id="inputId" v-bind="$attrs" :value="props.modelValue" @input="onInput" @keydown="onKeyDown"
        @blur="onBlur" :class="`${CLASS} ${$attrs.class}`" />
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
    <input v-else-if="props.type !== 'file'" :type="props.type" :id="inputId" v-model="proxyValue" :class="CLASS"
      @change="props.onChange" @blur="props.onBlur" @input="props.onInputt" :placeholder="props.placeholder" />
    <input v-else :type="props.type" :acepted="props.acepted" :id="inputId" @change="props.onChange" :class="CLASS"
      :placeholder="props.placeholder" />
  </div>
</template>

<script setup lang="ts">
import { templateStore } from "../../stores/templateStore";
const CLASS =
  "w-full px-3 py-2 text-sm border border-content/10 rounded-lg bg-surface transition-colors hover:border-content/25 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"

const emit = defineEmits(["update:modelValue"]);
const activeIndex = ref(0);
const showDropdown = ref(false);
const dropdownStyle = ref({});
const inputRef = ref<HTMLInputElement | null>(null);
const store = templateStore();
const { t } = useI18n();
// Id único y estable entre servidor y cliente (el randomUUID del `default`
// no lo era: rompía el hidratación y colisionaba entre instancias).
const uid = useId();
const inputId = computed(() => props.id || `ui-input-${uid}`);

const proxyValue = computed({
  get() {
    return props.modelValue;
  },
  set(newValue) {
    if (props.type === 'checkbox')
      newValue = newValue ? 'true' : 'false'
    emit("update:modelValue", newValue);
  },
});

const props = defineProps({
  title: {
    type: String,
    default: "input",
  },
  type: {
    type: String,
    default: "text",
  },
  acepted: {
    type: String,
    default: "",
  },
  id: {
    // Opcional: si no se pasa, se genera uno por instancia abajo. El `default`
    // de defineProps se evalúa una sola vez por definición de componente, así
    // que todos los inputs de la página compartían id y los `<label for>`
    // apuntaban todos al primero.
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "placeholder",
  },
  modelValue: {
    // `v-model.number` (inputs numéricos, p. ej. los márgenes) emite Number.
    type: [String, Number],
    default: "",
  },
  onChange: {
    type: Function,
    default: () => {
      return;
    },
  },
  onBluur: {
    type: Function,
    default: () => {
      return;
    },
  },
  onInputt: { type: Function, default: () => { return; } },
});

function updateDropdownPosition() {
  if (!inputRef.value) return;
  const rect = inputRef.value.getBoundingClientRect();
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

function onInput(e: Event) {
  const val = (e.target as HTMLInputElement).value;
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
  nextTick(() => inputRef.value?.focus());
}
function onBlur() {
  setTimeout(() => {
    showDropdown.value = false;
  }, 150);
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
