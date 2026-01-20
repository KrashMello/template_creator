<template>
  <div
    class="componente px-4 py-2 rounded-lg hover:border-blue-400 cursor-grab active:cursor-grabbing bg-gradient-to-r from-blue-50 to-indigo-50 transition-all draggable-component"
    draggable="true" :data-tag="props.tag" :data-nombre="props.name" :data-data="JSON.stringify(props.data)"
    @dragstart="onDragStart">
    <div class="flex items-center space-x-3">
      <component class="text-2xl text-slate-500" :is="props.icon" />
      <div>
        <div class="font-medium text-slate-500"> {{ props.name }}</div>
        <div class="text-xs text-slate-400"> {{ props.tag }}
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
type propsType = {
  name: string, icon: any, tag: string, data: {
    table?: boolean, columns?: string[],
    content?: string, class?: string, row?: string
  }
}
const props = defineProps<propsType>()
const onDragStart = (event) => {
  const tag = event.target.dataset.tag || event.target.closest('.draggable-component')?.dataset.tag
  const data = event.target.dataset.data ? JSON.parse(event.target.dataset.data) : {}
  const nombre = event.target.dataset.nombre

  event.dataTransfer.setData('text/plain', JSON.stringify({ tag, data, nombre }))
  event.dataTransfer.effectAllowed = 'move'
}

</script>
