<template>
  <layout-left-bar />
  <layout-center-container />
  <layout-right-bar />
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { templateStore } from '../stores/templateStore'
const schema = templateStore().schema
const renderPreview = templateStore().renderPreview
const updateSchemaDisplay = templateStore().updateSchemaDisplay
const selectedElementClick = templateStore().selectedElementClick
onMounted(() => {
  renderPreview()
  updateSchemaDisplay()

  document.addEventListener('dragover', (e) => {
    if (e.target.closest('#dropzone')) {
      e.preventDefault()
    }
  })

  document.addEventListener('drop', (e) => {
    if (e.target.closest('#dropzone #preview')) {
      e.preventDefault()
      const data = JSON.parse(e.dataTransfer.getData('text/plain'))

      if (data.action === 'move') {
        schema.value.children = schema.value.children.map(child =>
          child.id === data.id ? { ...data.schemaData } : child
        )
      }

      renderPreview()
      updateSchemaDisplay()
    }
  })

  window.selectedElement = selectedElementClick
})
</script>
