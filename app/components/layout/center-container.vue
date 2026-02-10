<template>
  <div class="col-span-6 flex flex-col gap-2 h-full relative">
    <!-- Compact Toolbar -->
    <div
      class="flex items-center justify-between px-3 py-1.5 bg-card border border-border rounded-lg shadow-sm"
    >
      <div class="flex items-center gap-1">
        <ui-button
          @click="selectView(1)"
          :variant="selectedView === 1 ? 'secondary' : 'ghost'"
          size="sm"
          class="h-7 w-7 p-0"
          title="Preview"
        >
          <svg-eye-open class="w-3.5 h-3.5" />
        </ui-button>
        <div class="w-px h-3 bg-border mx-0.5"></div>
        <ui-button
          @click="selectView(2)"
          :variant="selectedView === 2 ? 'secondary' : 'ghost'"
          size="sm"
          class="h-7 w-7 p-0"
          title="Schema JSON"
        >
          <svg-code class="w-3.5 h-3.5" />
        </ui-button>
        <ui-button
          @click="selectView(3)"
          :variant="selectedView === 3 ? 'secondary' : 'ghost'"
          size="sm"
          class="h-7 w-7 p-0"
          title="Custom CSS"
        >
          <svg-css class="w-3.5 h-3.5" />
        </ui-button>
        <ui-button
          @click="selectView(4)"
          :variant="selectedView === 4 ? 'secondary' : 'ghost'"
          size="sm"
          class="h-7 px-2 font-mono text-[10px]"
          title="Global Data"
        >
          { data }
        </ui-button>
      </div>

      <div class="flex items-center gap-1.5">
        <!-- Dark Mode Toggle -->
        <ui-button
          @click="toggleDarkMode"
          variant="ghost"
          size="sm"
          class="h-7 w-7 p-0"
          title="Toggle Dark Mode"
        >
          <svg
            v-if="isDark"
            xmlns="http://www.w3.org/2000/svg"
            class="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            class="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        </ui-button>

        <div class="w-px h-3 bg-border"></div>

        <ui-button
          @click="generateDocument"
          variant="default"
          size="sm"
          class="h-7 gap-1.5 text-[11px] px-2.5"
        >
          <span>Export PDF</span>
          <svg-download class="w-3 h-3" />
        </ui-button>
      </div>
    </div>

    <!-- Main Content Area - Maximized -->
    <div
      class="flex-1 overflow-hidden relative rounded-lg border-2 border-dotted transition-all duration-300"
      :class="
        isDragging
          ? 'border-foreground/30 bg-muted/5'
          : 'border-border/40 bg-white dark:bg-card'
      "
    >
      <!-- Preview View - Pure White Background -->
      <div
        v-if="selectedView === 1"
        class="w-full h-full overflow-y-auto p-6 bg-white dark:bg-card"
        @dragenter.prevent="onDragEnter"
        @dragleave.prevent="onDragLeave"
        @dragover.prevent
        @drop="handleDrop"
      >
        <!-- Empty State Placeholder -->
        <div
          v-if="!previewHtml || previewHtml.trim() === ''"
          class="flex flex-col items-center justify-center h-full text-muted-foreground"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-16 h-16 mb-4 opacity-20"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p class="text-sm font-medium mb-1">Drag components here to start</p>
          <p class="text-xs opacity-60">
            Select a component from the left sidebar and drag it here
          </p>
        </div>

        <!-- Preview Content -->
        <div v-else id="preview-content" v-html="previewHtml"></div>
      </div>

      <!-- Schema View -->
      <div
        v-if="selectedView === 2"
        class="w-full h-full flex flex-col bg-card"
      >
        <div class="px-4 py-2 border-b border-border bg-muted/20">
          <h2
            class="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase"
          >
            Schema Structure
          </h2>
        </div>
        <pre
          class="flex-1 p-4 overflow-auto text-xs font-mono text-foreground/80 leading-relaxed custom-scrollbar"
          >{{
            schemaJson || '{\n  "type": "container",\n  "children": []\n}'
          }}</pre
        >
      </div>

      <!-- Editors -->
      <div v-if="selectedView === 3" class="w-full h-full">
        <ui-style-editor />
      </div>
      <div v-if="selectedView === 4" class="w-full h-full">
        <ui-data-editor />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { templateStore } from "@/stores/templateStore";

const store = templateStore();
const previewHtml = computed(() => store.previewHtml);
const schemaJson = computed(() => store.schemaJson);
const onDrop = store.onDrop;
const generateDocument = store.generateDocument;

const selectedView = ref(1);
const isDragging = ref(false);
const isDark = ref(false);

// Check initial dark mode state
onMounted(() => {
  isDark.value = document.documentElement.classList.contains("dark");
});

const selectView = (opt) => {
  selectedView.value = opt;
};

const toggleDarkMode = () => {
  isDark.value = !isDark.value;
  document.documentElement.classList.toggle("dark");
};

// Drag Handlers
const onDragEnter = (event) => {
  isDragging.value = true;
};

const onDragLeave = (event) => {
  if (!event.currentTarget.contains(event.relatedTarget)) {
    isDragging.value = false;
  }
};

const handleDrop = (event) => {
  isDragging.value = false;
  onDrop(event);
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: hsl(var(--muted-foreground) / 0.2);
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--muted-foreground) / 0.4);
}
</style>
