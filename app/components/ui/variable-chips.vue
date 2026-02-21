<template>
  <span class="inline-flex items-center gap-1 flex-wrap leading-relaxed">
    <template v-for="(part, i) in parts" :key="i">
      <!-- Variable chip -->
      <span
        v-if="part.isVar"
        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-blue-100 text-blue-700 border border-blue-200 select-none"
      >
        <span class="text-blue-400 text-[10px]">&#123;&#123;</span>
        {{ part.key }}
        <span class="text-blue-400 text-[10px]">&#125;&#125;</span>
      </span>
      <!-- Plain text -->
      <span v-else class="text-inherit">{{ part.text }}</span>
    </template>
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ text: string }>();

interface Part {
  isVar: boolean;
  text?: string;
  key?: string;
}

const parts = computed<Part[]>(() => {
  const result: Part[] = [];
  const regex = /\{\{([^}]+)\}\}/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(props.text)) !== null) {
    if (match.index > lastIndex) {
      result.push({ isVar: false, text: props.text.slice(lastIndex, match.index) });
    }
    result.push({ isVar: true, key: match[1].trim() });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < props.text.length) {
    result.push({ isVar: false, text: props.text.slice(lastIndex) });
  }
  return result;
});
</script>
