<template>
  <div class="flex flex-col gap-4 h-full">
    <div class="flex items-center justify-between">
      <h2
        class="text-xs font-semibold tracking-wider text-muted-foreground uppercase"
      >
        Global Data
      </h2>
      <div
        class="px-2 py-1 rounded bg-muted text-[10px] font-mono text-muted-foreground"
      >
        data.json
      </div>
    </div>
    <div
      class="flex-1 relative border border-border rounded-xl overflow-hidden bg-card shadow-sm"
    >
      <textarea
        v-model="data"
        class="w-full h-full p-4 font-mono text-xs leading-relaxed text-foreground bg-transparent resize-none focus:outline-none selection:bg-primary/20"
        spellcheck="false"
        placeholder='{ "key": "value" }'
      />
    </div>
  </div>
</template>

<script setup>
import { templateStore } from "../../stores/templateStore";

const store = templateStore();

const data = computed({
  get: () => JSON.stringify(store.data, null, 2),
  set: (newValue) => {
    try {
      store.data = JSON.parse(newValue);
    } catch (e) {
      // Handle or ignore JSON parse error while typing
    }
  },
});
</script>
