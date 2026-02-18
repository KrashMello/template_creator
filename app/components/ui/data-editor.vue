<template>
  <div
    class="flex flex-col gap-2 h-[84dvh] p-2 rounded-lg shadow-sm border-2 border-dashed border-slate-100"
  >
    <h2 class="text-xl font-bold text-slate-800">Data</h2>
    <div class="h-full gap-2">
      <textarea
        v-model="data"
        :class="`w-full h-full font-mono text-sm border-2 border-slate-200 border-dashed text-slate-700  rounded-md p-3 focus:outline-none focus:ring-0 resize-none`"
        spellcheck="false"
      />
    </div>
  </div>
</template>

<script setup>
import { templateStore } from "../../stores/templateStore";
const data = computed({
  get() {
    return JSON.stringify(templateStore().data);
  },
  set(newValue) {
    templateStore().data = JSON.parse(newValue);
  },
});
</script>
