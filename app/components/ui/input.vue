<template>
  <div class="flex flex-col gap-2">
    <label :for="props.id">{{ props.title }}</label>
    <textarea
      v-if="props.type === 'textarea'"
      :id="props.id"
      v-model="proxyValue"
      :class="CLASS"
      :placeholder="props.placeholder"
    ></textarea>
    <input
      v-else-if="props.type !== 'file'"
      :type="props.type"
      :id="props.id"
      v-model="proxyValue"
      :class="CLASS"
      :placeholder="props.placeholder"
    />
    <input
      v-else
      :type="props.type"
      :acepted="props.acepted"
      :id="props.id"
      @change="props.onChange"
      :class="CLASS"
      :placeholder="props.placeholder"
    />
  </div>
</template>

<script setup>
const CLASS =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm " +
  "transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium " +
  "placeholder:text-muted-foreground " +
  "focus-visible:outline-none" +
  "disabled:cursor-not-allowed disabled:opacity-50";

const emit = defineEmits(["update:modelValue"]);

const proxyValue = computed({
  get() {
    return props.modelValue;
  },
  set(newValue) {
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
    type: String,
    default: crypto.randomUUID().split("-").join(""),
  },
  placeholder: {
    type: String,
    default: "placeholder",
  },
  modelValue: {
    type: String,
    default: "",
  },
  onChange: {
    type: Function,
    default: () => {
      return;
    },
  },
});
</script>
