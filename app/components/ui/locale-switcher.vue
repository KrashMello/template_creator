<template>
  <div
    class="inline-flex items-center gap-0.5 rounded-full border border-slate-200 bg-white p-0.5 shadow-sm"
    role="group"
    aria-label="Language"
  >
    <button
      v-for="loc in availableLocales"
      :key="loc.code"
      type="button"
      :class="[
        'rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40',
        locale === loc.code
          ? 'bg-slate-900 text-white shadow-sm'
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800',
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
