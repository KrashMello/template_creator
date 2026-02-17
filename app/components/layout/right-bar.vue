<template>
  <div
    class="col-span-3 border-l-2 border-slate-100 p-6 rounded-r-xl shadow-lg h-full overflow-auto"
  >
    <div id="options" class="flex flex-col gap-4 h-full">
      <h2 class="text-xl font-bold mb-4 text-slate-800">Opciones</h2>
      <form
        @submit.prevent="saveDataOptions"
        v-if="selectedElement"
        class="flex flex-col gap-2"
      >
        <ui-input v-model="options.class" title="class" placeholder="classes" />
        <ui-input
          v-if="options.content"
          v-model="options.content"
          type="textarea"
          title="texto"
          placeholder="content"
        />
        <ui-input
          v-if="options.columns"
          v-model="options.columns"
          type="textarea"
          title="columns"
          placeholder="columns"
        />
        <ui-input
          v-if="options.src"
          @change="options.src = $event.target.files[0]"
          title="file"
          placeholder="src"
          type="file"
          acepted="image/*"
        />
        <ui-input
          v-if="options.rows"
          v-model="options.rows"
          type="textarea"
          title="rows"
          placeholder="rows"
        />
        <ui-button type="submit">Guardar</ui-button>
        <ui-button
          class="bg-red-500 hover:bg-red-700 text-white font-bold p-2 rounded-lg"
          @click="deleteElement"
          >Eliminar</ui-button
        >
      </form>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, computed } from "vue";

const selectedElement = computed(() => templateStore().selectedElement);
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
