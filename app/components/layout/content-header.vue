<template>
  <ol class="flex flex-row gap-2 items-center w-full bg-white shadow-sm rounded-sm p-2">
    <li>
      <ui-button @click="$emit('select', 1)">
        <svg-eye-open />
      </ui-button>
    </li>
    <li>
      <ui-button @click="$emit('select', 2)">
        <svg-code />
      </ui-button>
    </li>
    <li>
      <ui-button @click="$emit('select', 3)">
        <svg-css class="size-4" />
      </ui-button>
    </li>
    <li>
      <ui-button @click="$emit('select', 4)">
        <svg-data class="size-4" />
      </ui-button>
    </li>
    <li>
      <button @click="store.undo()" :disabled="!store.history.length"
        class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-colors"
        title="Undo">
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 7v6h6" />
          <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
        </svg>
      </button>
    </li>
    <li>
      <button @click="store.redo()" :disabled="!store.redoStack.length"
        class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-colors"
        title="Redo">
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 7v6h-6" />
          <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
        </svg>
      </button>
    </li>
    <li class="ml-auto">
      <ui-button @click="$emit('export')">
        <span class="text-xs"> Exportar PDF </span>
        <svg-download class="size-5" />
      </ui-button>
    </li>

  </ol>
</template>
<script setup lang="ts">
import { templateStore } from "../../stores/templateStore";

defineEmits(["select", "export"]);
const store = templateStore();
</script>
