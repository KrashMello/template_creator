<template>
  <div class="bg-slate-800 p-8 min-h-screen flex flex-col">
    <div class="grid grid-cols-12 gap-8 h-full flex-1">
      <div class="col-span-3 bg-slate-300 p-6 rounded-xl shadow-lg h-full overflow-y-auto">
        <h2 class="text-xl font-bold mb-6 text-slate-800">Componentes</h2>
        <div id="componentes" class="space-y-3">
          <div v-for="comp in componentes" :key="comp.nombre"
            class="componente px-4 py-2 rounded-lg hover:border-blue-400 cursor-grab active:cursor-grabbing bg-gradient-to-r from-blue-50 to-indigo-50 transition-all draggable-component"
            draggable="true" :data-tag="comp.tag" :data-nombre="comp.nombre" :data-data="JSON.stringify(comp.data)"
            @dragenter="onDragEnter" @dragleave="onDragLeave" @dragstart="onDragStart">
            <div class="flex items-center space-x-3">
              <span class="text-2xl text-slate-500" v-html="comp.icon"></span>
              <div>
                <div class="font-medium text-slate-500">{{ comp.nombre }}</div>
                <div class="text-xs text-slate-400">{{ comp.tag }}</div>
              </div>
            </div>
          </div>
        </div>
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
        </ol>
        <div id="preview" class="h-full overflow-y-auto bg-slate-100 rounded-lg" :class="{ 'hidden': !showPreviewMode }"
          v-html="previewHtml" @dragenter="onDragEnter" @dragleave="onDragLeave" @drop="onDrop"></div>
        <div id='schema' class='flex-col' :class="`${showPreviewMode ? 'hidden' : 'flex'}`">
          <h2 class="text-xl font-bold mb-4 text-slate-800">Schema</h2>
          <pre id="schema-display"
            class="flex-1 max-h-[70dvh] bg-slate-50 p-4 rounded-lg text-sm font-mono text-slate-700 overflow-auto text-xs">
            {{ schemaJson }}</pre>
        </div>
      </div>

      <div class="col-span-3 bg-slate-300 p-6 rounded-xl shadow-lg h-full overflow-auto">
        <div id="options" class=" flex flex-col gap-4" :class="{ 'hidden': !selectedElement }">
          <h2 class="text-xl font-bold mb-4 text-slate-800">Options</h2>
          <form @submit.prevent="saveDataOptions" class="flex flex-col gap-2">
            <div class="flex flex-col gap-2">
              <label for="options-class">class</label>
              <input type="text" id="options-class" v-model="options.class"
                class="bg-slate-50 p-2 rounded-lg text-sm font-mono text-slate-700 overflow-auto text-xs"
                placeholder="classes">
            </div>
            <div class="flex flex-col gap-2">
              <label for="options-content">content</label>
              <input type="text" id="options-content" v-model="options.content"
                class="bg-slate-50 p-2 rounded-lg text-sm font-mono text-slate-700 overflow-auto text-xs"
                placeholder="content">
            </div>
            <div class="flex flex-col gap-2">
              <label for="options-columns">columns</label>
              <textarea id="options-columns" v-model="options.columns"
                class="bg-slate-50 p-2 rounded-lg text-sm font-mono text-slate-700 overflow-auto text-xs"
                placeholder="columns"></textarea>
            </div>
            <div class="flex flex-col gap-2">
              <label for="options-rows">rows</label>
              <textarea id="options-rows" v-model="options.rows"
                class="bg-slate-50 p-2 rounded-lg text-sm font-mono text-slate-700 overflow-auto text-xs"
                placeholder="rows"></textarea>
            </div>
            <button type="submit"
              class="bg-slate-500 hover:bg-slate-700 text-white font-bold p-2 rounded-lg">Save</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'

const col = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path fill="currentColor" d="M29 7.5A4.5 4.5 0 0 0 24.5 3h-17A4.5 4.5 0 0 0 3 7.5v17A4.5 4.5 0 0 0 7.5 29h17a4.5 4.5 0 0 0 4.5-4.5zM16 5v22H7.5A2.5 2.5 0 0 1 5 24.5v-17A2.5 2.5 0 0 1 7.5 5z"/></svg>`
const row = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><path fill="currentColor" d="M4.5 2A2.5 2.5 0 0 0 2 4.5v7A2.5 2.5 0 0 0 4.5 14h7a2.5 2.5 0 0 0 2.5-2.5v-7A2.5 2.5 0 0 0 11.5 2zM3 4.5A1.5 1.5 0 0 1 4.5 3h7A1.5 1.5 0 0 1 13 4.5V8H3z"/></svg>`
const paragraph = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M9 20v-6q-2.075 0-3.537-1.463T4 9t1.463-3.537T9 4h9v2h-2v14h-2V6h-3v14z"/></svg>`
const table = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="currentColor" d="M3 6.25A3.25 3.25 0 0 1 6.25 3h11.5A3.25 3.25 0 0 1 21 6.25v11.5A3.25 3.25 0 0 1 17.75 21H6.25A3.25 3.25 0 0 1 3 17.75zM6.25 4.5A1.75 1.75 0 0 0 4.5 6.25V8.5h4v-4zM4.5 10v4h4v-4zm5.5 0v4h4v-4zm5.5 0v4h4v-4zM14 15.5h-4v4h4zm1.5 4h2.25a1.75 1.75 0 0 0 1.75-1.75V15.5h-4zm0-11h4V6.25a1.75 1.75 0 0 0-1.75-1.75H15.5zm-1.5-4h-4v4h4zm-9.5 11v2.25c0 .966.784 1.75 1.75 1.75H8.5v-4z"/></svg>`

const schema = ref({
  type: 'container',
  children: []
})

const selectedElement = ref(null)
const showPreviewMode = ref(true)
const previewHtml = ref('')
const schemaJson = ref('')

const options = ref({
  class: '',
  content: '',
  columns: '',
  rows: ''
})

const componentes = ref([
  { tag: 'p', nombre: 'Párrafo', icon: paragraph, data: { content: 'paragraph', class: "p-2 text-slate-800" } },
  { tag: 'table', nombre: 'Tabla', icon: table, data: { table: true, columns: ["column 1", "column 2"], rows: [['column-row-1', 'column-row-2']], class: "w-full text-sm text-left rtl:text-right text-body" } },
  { tag: 'div', nombre: 'Row', icon: row, data: { class: 'flex flex-row gap-4 min-h-7 w-full px-2' } },
  { tag: 'div', nombre: 'Columna', icon: col, data: { class: 'flex flex-col gap-4 min-h-7 w-full ' } }
])

const renderPreview = () => {
  try {
    const html = generateLayoutHtml(schema.value)
    previewHtml.value = html

    nextTick(() => {
      document.querySelectorAll('#preview .draggable-component').forEach(el => {
        el.draggable = true
        el.addEventListener('dragstart', handlePreviewDragStart)
        el.addEventListener('dragend', handlePreviewDragEnd)
        el.addEventListener('dragenter', onDragEnter)
        el.addEventListener('dragleave', onDragLeave)
      })
    })
  } catch (e) {
    console.error('Error renderizando preview:', e)
  }
}

const generateLayoutHtml = (schema) => {
  if (!schema.children || schema.children.length === 0) return ''

  return schema.children.map(child => generateElementHtml(child)).join('')
}

const generateElementHtml = (element) => {
  let html = `<div 
    id="${element.id}"
    class="draggable-component p-2 border-2 border-dashed border-slate-300 rounded-lg hover:border-slate-400 cursor-grab active:cursor-grabbing bg-gradient-to-r from-slate-50 to-indigo-50 transition-all"
    draggable="true" 
    data-schema='${JSON.stringify(element)}' 
    data-id="${element.id}" 
    onclick="selectedElement(event)">
    <${element.tag}
    class="${element.data.class}"
    >`

  if (element.data.table) {
    html += `<thead class="text-sm text-body bg-slate-300 border-b rounded-base border-default">
      <tr>
        ${element.data.columns.map(col => `<th class="px-6 py-3 font-medium">${col}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${element.data.rows.map(row => `
        <tr class="bg-neutral-primary border-b border-default">
          ${row.map(cell => `<td class="px-6 py-4">${cell}</td>`).join('')}
        </tr>
      `).join('')}
    </tbody>`
  }

  if (element.data.content) {
    html += element.data.content
  }

  if (element.children && element.children.length > 0) {
    html += element.children.map(child => generateElementHtml(child)).join('')
  }

  html += `</${element.tag}></div>`
  return html
}

const updateSchemaDisplay = () => {
  schemaJson.value = JSON.stringify(schema.value, null, 2)
}

const onDragStart = (event) => {
  const tag = event.target.dataset.tag || event.target.closest('.draggable-component')?.dataset.tag
  const data = event.target.dataset.data ? JSON.parse(event.target.dataset.data) : {}
  const nombre = event.target.dataset.nombre

  event.dataTransfer.setData('text/plain', JSON.stringify({ tag, data, nombre }))
  event.dataTransfer.effectAllowed = 'move'
}

const onDragEnter = (event) => {
  event.preventDefault()
  event.stopPropagation()

  const target = event.target.closest('.draggable-component')

  if (target) {
    target.classList.add('border-slate-400', 'bg-blue-50', 'border-solid')
    target.classList.remove('border-dashed', 'border-slate-400')
  }
}

const onDragLeave = (event) => {
  event.preventDefault()
  event.stopPropagation()

  const target = event.target.closest('.draggable-component')

  if (target) {
    target.classList.remove('border-slate-400', 'bg-blue-50', 'border-solid')
    target.classList.add('border-dashed', 'border-slate-400')
  }
}

const onDrop = (event) => {
  event.preventDefault()
  event.stopPropagation()

  const dropTarget = event.target.closest('.draggable-component')
  if (dropTarget) {
    dropTarget.classList.remove('border-slate-400', 'bg-blue-50', 'border-solid')
    dropTarget.classList.add('border-dashed', 'border-slate-400')
  }

  let transferData
  try {
    transferData = JSON.parse(event.dataTransfer.getData('text/plain'))
  } catch (e) { return }

  let action = transferData.action || null
  let id = transferData.id || null
  let schemaData = transferData.schemaData || transferData

  if (action === 'move' && dropTarget && dropTarget.dataset.id === id) {
    console.warn("Operación cancelada: No puedes soltar un elemento sobre sí mismo.")
    return
  }

  let nuevoElemento
  if (action === null) {
    nuevoElemento = {
      id: crypto.randomUUID().split('-').join(''),
      tag: schemaData.tag,
      data: { ...schemaData.data },
      children: []
    }
  } else {
    const sourcePath = findPathById(schema.value, id)
    if (!sourcePath) return

    nuevoElemento = schemaData
    removeElementAtPath(schema.value, sourcePath)
  }

  if (dropTarget) {
    const targetId = dropTarget.dataset.id
    const targetPath = findPathById(schema.value, targetId)

    const rect = dropTarget.getBoundingClientRect()
    const relativeY = event.clientY - rect.top
    const isAfter = relativeY > rect.height / 2

    const targetSchema = getElementByPath(schema.value, targetPath)

    if (targetSchema && targetSchema.tag === 'div') {
      if (!targetSchema.children) targetSchema.children = []
      targetSchema.children.push(nuevoElemento)
    } else {
      const parentPath = targetPath.slice(0, -1)
      const indexInParent = targetPath[targetPath.length - 1]
      const finalIndex = isAfter ? indexInParent + 1 : indexInParent
      insertElementAtPath(schema.value, nuevoElemento, parentPath, finalIndex)
    }
  } else {
    schema.value.children.push(nuevoElemento)
  }

  renderPreview()
  updateSchemaDisplay()
}

const handlePreviewDragStart = (event) => {
  const element = event.target.closest('.draggable-component')
  const schemaData = JSON.parse(element.dataset.schema)
  const id = element.dataset.id
  event.dataTransfer.setData('text/plain', JSON.stringify({
    action: 'move',
    id,
    schemaData
  }))
}

const handlePreviewDragEnd = (event) => {
  renderPreview()
}

const showPreview = () => {
  showPreviewMode.value = true
}

const showScheme = () => {
  showPreviewMode.value = false
  updateSchemaDisplay()
}

const selectedElementClick = (event) => {
  event.stopPropagation()
  const component = event.target.closest('.draggable-component')

  if (!component) return

  if (selectedElement.value) {
    selectedElement.value.classList.remove('border-2', 'border-blue-400', 'bg-blue-50')
  }

  selectedElement.value = component
  selectedElement.value.classList.add('border-2', 'border-blue-400', 'bg-blue-50')

  const element_schema = JSON.parse(selectedElement.value.dataset.schema)

  if (element_schema) {
    options.value.class = element_schema.data.class || ''
    options.value.content = element_schema.data.content || ''

    if (element_schema.tag === 'table') {
      options.value.columns = JSON.stringify(element_schema.data.columns || [])
      options.value.rows = JSON.stringify(element_schema.data.rows || [])
    } else {
      options.value.columns = ''
      options.value.rows = ''
    }
  }
}

const saveDataOptions = () => {
  if (!selectedElement.value) return

  const element_schema = JSON.parse(selectedElement.value.dataset.schema)
  let data = {
    ...element_schema.data
  }

  if (options.value.class) {
    data.class = options.value.class
  }
  if (options.value.columns) {
    data.columns = JSON.parse(options.value.columns)
  }
  if (options.value.rows) {
    data.rows = JSON.parse(options.value.rows)
  }
  if (options.value.content) {
    data.content = options.value.content
  }

  const dataTransfer = {
    ...element_schema,
    data,
  }

  const path = findPathById(schema.value, selectedElement.value.dataset.id)
  updateElementAtPath(schema.value, dataTransfer, path)
  selectedElement.value = null

  renderPreview()
  updateSchemaDisplay()
}

const getElementByPath = (root, path) => {
  let current = root
  for (let index of path) {
    current = current.children[index]
  }
  return current
}

const findPathById = (root, id) => {
  if (root.id === id) return []

  if (root.children) {
    for (let i = 0; i < root.children.length; i++) {
      const child = root.children[i]
      const path = findPathById(child, id)
      if (path !== null) {
        return [i, ...path]
      }
    }
  }
  return null
}

const insertElementAtPath = (root, element, path, index) => {
  let parent = root
  for (let i = 0; i < path.length; i++) {
    parent = parent.children[path[i]]
  }
  if (!parent.children) parent.children = []
  parent.children.splice(index, 0, element)
}

const removeElementAtPath = (root, path) => {
  if (!path || path.length === 0) return
  let parent = root
  for (let i = 0; i < path.length - 1; i++) {
    parent = parent.children[path[i]]
  }
  const lastIndex = path[path.length - 1]
  parent.children.splice(lastIndex, 1)
}

const replace = (root, element) => {
  return root.children.map((v) => {
    if (v.id !== element.id) {
      v.children = replace(v, element)
      return v
    } else {
      return element
    }
  })
}

const updateElementAtPath = (root, element, path) => {
  let current = root

  if (path.length > 1) {
    root.children = replace(root, element)
  } else {
    root.children[path[0]] = element
  }
}

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
