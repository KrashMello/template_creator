<template>
  <section id="screenshots" class="scroll-mt-20 border-y border-slate-200 bg-slate-50 py-20 sm:py-24">
    <div class="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <div class="mx-auto max-w-2xl text-center">
        <h2 class="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {{ t('screenshots.title') }}
        </h2>
        <p class="mt-3 text-base text-slate-500 sm:text-lg">{{ t('screenshots.subtitle') }}</p>
      </div>

      <div class="mt-8 flex flex-wrap items-center justify-center gap-2">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          :class="[
            'rounded-full px-4 py-1.5 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
            active === tab.key
              ? 'bg-slate-900 text-white shadow-sm'
              : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
          ]"
          :aria-pressed="active === tab.key"
          @click="active = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <div
        class="relative mx-auto mt-8 max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 ring-1 ring-slate-900/5"
      >
        <div class="flex items-center gap-1.5 border-b border-slate-200 bg-slate-50 px-4 py-2.5">
          <span class="h-2.5 w-2.5 rounded-full bg-red-400" />
          <span class="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span class="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <span class="ml-3 text-[11px] font-medium text-slate-400">templatecreator.app/demo</span>
        </div>
        <img
          v-for="tab in tabs"
          v-show="active === tab.key"
          :key="tab.key"
          :src="tab.src"
          :alt="tab.alt"
          class="block w-full"
          loading="lazy"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()

const active = ref('preview')

const tabs = computed(() => [
  { key: 'preview', label: t('screenshots.tabs.preview'), src: '/screenshots/editor-preview.png', alt: t('screenshots.alt.preview') },
  { key: 'schema', label: t('screenshots.tabs.schema'), src: '/screenshots/editor-schema.png', alt: t('screenshots.alt.schema') },
  { key: 'styles', label: t('screenshots.tabs.styles'), src: '/screenshots/editor-styles.png', alt: t('screenshots.alt.styles') },
  { key: 'data', label: t('screenshots.tabs.data'), src: '/screenshots/editor-data.png', alt: t('screenshots.alt.data') }
])
</script>
