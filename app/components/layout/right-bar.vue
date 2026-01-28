<template>
  <div class="col-span-3 bg-slate-300 p-6 rounded-xl shadow-lg h-full overflow-auto">
    <div id="options" class=" flex flex-col gap-4 h-full">
      <h2 class="text-xl font-bold mb-4 text-slate-800">Options</h2>
      <div class="flex flex-row gap-2">
        <ui-button v-if="selectedElement">
          <span class="text-xs">
            Config
          </span>
        </ui-button>

      </div>
      <form @submit.prevent="saveDataOptions" v-if="selectedElement" class="flex flex-col gap-2">
        <ui-input v-model="options.class" title="class" placeholder="classes" />
        <ui-input v-if="options.content" v-model="options.content" type="textarea" title="texto"
          placeholder="content" />
        <ui-input v-if="options.columns" v-model="options.columns" type="textarea" title="columns"
          placeholder="columns" />
        <ui-input v-if="options.src" @change="options.src = $event.target.files[0]" title="file" placeholder="src"
          type="file" acepted="image/*" />
        <ui-input v-if="options.rows" v-model="options.rows" type="textarea" title="rows" placeholder="rows" />
        <ui-button type="submit">Save</ui-button>
        <ui-button class="bg-red-500 hover:bg-red-700 text-white font-bold p-2 rounded-lg"
          @click="deleteElement">Delete</ui-button>
      </form>
    </div>
  </div>
</template>
<script setup>
const selectedElement = computed(() => templateStore().selectedElement)
const options = computed(() => templateStore().options)
const saveDataOptions = templateStore().saveDataOptions
const deleteElement = templateStore().deleteElement
</script>
