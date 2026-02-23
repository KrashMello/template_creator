<template>
  <div class="right-panel flex flex-col h-full bg-white border-l border-slate-200 overflow-hidden">
    <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
      <div>
        <h2 class="text-sm font-bold text-slate-800">Component Settings</h2>
        <p class="text-[10px] uppercase tracking-wider text-slate-400 mt-0.5">
          {{ selectedElement ? `${selectedElement.tagName} ${selectedNode.name}` : 'No selection' }}
        </p>
      </div>
      <button v-if="selectedElement" @click="deleteElement"
        class="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
        title="Delete component">
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
      <div class="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#94a3b8"
          stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 9h6M9 12h6M9 15h4" />
        </svg>
      </div>
      <p class="text-sm text-slate-400">Select a component on the canvas to edit its properties</p>
    </div>
    <div id="options" v-else class="flex-1">
      <form @submit.prevent="saveDataOptions" class="h-full flex flex-col gap-2">
        <div class="flex-1 px-5">
          <ui-input v-model="options.class" title="CSS classes" placeholder="classes" />
          <ui-input v-if="selectedNode.data.content" v-model="options.content" type="textarea" title="texto"
            placeholder="content" />
          <ui-input v-if="selectedNode.data.columns" v-model="options.columns" type="textarea" title="columns"
            placeholder="columns" />
          <ui-input v-if="selectedNode.data.src" @change="options.src = $event.target.files[0]" title="file"
            placeholder="src" type="file" acepted="image/*" />
          <ui-input v-if="selectedNode.data.rows" v-model="options.rows" type="textarea" title="rows"
            placeholder="rows" />
        </div>
        <div class="border-slate-100 border-t pt-3 flex flex-shrink-0 gap-2">
          <ui-button class="flex-1" type="submit">Guardar</ui-button>
          <ui-button class="flex-1 bg-red-500 hover:bg-red-700 text-white font-bold p-2 rounded-lg"
            @click="deleteElement">cancel</ui-button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, computed } from "vue";

const selectedElement = computed(() => templateStore().selectedElement);
const selectedNode = computed(() => templateStore().selectedNode);
const options = computed(() => templateStore().options);
const saveDataOptions = templateStore().saveDataOptions;
const deleteElement = templateStore().deleteElement;

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
