let schema = {
  type: 'container',
  children: []
};

let selected_element = null
const componentes = [
  { tag: 'p', nombre: 'Párrafo', icon: '📄', data: { content: 'paragraph', class: "p-2 text-slate-800" } },
  { tag: 'table', nombre: 'Tabla', icon: '📊', data: { table: true, columns: ["column 1", "column 2"], rows: [['column-row-1', 'column-row-2']], class: "w-full text-sm text-left rtl:text-right text-body" } },
  { tag: 'div', nombre: 'Row', icon: '📐', data: { class: 'flex flex-row gap-4 border-b border-slate-800 min-h-7 w-full px-2' } },
  { tag: 'div', nombre: 'Columna', icon: '🧱', data: { class: 'flex flex-col gap-4 border-r border-slate-800 min-h-7 w-full ' } }
];

Handlebars.registerHelper('json', function (context) {
  return JSON.stringify(context);
});

const layoutTemplate = Handlebars.compile(`
  {{#each children}}
      {{> elemento}}
  {{/each}}
`);

Handlebars.registerPartial('elemento', `
    <{{tag}} 
        id="{{id}}"
        class="draggable-component {{data.class}}" 
        draggable="true"
        data-schema="{{json this}}"
        data-id="{{id}}"
        onclick="selectedElement(event)"
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
      <div class="componente p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 cursor-grab active:cursor-grabbing bg-gradient-to-r from-blue-50 to-indigo-50 transition-all draggable-component" 
            draggable="true" 
            data-tag="${comp.tag}" 
            data-nombre="${comp.nombre}" 
            data-data='${JSON.stringify(comp.data)}'
            ondragstart="onDragStart(event)">
          <div class="flex items-center space-x-3">
              <span class="text-2xl">${comp.icon}</span>
              <div>
                  <div class="font-medium text-gray-900">${comp.nombre}</div>
                  <div class="text-xs text-gray-500">${comp.tag}</div>
              </div>
          </div>
      </div>
  `).join('');
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
  event.currentTarget.classList.add('border-1', 'border-blue-400', 'bg-blue-50');
}

function onDragLeave(event) {
  event.preventDefault();
  event.currentTarget.classList.remove('border-1', 'border-blue-400', 'bg-blue-50');
}

function onDrop(event) {
  event.preventDefault();
  event.currentTarget.classList.remove('border-2', 'border-blue-400', 'bg-blue-50');

  let transferData = JSON.parse(event.dataTransfer.getData('text/plain'));
  let action = null
  let id = null
  if (transferData.schemaData) {
    id = transferData.id
    action = transferData.action
    transferData = transferData.schemaData
  }
  if (action === null) {
    // Crear nuevo elemento en schema
    const nuevoElemento = {
      id: crypto.randomUUID().split('-').join(''),
      tag: transferData.tag,
      data: {
        ...transferData.data,
        class: transferData.data.class ? transferData.data.class : ""
      },
      children: []
    };
    // Insertar en posición del mouse (simplificado)
    schema.children.push(nuevoElemento);
  } else if (action === 'move') {
    const sourcePath = findPathById(schema, id);
    const targetPath = findPathByElement(schema, event.target);
    const rect = document.getElementById(id).getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const isBefore = x < rect.width / 2 || y < rect.height / 2;
    if (sourcePath && targetPath && targetPath.join('') !== sourcePath.join('')) {
      removeElementAtPath(schema, sourcePath);
      insertElementAtPath(schema, transferData, findPathByElement(schema, event.target), isBefore ? 0 : 1);
    }
  }
  renderPreview();
  updateSchemaDisplay();
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

function removeElementAtPath(root, path) {
  if (path.length === 0) return;

  let current = root;
  for (let i = 0; i < path.length - 1; i++) {
    current = current.children[path[i]];
  }

  const lastIndex = path[path.length - 1];
  current.children.splice(lastIndex, 1);
}

function insertElementAtPath(root, element, path, position) {
  let current = root;
  if (path.length !== 0) {
    for (let i = 0; i < path.length; i++) {
      current = current.children[path[i]];
    }
    if (!current.children) current.children = [];
  }
  current.children.splice(position, 0, element);
}

function updateElementAtPath(root, element, path) {
  let current = root;

  if (path.length > 1) {
    for (let i = 0; i < path.length; i++) {
      current = current.children[path[i]];
    }
  } else
    schema[path[0]] = element
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
  document.getElementById('preview').classList.remove('hidden')
  document.getElementById('schema').classList.add('hidden')
}

function showScheme(event) {
  event.preventDefault();
  document.getElementById('preview').classList.add('hidden')
  document.getElementById('schema').classList.remove('hidden')
}

function selectedElement(event) {
  event.preventDefault();
  selected_element = event.target
  selected_element.classList.add('border-2', 'border-blue-400', 'bg-blue-50')
  const element_schema = JSON.parse(selected_element.dataset.schema)
  if (element_schema && ['p', 'table'].includes(element_schema.tag)) {
    const options_class = document.getElementById('options-class')
    const options_content = document.getElementById('options-content')
    const options_columns = document.getElementById('options-columns')
    const options_rows = document.getElementById('options-rows')
    const options = document.getElementById('options')
    options.classList.remove('hidden')
    if (element_schema.data.class) {
      options_class.value = element_schema.data.class
    }
    if (element_schema.data.content) {
      options_content.value = element_schema.data.content
    }
    if (element_schema.data.columns) {
      options_columns.value = JSON.stringify(element_schema.data.columns)
    }
    if (element_schema.data.rows) {
      options_rows.value = JSON.stringify(element_schema.data.rows)
    }
  }
}

function saveDataOptions(event) {
  event.preventDefault();
  const options_class = document.getElementById('options-class')
  const options_columns = document.getElementById('options-columns')
  const options_rows = document.getElementById('options-rows')
  const options_content = document.getElementById('options-content')
  const options = document.getElementById('options')
  const element_schema = JSON.parse(selected_element.dataset.schema)
  let data = {
    ...element_schema.data
  }
  if (options_class) {
    data.class = options_class.value
    options_class.value = ''
  }
  if (options_columns) {
    data.columns = options_columns.value
    options_columns.value = ''
  }
  if (options_rows) {
    data.rows = options_rows.value
    options_rows.value = ''
  }
  if (options_content) {
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
