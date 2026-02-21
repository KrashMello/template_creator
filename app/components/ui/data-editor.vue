<template>
  <ClientOnly>
    <ui-code-editor
      v-model="dataJson"
      language="json"
      :height="height"
    />
    <template #fallback>
      <textarea
        :value="dataJson"
        @input="dataJson = ($event.target as HTMLTextAreaElement).value"
        class="w-full h-full font-mono text-sm border border-slate-200 rounded-lg p-3 resize-none focus:outline-none"
        spellcheck="false"
      />
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { templateStore } from "../../stores/templateStore";

withDefaults(defineProps<{ height?: string }>(), { height: "400px" });

const store = templateStore();

const dataJson = computed({
  get() {
    return JSON.stringify(store.data, null, 2);
  },
  set(val: string) {
    try {
      store.data = JSON.parse(val);
    } catch {}
  },
});
</script>
