const col = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><!-- Icon from Fluent UI System Icons by Microsoft Corporation - https://github.com/microsoft/fluentui-system-icons/blob/main/LICENSE --><path fill="currentColor" d="M29 7.5A4.5 4.5 0 0 0 24.5 3h-17A4.5 4.5 0 0 0 3 7.5v17A4.5 4.5 0 0 0 7.5 29h17a4.5 4.5 0 0 0 4.5-4.5zM16 5v22H7.5A2.5 2.5 0 0 1 5 24.5v-17A2.5 2.5 0 0 1 7.5 5z"/></svg>`
const row = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><!-- Icon from Fluent UI System Icons by Microsoft Corporation - https://github.com/microsoft/fluentui-system-icons/blob/main/LICENSE --><path fill="currentColor" d="M4.5 2A2.5 2.5 0 0 0 2 4.5v7A2.5 2.5 0 0 0 4.5 14h7a2.5 2.5 0 0 0 2.5-2.5v-7A2.5 2.5 0 0 0 11.5 2zM3 4.5A1.5 1.5 0 0 1 4.5 3h7A1.5 1.5 0 0 1 13 4.5V8H3z"/></svg>`
const paragraph = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><!-- Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE --><path fill="currentColor" d="M9 20v-6q-2.075 0-3.537-1.463T4 9t1.463-3.537T9 4h9v2h-2v14h-2V6h-3v14z"/></svg>`
const table = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><!-- Icon from Fluent UI System Icons by Microsoft Corporation - https://github.com/microsoft/fluentui-system-icons/blob/main/LICENSE --><path fill="currentColor" d="M3 6.25A3.25 3.25 0 0 1 6.25 3h11.5A3.25 3.25 0 0 1 21 6.25v11.5A3.25 3.25 0 0 1 17.75 21H6.25A3.25 3.25 0 0 1 3 17.75zM6.25 4.5A1.75 1.75 0 0 0 4.5 6.25V8.5h4v-4zM4.5 10v4h4v-4zm5.5 0v4h4v-4zm5.5 0v4h4v-4zM14 15.5h-4v4h4zm1.5 4h2.25a1.75 1.75 0 0 0 1.75-1.75V15.5h-4zm0-11h4V6.25a1.75 1.75 0 0 0-1.75-1.75H15.5zm-1.5-4h-4v4h4zm-9.5 11v2.25c0 .966.784 1.75 1.75 1.75H8.5v-4z"/></svg>`
let schema = {
  type: 'container',
  children: []
};
let selected_element = null
const componentes = [
  { tag: 'p', nombre: 'Párrafo', icon: paragraph, data: { content: 'paragraph', class: "p-2 text-slate-800" } },
  { tag: 'table', nombre: 'Tabla', icon: table, data: { table: true, columns: ["column 1", "column 2"], rows: [['column-row-1', 'column-row-2']], class: "w-full text-sm text-left rtl:text-right text-body" } },
  { tag: 'div', nombre: 'Row', icon: row, data: { class: 'flex flex-row gap-4 min-h-7 w-full px-2' } },
  { tag: 'div', nombre: 'Columna', icon: col, data: { class: 'flex flex-col gap-4 min-h-7 w-full ' } }
];

Handlebars.registerHelper('json', function (context) {
  return JSON.stringify(context);
});

const layoutTemplate = Handlebars.compile(`
  {{#each children}}
      {{> elemento}}
  {{/each}}
`.trim());

Handlebars.registerPartial('elemento', `
<div 
  id="{{id}}"
  class="draggable-component p-2 border-2 border-dashed border-slate-300 rounded-lg hover:border-slate-400 cursor-grab active:cursor-grabbing bg-gradient-to-r from-slate-50 to-indigo-50 transition-all"
  draggable="true" 
  data-schema="{{json this}}" 
  data-id="{{id}}" 
  onclick="selectedElement(event)">
    <{{tag}}
    class="{{data.class}}"
    >
        {{#if data.table}}
            <thead class="text-sm text-body bg-slate-300 border-b rounded-base border-default">
                    <tr>
                        {{#each data.columns}}
                            <th class="px-6 py-3 font-medium">{{this}}</th>
                        {{/each}}
                    </tr>
            </thead>
            <tbody>
                {{#each data.rows}}
                    <tr class="bg-neutral-primary border-b border-default">
                        {{#each this}}
                            <td class="px-6 py-4">{{this}}</td>
                        {{/each}}
                    </tr>
                {{/each}}
            </tbody>
        {{/if}}
        {{#if data.content}}{{data.content}}{{/if}}
        {{#if children}}
            {{#each children}}
                {{> elemento}}
            {{/each}}
        {{/if}}
    </{{tag}}>
</div>
`);


init();

function init() {
  renderComponentes();
  renderPreview();
  updateSchemaDisplay();
}

function renderComponentes() {
  const container = document.getElementById('componentes');
  container.innerHTML = componentes.map(comp => `
      <div class="componente px-4 py-2 rounded-lg hover:border-blue-400 cursor-grab active:cursor-grabbing bg-gradient-to-r from-blue-50 to-indigo-50 transition-all draggable-component" 
            draggable="true" 
            data-tag="${comp.tag}" 
            data-nombre="${comp.nombre}" 
            data-data='${JSON.stringify(comp.data)}'
            ondragenter="onDragEnter(event)"
            ondragleave="onDragLeave(event)"
            ondragstart="onDragStart(event)">
          <div class="flex items-center space-x-3">
              <span class="text-2xl text-slate-500">${comp.icon}</span>
              <div>
                  <div class="font-medium text-slate-500">${comp.nombre}</div>
                  <div class="text-xs text-slate-400">${comp.tag}</div>
              </div>
          </div>
      </div>
  `.trim()).join('');
}

function onDragStart(event) {
  const tag = event.target.dataset.tag || event.target.closest('.draggable-component')?.dataset.tag;
  const data = event.target.dataset.data ? JSON.parse(event.target.dataset.data) : {};
  const nombre = event.target.dataset.nombre;

  event.dataTransfer.setData('text/plain', JSON.stringify({ tag, data, nombre }));
  event.dataTransfer.effectAllowed = 'move';
}

function onDragEnter(event) {
  event.preventDefault();
  event.stopPropagation();

  const target = event.target.closest('.draggable-component');

  if (target) {
    target.classList.add('border-slate-400', 'bg-blue-50', 'border-solid');
    target.classList.remove('border-dashed', 'border-slate-400');
  }
}

function onDragLeave(event) {
  event.preventDefault();
  event.stopPropagation();

  const target = event.target.closest('.draggable-component');

  if (target) {
    target.classList.remove('border-slate-400', 'bg-blue-50', 'border-solid');
    target.classList.add('border-dashed', 'border-slate-400');
  }
}

function onDrop(event) {
  event.preventDefault();
  event.stopPropagation();

  const dropTarget = event.target.closest('.draggable-component');
  if (dropTarget) {
    dropTarget.classList.remove('border-slate-400', 'bg-blue-50', 'border-solid');
    dropTarget.classList.add('border-dashed', 'border-slate-400');
  }

  let transferData;
  try {
    transferData = JSON.parse(event.dataTransfer.getData('text/plain'));
  } catch (e) { return; }

  let action = transferData.action || null;
  let id = transferData.id || null;
  let schemaData = transferData.schemaData || transferData;

  if (action === 'move' && dropTarget && dropTarget.dataset.id === id) {
    console.warn("Operación cancelada: No puedes soltar un elemento sobre sí mismo.");
    return;
  }

  let nuevoElemento;
  if (action === null) {
    nuevoElemento = {
      id: crypto.randomUUID().split('-').join(''),
      tag: schemaData.tag,
      data: { ...schemaData.data },
      children: []
    };
  } else {
    const sourcePath = findPathById(schema, id);
    if (!sourcePath) return;

    nuevoElemento = schemaData;

    removeElementAtPath(schema, sourcePath);
  }

  if (dropTarget) {
    const targetId = dropTarget.dataset.id;
    const targetPath = findPathById(schema, targetId);

    const rect = dropTarget.getBoundingClientRect();
    const relativeY = event.clientY - rect.top;
    const isAfter = relativeY > rect.height / 2;

    const targetSchema = getElementByPath(schema, targetPath);

    if (targetSchema && targetSchema.tag === 'div') {
      if (!targetSchema.children) targetSchema.children = [];
      targetSchema.children.push(nuevoElemento);
    } else {
      const parentPath = targetPath.slice(0, -1);
      const indexInParent = targetPath[targetPath.length - 1];
      const finalIndex = isAfter ? indexInParent + 1 : indexInParent;
      insertElementAtPath(schema, nuevoElemento, parentPath, finalIndex);
    }
  } else {
    schema.children.push(nuevoElemento);
  }

  renderPreview();
  updateSchemaDisplay();
}
function getElementByPath(root, path) {
  let current = root;
  for (let index of path) {
    current = current.children[index];
  }
  return current;
}
function findPathById(root, id) {
  if (root.id === id) return [];

  if (root.children) {
    for (let i = 0; i < root.children.length; i++) {
      const child = root.children[i];
      const path = findPathById(child, id);
      if (path !== null) {
        return [i, ...path];
      }
    }
  }
  return null;
}

function findPathByElement(root, element) {
  const targetId = element.closest('.draggable-component')?.dataset.id;
  if (targetId) {
    return findPathById(root, targetId);
  }
  return [];
}

function insertElementAtPath(root, element, path, index) {
  let parent = root;
  for (let i = 0; i < path.length; i++) {
    parent = parent.children[path[i]];
  }
  if (!parent.children) parent.children = [];
  parent.children.splice(index, 0, element);
}

function removeElementAtPath(root, path) {
  if (!path || path.length === 0) return;
  let parent = root;
  for (let i = 0; i < path.length - 1; i++) {
    parent = parent.children[path[i]];
  }
  const lastIndex = path[path.length - 1];
  parent.children.splice(lastIndex, 1);
}

function replace(root, element) {
  return root.children.map((v) => {
    if (v.id !== element.id) {
      v.children = replace(v, element)
      return v
    } else {
      return element
    }
  })
}

function updateElementAtPath(root, element, path) {
  let current = root;

  if (path.length > 1) {
    schema.children = replace(root, element)
  } else
    schema.children[path[0]] = element
}

function renderPreview() {
  try {
    const html = layoutTemplate(schema);
    document.getElementById('preview').innerHTML = html;

    document.querySelectorAll('#preview .draggable-component').forEach(el => {
      el.draggable = true;
      el.addEventListener('dragstart', handlePreviewDragStart);
      el.addEventListener('dragend', handlePreviewDragEnd);
      el.addEventListener('dragenter', onDragEnter);
      el.addEventListener('dragleave', onDragLeave);
    });
  } catch (e) {
    console.error('Error renderizando preview:', e);
  }
}

function handlePreviewDragStart(event) {
  const element = event.target.closest('.draggable-component');
  const schemaData = JSON.parse(element.dataset.schema);
  const id = element.dataset.id;
  event.dataTransfer.setData('text/plain', JSON.stringify({
    action: 'move',
    id,
    schemaData
  }));
}

function handlePreviewDragEnd(event) {
  renderPreview();
}

function updateSchemaDisplay() {
  document.getElementById('schema-display').textContent = JSON.stringify(schema, null, 2);
}

function showPreview(event) {
  event.preventDefault();
  event.stopPropagation();
  document.getElementById('preview').classList.remove('hidden')
  document.getElementById('schema').classList.add('hidden')
}

function showScheme(event) {
  event.preventDefault();
  event.stopPropagation();
  document.getElementById('preview').classList.add('hidden')
  document.getElementById('schema').classList.remove('hidden')
}

function selectedElement(event) {
  event.stopPropagation();

  const component = event.target.closest('.draggable-component');

  if (!component) return;

  if (selected_element) {
    selected_element.classList.remove('border-2', 'border-blue-400', 'bg-blue-50');
  }

  selected_element = component;
  selected_element.classList.add('border-2', 'border-blue-400', 'bg-blue-50');

  const element_schema = JSON.parse(selected_element.dataset.schema);

  if (element_schema) {
    const options = document.getElementById('options');
    const options_class = document.getElementById('options-class');
    const options_content = document.getElementById('options-content');
    const options_columns = document.getElementById('options-columns');
    const options_rows = document.getElementById('options-rows');

    options.classList.remove('hidden');

    options_class.value = element_schema.data.class || '';
    options_content.value = element_schema.data.content || '';

    if (element_schema.tag === 'table') {
      options_columns.value = JSON.stringify(element_schema.data.columns || []);
      options_rows.value = JSON.stringify(element_schema.data.rows || []);
    } else {
      options_columns.value = '';
      options_rows.value = '';
    }
  }
}

function saveDataOptions(event) {
  event.preventDefault();
  event.stopPropagation();
  const options_class = document.getElementById('options-class')
  const options_columns = document.getElementById('options-columns')
  const options_rows = document.getElementById('options-rows')
  const options_content = document.getElementById('options-content')
  const options = document.getElementById('options')
  const element_schema = JSON.parse(selected_element.dataset.schema)
  let data = {
    ...element_schema.data
  }
  if (options_class.value) {
    data.class = options_class.value
    options_class.value = ''
  }
  if (options_columns.value) {
    data.columns = JSON.parse(options_columns.value)
    options_columns.value = ''
  }
  if (options_rows.value) {
    data.rows = JSON.parse(options_rows.value)
    options_rows.value = ''
  }
  if (options_content.value) {
    data.content = options_content.value
    options_content.value = ''
  }
  const dataTransfer = {
    ...element_schema,
    data,
  }
  const path = findPathById(schema, selected_element.dataset.id)
  updateElementAtPath(schema, dataTransfer, path)
  options.classList.add('hidden')
  renderPreview();
  updateSchemaDisplay();
}
document.addEventListener('dragover', (e) => {
  if (e.target.closest('#dropzone')) {
    e.preventDefault();
  }
});
document.addEventListener('drop', (e) => {
  if (e.target.closest('#dropzone #preview')) {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));

    if (data.action === 'move') {
      schema.children = schema.children.map(child =>
        child.id === data.id ? { ...data.schemaData } : child
      );
    }

    renderPreview();
    updateSchemaDisplay();
  }
});
