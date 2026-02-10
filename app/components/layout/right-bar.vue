<template>
  <div
    class="col-span-3 bg-card border-l border-border p-6 rounded-r-none h-full overflow-y-auto transition-colors duration-300"
  >
    <div id="options" class="flex flex-col gap-6 h-full">
      <div class="flex items-center justify-between">
        <h2
          class="text-xs font-semibold tracking-wider text-muted-foreground uppercase"
        >
          Propierties
        </h2>
        <div
          v-if="selectedElement"
          class="px-2 py-1 rounded bg-muted text-[10px] font-mono text-muted-foreground"
        >
          {{ selectedElement.tagName.toLowerCase() }}#{{
            selectedElement.id.slice(0, 6)
          }}
        </div>
      </div>

      <div
        v-if="!selectedElement"
        class="flex flex-col items-center justify-center flex-1 text-muted-foreground gap-2"
      >
        <svg-cursor-click class="w-8 h-8 opacity-20" />
        <span class="text-sm">Select an element to edit</span>
      </div>

      <form
        @submit.prevent="saveDataOptions"
        v-if="selectedElement"
        class="flex flex-col gap-4"
      >
        <div class="space-y-4">
          <ui-input
            v-model="options.class"
            title="Classes"
            placeholder="e.g. p-4 bg-red-500"
          />

          <ui-input
            v-if="options.content !== undefined"
            v-model="options.content"
            type="textarea"
            title="Content"
            placeholder="Text content..."
          />

          <ui-input
            v-if="options.columns"
            v-model="options.columns"
            type="textarea"
            title="Table Columns"
            placeholder='["Col 1", "Col 2"]'
          />

          <ui-input
            v-if="options.rows"
            v-model="options.rows"
            type="textarea"
            title="Table Rows"
            placeholder='[["Cell 1", "Cell 2"]]'
          />

          <div v-if="options.src !== undefined" class="flex flex-col gap-2">
            <label class="text-xs font-medium text-foreground"
              >Image Source</label
            >
            <input
              type="file"
              accept="image/*"
              @change="(e) => (options.src = e.target.files[0])"
              class="block w-full text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
            />
          </div>
        </div>

        <div class="flex flex-col gap-2 mt-4 pt-4 border-t border-border">
          <ui-button type="submit" variant="default" class="w-full">
            Save Changes
          </ui-button>

          <ui-button
            type="button"
            variant="destructive"
            class="w-full"
            @click="deleteElement"
          >
            Delete Element
          </ui-button>
        </div>
      </form>
    </div>
  </div>
</template>
<script setup>
import { templateStore } from "@/stores/templateStore";

const store = templateStore();
const selectedElement = computed(() => store.selectedElement);
const options = computed(() => store.options);
const saveDataOptions = store.saveDataOptions;
const deleteElement = store.deleteElement;
</script>
