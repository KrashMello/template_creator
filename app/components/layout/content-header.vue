<script setup>
// ¿que es un emit? y cual es la diferencia de usar emit con definir props
defineEmits(["select", "export"]);
</script>

<template>
  <ol class="flex flex-row gap-2 items-center w-full shadow-sm rounded-sm p-2">
    <li>
      <ui-button @click="$emit('select', 1)">
        <svg-eye-open />
      </ui-button>
    </li>
    <li>
      <ui-button @click="$emit('select', 2)">
        <svg-code />
      </ui-button>
    </li>
    <li>
      <ui-button @click="$emit('select', 3)">
        <svg-css class="size-4" />
      </ui-button>
    </li>
    <li>
      <ui-button @click="$emit('select', 4)">
        <svg-data class="size-4" />
      </ui-button>
    </li>
    <li class="ml-auto">
      <ui-button>
        <span class="text-xs"> Config </span>
        <svg-config class="size-5" />
      </ui-button>
    </li>
    <li>
      <ui-button @click="$emit('export')">
        <span class="text-xs"> Descargar PDF </span>
        <svg-download class="size-5" />
      </ui-button>
    </li>
  </ol>
</template>
