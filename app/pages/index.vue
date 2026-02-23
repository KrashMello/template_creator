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
const deleteElementById = templateStore().deleteElementById
onMounted(() => {
  renderPreview()
  updateSchemaDisplay()

  document.addEventListener('dragover', (e) => {
    if (e.target.closest('#dropzone')) {
      e.preventDefault()
    }
  })

  document.addEventListener('drop', templateStore().onDrop)

  window.selectedElement = selectedElementClick
  window.deleteElementById = deleteElementById
})
</script>
