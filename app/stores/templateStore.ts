import { defineStore } from 'pinia'
import { ref, nextTick } from 'vue'

export const templateStore = defineStore('template', {
  state: () => ({
    styleEl: null,
    selectedElement: null,
    showPreviewMode: true,
    cssCode: '',
    schema: {
      type: 'container',
      children: []
    },
    schemaJson: '',
    previewHtml: '',
    options: {
      class: '',
      content: '',
      columns: '',
      rows: '',
      src: ''
    },
  }),
  getters: {
  },
  actions: {
    renderPreview() {
      try {
        const html = this.generateLayoutHtml(this.schema)
        this.previewHtml = html

        nextTick(() => {
          document.querySelectorAll('#preview .draggable-component').forEach(el => {
            el.draggable = true
            el.addEventListener('dragstart', this.handlePreviewDragStart)
            el.addEventListener('dragend', this.handlePreviewDragEnd)
            el.addEventListener('dragenter', this.onDragEnter)
            el.addEventListener('dragleave', this.onDragLeave)
          })
        })
      } catch (e) {
        console.error('Error renderizando preview:', e)
      }
    },
    generateLayoutHtml(schema) {
      if (!schema.children || schema.children.length === 0) return ''

      return schema.children.map(child => this.generateElementHtml(child)).join('')
    },
    updateSchemaDisplay() {
      this.schemaJson = JSON.stringify({ style: this.cssCode, schema: this.schema }, null, 2).trim()
    },
    generateElementHtml(element) {
      let html = ''
      let gen = {
        img: () => {
          html = `<div 
      id="${element.id}"
      class="draggable-component p-2 border-2 border-dashed border-slate-400 rounded-lg cursor-grab active:cursor-grabbing bg-slate-50 w-fit"
      draggable="true"
      data-schema='${JSON.stringify(element)}'
      data-id="${element.id}"
      onclick="selectedElement(event)">
      <${element.tag}
      src='${element.data.src}'
      class="${element.data.class}"
      />
      </div>`
        },
        div: () => {
          html = `<${element.tag}
          class="draggable-component p-2 border-2 border-dashed border-slate-400 rounded-lg cursor-grab ${element.data.class}"
          draggable="true"
          data-schema='${JSON.stringify(element)}'
          data-id="${element.id}"
          onclick="selectedElement(event)"
        >`
          if (element.children && element.children.length > 0) {
            html += element.children.map(child => this.generateElementHtml(child)).join('')
          }
          html += `</${element.tag}>`
        },
        table: () => {
          html = `<div
        id="${element.id}"
        class="draggable-component p-2 border-2 border-dashed border-slate-400 rounded-lg cursor-grab active:cursor-grabbing bg-slate-50 w-fit"
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
          html += `</${element.tag}></div>`
        },
        p: () => {
          html = `<div
        id="${element.id}"
        class="draggable-component p-2 border-2 border-dashed border-slate-400 rounded-lg cursor-grab active:cursor-grabbing bg-slate-50 w-fit"
        draggable="true"
        data-schema='${JSON.stringify(element)}'
        data-id="${element.id}"
        onclick="selectedElement(event)">
          <${element.tag}
          class="${element.data.class}"
          >`
          if (element.data.content) {
            html += element.data.content
          }
          html += `</${element.tag}></div>`
        }
      }
      gen[element.tag]()
      return html
    },
    showPreview() {
      this.showPreviewMode = true
    },
    showScheme() {
      this.showPreviewMode = false
      this.updateSchemaDisplay()
    },
    deleteElement() {
      if (!this.selectedElement) return
      const path = this.findPathById(this.schema, this.selectedElement.dataset.id)
      this.removeElementAtPath(this.schema, path)

      this.selectedElement = null
      this.renderPreview()
      this.updateSchemaDisplay()
    },
    getElementByPath(path) {
      let current = this.schema
      for (let index of path) {
        current = current.children[index]
      }
      return current
    },
    findPathById(current, id) {
      const root = current
      if (root.id === id) return []

      if (root.children) {
        for (let i = 0; i < root.children.length; i++) {
          const child = root.children[i]
          const path = this.findPathById(child, id)
          if (path !== null) {
            return [i, ...path]
          }
        }
      }
      return null
    },
    insertElementAtPath(root, element, path, index) {
      let parent = root
      for (let i = 0; i < path.length; i++) {
        parent = parent.children[path[i]]
      }
      if (!parent.children) parent.children = []
      parent.children.splice(index, 0, element)
    },
    removeElementAtPath(root, path) {
      if (!path || path.length === 0) return
      let parent = root
      for (let i = 0; i < path.length - 1; i++) {
        parent = parent.children[path[i]]
      }
      const lastIndex = path[path.length - 1]
      parent.children.splice(lastIndex, 1)
    },
    setStyleEl(el) {
      console.log(el)
      this.styleEl = el
    },
    setStyleElTexContent(css) {
      if (this.styleEl)
        this.styleEl.textContent = css
    },
    onDrop(event) {
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
        const sourcePath = this.findPathById(this.schema, id)
        if (!sourcePath) return

        nuevoElemento = schemaData
        this.removeElementAtPath(this.schema, sourcePath)
      }

      if (dropTarget) {
        const targetId = dropTarget.dataset.id
        const targetPath = this.findPathById(this.schema, targetId)

        const rect = dropTarget.getBoundingClientRect()
        const relativeY = event.clientY - rect.top
        const isAfter = relativeY > rect.height / 2

        const targetSchema = this.getElementByPath(targetPath)

        if (targetSchema && targetSchema.tag === 'div') {
          if (!targetSchema.children) targetSchema.children = []
          targetSchema.children.push(nuevoElemento)
        } else {
          const parentPath = targetPath.slice(0, -1)
          const indexInParent = targetPath[targetPath.length - 1]
          const finalIndex = isAfter ? indexInParent + 1 : indexInParent
          this.insertElementAtPath(nuevoElemento, parentPath, finalIndex)
        }
      } else {
        this.schema.children.push(nuevoElemento)
      }

      this.renderPreview()
      this.updateSchemaDisplay()
    },
    handlePreviewDragStart(event) {
      const element = event.target.closest('.draggable-component')
      const schemaData = JSON.parse(element.dataset.schema)
      const id = element.dataset.id
      event.dataTransfer.setData('text/plain', JSON.stringify({
        action: 'move',
        id,
        schemaData
      }))
    },
    handlePreviewDragEnd(event) {
      this.renderPreview()
    },
    onDragEnter(event) {
      event.preventDefault()
      event.stopPropagation()

      const target = event.target.closest('.draggable-component')

      if (target) {
        target.classList.add('border-slate-600', 'border-solid')
        target.classList.remove('border-dashed', 'border-slate-400')
      }
    },
    onDragLeave(event) {
      event.preventDefault()
      event.stopPropagation()

      const target = event.target.closest('.draggable-component')

      if (target) {
        target.classList.remove('border-slate-600', 'border-solid')
        target.classList.add('border-dashed', 'border-slate-400')
      }
    },
    replace(root, element) {
      return root.children.map((v) => {
        if (v.id !== element.id) {
          v.children = this.replace(v, element)
          return v
        } else {
          return element
        }
      })
    },
    updateElementAtPath(element) {
      this.schema.children = this.replace(this.schema, element)
    },
    selectedElementClick(event) {
      event.stopPropagation()
      const component = event.target.closest('.draggable-component')

      if (!component) return
      if (this.selectedElement) {
        this.selectedElement.classList.remove('border-slate-600')
        this.selectedElement.classList.add('border-slate-400')
      }
      this.selectedElement = component
      this.selectedElement.classList.add('border-slate-600')
      this.selectedElement.classList.remove('border-slate-400')
      const element_schema = JSON.parse(this.selectedElement.dataset.schema)

      if (element_schema) {
        this.options.class = element_schema.data.class || ''
        this.options.content = element_schema.data.content || ''
        this.options.columns = JSON.stringify(element_schema.data.columns)
        this.options.rows = JSON.stringify(element_schema.data.rows)
        this.options.src = element_schema.data.src
      }
    },
    saveDataOptions() {
      if (!this.selectedElement) return

      const element_schema = JSON.parse(this.selectedElement.dataset.schema)
      let data = {
        ...element_schema.data
      }

      if (this.options.class) {
        data.class = this.options.class
      }
      if (this.options.columns) {
        data.columns = JSON.parse(this.options.columns)
      }
      if (this.options.rows) {
        data.rows = JSON.parse(this.options.rows)
      }
      if (this.options.content) {
        data.content = this.options.content
      }
      if (this.options.src) {
        if (this.options.src.type.includes('image/png')) {
          const reader = new FileReader()
          reader.onload = () => {
            data.src = reader.result
          }
          reader.readAsDataURL(this.options.src)
        }
      }

      const dataTransfer = {
        ...element_schema,
        data,
      }
      this.updateElementAtPath(dataTransfer)
      this.selectedElement = null
      this.renderPreview()
      this.updateSchemaDisplay()
    }
  },
  persist: {
    storage: sessionStorage,
    pick: ['styleEl', 'cssCode', 'schema'],
  },
})
