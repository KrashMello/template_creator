<template>
  <div
    class="col-span-6 gap-2 flex flex-col bg-slate-300 p-4 shadow-lg h-full overflow-auto border-4 border-dashed border-gray-300"
    id="dropzone">
    <ol class="flex flex-row gap-2 items-center w-full">
      <li>
        <ui-button @click="selectView(1)">
          <svg-eye-open />
        </ui-button>
      </li>
      <li>
        <ui-button @click="selectView(2)">
          <svg-code />
        </ui-button>
      </li>
      <li>
        <ui-button @click="selectView(3)">
          <svg-css class="size-4" />
        </ui-button>
      </li>
      <li class="ml-auto">
        <ui-button @click="generateDocument">
          <span class="text-xs">
            Descargar PDF
          </span>
          <svg-download class="size-5" />
        </ui-button>
      </li>
    </ol>
    <div id="preview" class="h-full max-h-[84dvh] overflow-y-auto bg-slate-100 rounded-lg" v-html="previewHtml"
      @dragenter="onDragEnter" @dragleave="onDragLeave" v-if="selectedView === 1" @drop="onDrop"></div>
    <div id='schema' class='flex-col gap-2 flex' v-if="selectedView === 2">
      <h2 class="text-xl font-bold text-slate-800">Schema</h2>
      <pre id="schema-display"
        class="flex-1 max-h-[78dvh] bg-slate-50 p-4 rounded-lg text-sm font-mono text-slate-700 overflow-auto text-xs">
        {{ schemaJson }}
      </pre>
    </div>
    <ui-style-editor v-if="selectedView === 3" />
  </div>
</template>
<script setup>
const previewHtml = computed(() => templateStore().previewHtml)
const schemaJson = computed(() => templateStore().schemaJson)
const selectedView = ref(1)
const selectView = (opt) => {
  selectedView.value = opt
}
const onDragEnter = (event) => {
  event.preventDefault()
  event.stopPropagation()

  const target = event.target.closest('.draggable-component')

  if (target) {
    target.classList.add('border-slate-600', 'border-solid')
    target.classList.remove('border-dashed', 'border-slate-400')
  }
}
const onDragLeave = (event) => {
  event.preventDefault()
  event.stopPropagation()

  const target = event.target.closest('.draggable-component')

  if (target) {
    target.classList.remove('border-slate-600', 'border-solid')
    target.classList.add('border-dashed', 'border-slate-400')
  }
}
const onDrop = templateStore().onDrop
const generateDocument = templateStore().generateDocument
</script>
