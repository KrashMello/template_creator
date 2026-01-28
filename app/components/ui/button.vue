<template>
  <button class="bg-slate-500 hover:bg-slate-700 text-white flex items-center justify-center font-bold p-2 rounded-lg"
    @click="props.click">
    <slot />
  </button>
</template>
<script setup>
const props = defineProps(['click'])
</script>
