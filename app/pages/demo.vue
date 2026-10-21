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

useHead(() => ({
  title: t('editor.pageTitle'),
  // The preview markup is injected with v-html, so it needs the runtime
  // Tailwind build. It stays out of the landing, and the config style gives
  // it our class-based dark variant instead of the default media-based one.
  script: [{ src: 'https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4', tagPosition: 'bodyClose' }],
  style: [{ type: 'text/tailwindcss', children: '@custom-variant dark (&:where(.dark, .dark *));' }]
}))

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
