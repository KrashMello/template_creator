<template>
  <layout-left-bar />
  <layout-center-container />
  <layout-right-bar />
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { templateStore } from '../stores/templateStore'

definePageMeta({
  layout: 'editor'
})

const store = templateStore()
const { t, locale } = useI18n()
const renderPreview = store.renderPreview
const updateSchemaDisplay = store.updateSchemaDisplay

useHead(() => ({ title: t('editor.pageTitle') }))

// Localized "empty canvas" hint (rendered inside the preview HTML)
store.emptyHint = t('editor.emptyHint')
watch(locale, () => {
  store.emptyHint = t('editor.emptyHint')
  store.renderPreview()
})

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
