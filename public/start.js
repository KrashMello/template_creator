
let data_object = JSON.parse('{}')
document.addEventListener('DOMContentLoaded', async function () {
  const object = document.getElementById('object-text-area')
  data_object = JSON.parse(object.value)
  object.addEventListener('input', function (e) {
    data_object = JSON.parse(e.target.value)
  })
})

const elements = {
  row: () => {
    const class_list = ['bg-slate-500', 'text-white', 'px-4', 'py-2', 'rounded-md', 'flex-row', 'gap-1', 'flex', 'w-full', 'min-h-32']
    const element_text = `<div
id="${crypto.randomUUID()}" 
class="${class_list.join(' ')}"
ondrop="dropHandler(event)"
ondragover="dragoverHandler(event)"
ondragenter="dragEnterHandler(event)"
ondragleave="dragLeaveHandler(event)"
ondragstart="dragStartInElementHandler(event)"
draggable="true"
>
</div>
`
    return element_text
  },
  col: () => {
    const class_list = ['bg-slate-300', 'text-white', 'px-4', 'py-2', 'rounded-md', 'flex-col', 'gap-1', 'flex', 'w-full', 'min-h-32']
    const element_text = `<div
id="${crypto.randomUUID()}" 
class="${class_list.join(' ')}"
ondrop="dropHandler(event)"
ondragover="dragoverHandler(event)"
ondragenter="dragEnterHandler(event)"
ondragleave="dragLeaveHandler(event)"
ondragstart="dragStartInElementHandler(event)"
draggable="true"
>
</div>
`
    return element_text
  },
  paragraph: () => {
    const class_list = ['bg-slate-300', 'text-white', 'px-4', 'py-2', 'rounded-md', 'flex-col', 'gap-1', 'flex', 'w-full', 'min-h-32']
    const element_text = `<div
id="${crypto.randomUUID()}" 
data-key="title"
data-value="paragraph"
class="${class_list.join(' ')}"
ondrop="dropHandler(event)"
ondragover="dragoverHandler(event)"
ondragenter="dragEnterHandler(event)"
ondragleave="dragLeaveHandler(event)"
ondragstart="dragStartInElementHandler(event)"
onclick="paragraphSelected(event)"
draggable="true"
>
{{title}}
</div>
`
    return element_text
  }
}
let selected_element = null
let frame_text = ''
function dragstartHandler(ev) {
  const type = ev.target.id
  selected_element = elements[type]()
}
function dragStartInElementHandler(ev) {
  ev.dataTransfer.setData("element", ev.target.id);
}
function dragEnterHandler(ev) {
  ev.target.classList.add('border-2', 'border-orange-500')
}
function dragLeaveHandler(ev) {
  ev.target.classList.remove('border-2', 'border-orange-500')
}
function dragoverHandler(ev) {
  ev.preventDefault();
}
function dropHandler(ev) {
  ev.preventDefault();
  ev.target.classList.remove('border-2', 'border-orange-500')
  let frame = document.getElementById('frame')
  const parser = new DOMParser();
  if (selected_element != null) {
    let doc = parser.parseFromString(selected_element, 'text/html');
    let element = doc.body.firstElementChild
    ev.target.appendChild(element)
    selected_element = null
  } else if (ev.dataTransfer.getData("element") != '') {
    ev.target.appendChild(document.getElementById(ev.dataTransfer.getData("element")))
  }
}
let show_preview = false
function previewHandler(ev) {
  ev.preventDefault();
  show_preview = !show_preview
  if (show_preview) {
    let frame = document.getElementById('frame')
    let preview = document.getElementById('preview')
    frame.classList.add('hidden')
    frame.classList.remove('flex')
    preview.classList.remove('hidden')
    preview.classList.add('flex')
    const parser = new DOMParser();
    const template = Handlebars.compile(frame.outerHTML)
    let doc = parser.parseFromString(template(data_object), 'text/html');
    let element = doc.body.firstElementChild

    preview.replaceChildren(...element.childNodes)
  } else {
    frame.classList.remove('hidden')
    frame.classList.add('flex')
    preview.classList.add('hidden')
    preview.classList.remove('flex')
    preview.replaceChildren()
  }
}
selected_element = null
function paragraphSelected(ev) {
  selected_element = ev.target
  const var_key = document.getElementById('var-key')
  const var_value = document.getElementById('var-value')
  var_key.value = ev.target.dataset.key
  var_value.value = ev.target.dataset.value
}
function saveVar(ev) {
  ev.preventDefault();
  const var_key = document.getElementById('var-key')
  const var_value = document.getElementById('var-value')
  data_object[var_key.value] = var_value.value
  selected_element.innerText = `{{${var_key.value}}}`
  var_key.value = ''
  var_value.value = ''

}
function frameChange(ev) {
  frame_text = ev.target.value
  // console.log(frame_text)
}
