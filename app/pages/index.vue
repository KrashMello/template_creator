<template>
  <div class="flex h-screen w-screen overflow-hidden bg-slate-100">
    <layout-left-bar />
    <layout-center-container class="flex-1 min-w-0" />
    <layout-right-bar />
  </div>
</template>

<script setup lang="ts">
import { templateStore } from '../stores/templateStore'

// No onMounted DOM hacks needed — everything is reactive
const store = templateStore()
</script>
