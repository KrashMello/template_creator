const elements = {
  row: () => {
    let element = document.createElement('div')
    element.id = crypto.randomUUID()
    element.classList.add('bg-slate-500', 'text-white', 'px-4', 'py-2', 'rounded-md', 'flex-row', 'gap-1', 'flex', 'w-full', 'min-h-32')
    element.ondrop = dropHandler
    element.ondragover = dragoverHandler
    element.ondragenter = dragEnterHandler
    element.ondragleave = dragLeaveHandler
    element.ondragstart = dragStartInElementHandler
    element.draggable = true
    return element
  },
  col: () => {
    let element = document.createElement('div')
    element.id = crypto.randomUUID()
    element.classList.add('bg-slate-300', 'text-white', 'px-4', 'py-2', 'rounded-md', 'flex-col', 'gap-1', 'flex', 'w-full', 'min-h-32')
    element.ondrop = dropHandler
    element.ondragover = dragoverHandler
    element.ondragenter = dragEnterHandler
    element.ondragleave = dragLeaveHandler
    element.ondragstart = dragStartInElementHandler
    element.draggable = true
    return element
  }
}
let selected_element = null
function dragstartHandler(ev) {
  const type = ev.target.id
  console.log(ev.target.id)
  selected_element = elements[type]()
}
function dragStartInElementHandler(ev) {
  ev.preventDefault();
  console.log(ev.target.id)
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
  if (selected_element != null) {
    ev.target.appendChild(selected_element)
    selected_element = null
    return
  }
  if (ev.dataTransfer.getData("element") != '') {
    console.log(ev.dataTransfer.getData("element"))
    ev.target.appendChild(document.getElementById(ev.dataTransfer.getData("element")))
    return
  }
}
