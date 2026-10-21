<template>
  <button
    type="button"
    :title="t('common.theme')"
    :aria-label="t('common.theme')"
    class="inline-flex h-9 w-9 items-center justify-center rounded-full text-content-muted transition-colors hover:bg-surface-alt hover:text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
    @click="toggle()"
  >
    <!-- sun: shown while dark, click goes back to light -->
    <svg
      v-if="isDark"
      xmlns="http://www.w3.org/2000/svg"
      class="size-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M12 4V2M12 20v-2M4 12H2M20 12h-2M5.64 5.64l-1.42-1.42M19.78 19.78l-1.42-1.42M18.36 5.64l1.42-1.42M4.22 19.78l1.42-1.42" />
      <circle cx="12" cy="12" r="4" />
    </svg>
    <!-- moon: shown while light, click goes to dark -->
    <svg
      v-else
      xmlns="http://www.w3.org/2000/svg"
      class="size-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" />
    </svg>
  </button>
</template>

<script setup lang="ts">
const { t } = useI18n();
const { isDark, toggle } = useTheme();
</script>
