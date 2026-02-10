<template>
  <div class="flex flex-col gap-1.5 w-full">
    <label
      v-if="props.title"
      :for="id"
      class="text-xs font-medium text-foreground ml-0.5"
    >
      {{ props.title }}
    </label>

    <textarea
      v-if="props.type === 'textarea'"
      :id="id"
      v-model="proxyValue"
      :class="inputClasses"
      :placeholder="props.placeholder"
      rows="3"
    ></textarea>

    <input
      v-else-if="props.type !== 'file'"
      :type="props.type"
      :id="id"
      v-model="proxyValue"
      :class="inputClasses"
      :placeholder="props.placeholder"
    />

    <input
      v-else
      type="file"
      :accept="props.acepted"
      :id="id"
      @change="handleChange"
      class="block w-full text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
    />
  </div>
</template>

<script setup>
const props = defineProps({
  title: String,
  type: {
    type: String,
    default: "text",
  },
  acepted: {
    type: String,
    default: "",
  },
  id: {
    type: String,
    default: () => crypto.randomUUID(),
  },
  placeholder: String,
  modelValue: [String, Number],
});

const emit = defineEmits(["update:modelValue", "change"]);

const proxyValue = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const handleChange = (e) => {
  emit("change", e);
};

const inputClasses = `
  flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background 
  file:border-0 file:bg-transparent file:text-sm file:font-medium 
  placeholder:text-muted-foreground 
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 
  disabled:cursor-not-allowed disabled:opacity-50
  transition-all duration-200
  font-mono text-xs
`;
</script>
