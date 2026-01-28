<template>
  <div class="col-span-3 bg-slate-300 p-6 rounded-xl shadow-lg h-full overflow-auto">
    <div id="options" class=" flex flex-col gap-4 h-full">
      <h2 class="text-xl font-bold mb-4 text-slate-800">Options</h2>
      <div class="flex flex-row gap-2">
        <ui-button @click="() => { return; }">
          <span class="text-xs">
            Config
          </span>
        </ui-button>

      </div>
      <form @submit.prevent="saveDataOptions" :class="`${!selectedElement ? 'hidden' : 'flex'} flex-col gap-2`">
        <div class="flex flex-col gap-2">
          <label for="options-class">class</label>
          <input type="text" id="options-class" v-model="options.class"
            class="bg-slate-50 p-2 rounded-lg text-sm font-mono text-slate-700 overflow-auto text-xs"
            placeholder="classes">
        </div>
        <div v-if="options.content" :class="`flex flex-col gap-2`">
          <label for="options-content">texto</label>
          <textarea type="text" id="options-content" v-model="options.content"
            class="bg-slate-50 p-2 rounded-lg text-sm font-mono text-slate-700 overflow-auto text-xs"
            placeholder="content"></textarea>
        </div>
        <div v-if="options.columns" :class="` flex-col gap-2 flex`">
          <label for="options-columns">columns</label>
          <textarea id="options-columns" v-model="options.columns"
            class="bg-slate-50 p-2 rounded-lg text-sm font-mono text-slate-700 overflow-auto text-xs"
            placeholder="columns"></textarea>
        </div>
        <div v-if="options.src" :class="`flex flex-col gap-2`">
          <label for="options-src">file</label>
          <input id="options-src" type="file" acepted="image/*"
            class="bg-slate-50 p-2 rounded-lg text-sm font-mono text-slate-700 overflow-auto text-xs"
            v-on:change="options.src = $event.target.files[0]" placeholder="src" />
        </div>
        <div v-if="options.rows" :class="` flex flex-col gap-2`">
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
const selectedElement = computed(() => templateStore().selectedElement)
const options = computed(() => templateStore().options)
const saveDataOptions = templateStore().saveDataOptions
const deleteElement = templateStore().deleteElement
</script>
