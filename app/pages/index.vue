<template>
  <layout-left-bar />
  <layout-center-container />
  <layout-right-bar />
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { templateStore } from '../stores/templateStore'
const store = templateStore()
const schema = store.schema
const renderPreview = store.renderPreview
const updateSchemaDisplay = store.updateSchemaDisplay
const selectedElementClick = store.selectedElementClick
const deleteElementById = store.deleteElementById
onMounted(() => {
  renderPreview()
  updateSchemaDisplay()

  document.addEventListener('dragover', (e) => {
    if (e.target.closest('#dropzone')) {
      e.preventDefault()
    }
  })

  document.addEventListener('keydown', (e) => {
    if (store.selectedElement && e.key === "Escape")
      store.clearSelectedElemen()
  })
})
</script>
