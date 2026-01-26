<template>
  <div class="col-span-3 bg-slate-300 p-6 rounded-xl shadow-lg h-full overflow-y-auto">
    <layout-left-bar />
  </div>

  <div
    class="col-span-6 gap-2 flex flex-col bg-slate-300 p-8 rounded-xl shadow-lg h-full overflow-auto border-4 border-dashed border-gray-300"
    id="dropzone">
    <ol class="flex flex-row gap-2">
      <li>
        <button class="bg-slate-500 hover:bg-slate-700 text-white font-bold p-2 rounded-lg" @click="showPreview">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 48 48">
            <g fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="4">
              <path d="M24 36c11.046 0 20-12 20-12s-8.954-12-20-12S4 24 4 24s8.954 12 20 12Z" />
              <path d="M24 29a5 5 0 1 0 0-10a5 5 0 0 0 0 10Z" />
            </g>
          </svg>
        </button>
      </li>
      <li>
        <button class="bg-slate-500 hover:bg-slate-700 text-white font-bold p-2 rounded-lg" @click="showScheme">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
            <path fill="currentColor"
              d="m8 18l-6-6l6-6l1.425 1.425l-4.6 4.6L9.4 16.6zm8 0l-1.425-1.425l4.6-4.6L14.6 7.4L16 6l6 6z" />
          </svg>
        </button>
      </li>
      <li>
        <button class="bg-slate-500 hover:bg-slate-700 text-white font-bold p-2 rounded-lg" @click="generateDocument">
          descargar pdf
        </button>
      </li>
    </ol>
    <div id="preview" class="h-[85vh] overflow-y-auto bg-slate-100 rounded-lg" :class="{ 'hidden': !showPreviewMode }"
      v-html="previewHtml" @dragenter="onDragEnter" @dragleave="onDragLeave" @drop="onDrop"></div>
    <div id='schema' class='flex-col' :class="`${showPreviewMode ? 'hidden' : 'flex'}`">
      <h2 class="text-xl font-bold mb-4 text-slate-800">Schema</h2>
      <pre id="schema-display"
        class="flex-1 max-h-[70dvh] bg-slate-50 p-4 rounded-lg text-sm font-mono text-slate-700 overflow-auto text-xs">
        {{ schemaJson }}</pre>
    </div>
  </div>

  <div class="col-span-3 bg-slate-300 p-6 rounded-xl shadow-lg h-full overflow-auto">
    <div id="options" class=" flex flex-col gap-4 h-full">
      <h2 class="text-xl font-bold mb-4 text-slate-800">Options</h2>
      <div class="flex flex-row gap-2">
        <button
          :class="` ${selectedElement ? 'flex' : 'hidden'} bg-slate-500 hover:bg-slate-700 text-white font-bold p-2 rounded-lg`"
          @click="() => { return; }">config</button>
      </div>
      <form @submit.prevent="saveDataOptions" :class="`${!selectedElement ? 'hidden' : 'flex'} flex-col gap-2`">
        <div class="flex flex-col gap-2">
          <label for="options-class">class</label>
          <input type="text" id="options-class" v-model="options.class"
            class="bg-slate-50 p-2 rounded-lg text-sm font-mono text-slate-700 overflow-auto text-xs"
            placeholder="classes">
        </div>
        <div :class="` flex-col gap-2 ${options.content ? 'flex' : 'hidden'}`">
          <label for="options-content">texto</label>
          <textarea type="text" id="options-content" v-model="options.content"
            class="bg-slate-50 p-2 rounded-lg text-sm font-mono text-slate-700 overflow-auto text-xs"
            placeholder="content"></textarea>
        </div>
        <div :class="` flex-col gap-2 ${options.columns ? 'flex' : 'hidden'}`">
          <label for="options-columns">columns</label>
          <textarea id="options-columns" v-model="options.columns"
            class="bg-slate-50 p-2 rounded-lg text-sm font-mono text-slate-700 overflow-auto text-xs"
            placeholder="columns"></textarea>
        </div>
        <div :class="`flex-col gap-2 ${options.src ? 'flex' : 'hidden'}`">
          <label for="options-src">file</label>
          <input id="options-src" type="file" acepted="image/*"
            class="bg-slate-50 p-2 rounded-lg text-sm font-mono text-slate-700 overflow-auto text-xs"
            v-on:change="options.src = $event.target.files[0]" placeholder="src" />
        </div>
        <div :class="` flex-col gap-2 ${options.rows ? 'flex' : 'hidden'}`">
          <label for="options-rows">rows</label>
          <textarea id="options-rows" v-model="options.rows"
            class="bg-slate-50 p-2 rounded-lg text-sm font-mono text-slate-700 overflow-auto text-xs"
            placeholder="rows"></textarea>
        </div>
        <button type="submit" class="bg-slate-500 hover:bg-slate-700 text-white font-bold p-2 rounded-lg">Save</button>
        <button type="button" class="bg-red-500 hover:bg-red-700 text-white font-bold p-2 rounded-lg"
          @click="deleteElement">Delete</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { templateStore } from '../stores/templateStore'
const schema = templateStore().schema
const selectedElement = computed(() => templateStore().selectedElement)
const showPreviewMode = computed(() => templateStore().showPreviewMode)
const previewHtml = computed(() => templateStore().previewHtml)
const schemaJson = computed(() => templateStore().schemaJson)

const options = computed(() => templateStore().options)
const renderPreview = templateStore().renderPreview
const updateSchemaDisplay = templateStore().updateSchemaDisplay

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

const showPreview = templateStore().showPreview

const showScheme = templateStore().showScheme

const selectedElementClick = templateStore().selectedElementClick
const saveDataOptions = templateStore().saveDataOptions
const deleteElement = templateStore().deleteElement
const generateDocument = templateStore().generateDocument

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
