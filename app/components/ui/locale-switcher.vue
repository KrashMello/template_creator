<template>
  <div
    class="inline-flex items-center gap-0.5 rounded-full border border-content/10 bg-surface p-0.5 shadow-sm"
    role="group"
    aria-label="Language"
  >
    <button
      v-for="loc in availableLocales"
      :key="loc.code"
      type="button"
      :class="[
        'rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40',
        locale === loc.code
          ? 'bg-content text-surface shadow-sm'
          : 'text-content-muted hover:bg-surface-alt hover:text-content',
      ]"
      :aria-pressed="locale === loc.code"
      @click="setLocale(loc.code)"
    >
      {{ loc.code }}
    </button>
  </div>
</template>

<script setup lang="ts">
const { locale, locales, setLocale } = useI18n()

const availableLocales = computed(() =>
  locales.value.filter((loc): loc is { code: string; name: string } => typeof loc === 'object' && 'code' in loc)
)
</script>
