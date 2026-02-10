<template>
  <layout-left-bar />
  <layout-center-container />
  <layout-right-bar />
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import { templateStore } from "../stores/templateStore";

// Make this page client-only to avoid SSR issues with Pinia
definePageMeta({
  ssr: false,
});

const store = templateStore();
const schema = store.schema;
const renderPreview = store.renderPreview;
const updateSchemaDisplay = store.updateSchemaDisplay;
const selectedElementClick = store.selectedElementClick;
onMounted(() => {
  renderPreview();
  updateSchemaDisplay();

  document.addEventListener("dragover", (e) => {
    if (e.target.closest("#dropzone")) {
      e.preventDefault();
    }
  });

  document.addEventListener("drop", (e) => {
    if (e.target.closest("#dropzone #preview")) {
      e.preventDefault();
      const data = JSON.parse(e.dataTransfer.getData("text/plain"));

      if (data.action === "move") {
        schema.value.children = schema.value.children.map((child) =>
          child.id === data.id ? { ...data.schemaData } : child,
        );
      }

      renderPreview();
      updateSchemaDisplay();
    }
  });

  window.selectedElement = selectedElementClick;
});
</script>
