<template>
  <UButton
    :icon="isDark ? 'i-lucide-sun' : 'i-lucide-moon'"
    color="neutral"
    variant="ghost"
    square
    class="rounded-full"
    :title="t('common.theme')"
    :aria-label="t('common.theme')"
    @click="toggle()"
  />
</template>

<script setup lang="ts">
const { t } = useI18n();
const { isDark, toggle } = useTheme();
</script>
