<template>
  <div class="flex flex-col gap-2 h-[84dvh]">
    <h2 class="text-xl font-bold text-slate-800">Styles</h2>
    <div class="h-full gap-2">
      <textarea v-model="cssCode"
        :class="`w-full h-full font-mono text-sm bg-gradient-to-r from-blue-50 to-indigo-50  text-slate-700  rounded-md p-3 focus:outline-none focus:ring-0 resize-none`"
        spellcheck="false" />
    </div>
  </div>
</template>

<script setup>
import { templateStore } from '../../stores/templateStore'
const setStyleElTexContent = templateStore().setStyleElTexContent
const setStyleEl = templateStore().setStyleEl
const cssCode = computed({
  get() {
    return templateStore().cssCode
  },
  set(val) {
    templateStore().cssCode = val
  }
})
if (process.client) {
  const el = document.createElement('style')
  el.setAttribute('data-dynamic-css', 'true')
  document.head.appendChild(el)
  setStyleEl(el)

  setStyleElTexContent(cssCode.value)

  watch(cssCode, (val) => {
    setStyleElTexContent(val)
  })
} 
</script>
