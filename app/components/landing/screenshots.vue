<template>
  <section id="screenshots" class="scroll-mt-20 border-y border-content/10 bg-surface-alt py-20 sm:py-24">
    <div class="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <div class="mx-auto max-w-2xl text-center">
        <h2 class="text-3xl font-bold tracking-tight text-content sm:text-4xl">
          {{ t('screenshots.title') }}
        </h2>
        <p class="mt-3 text-base text-content-muted sm:text-lg">{{ t('screenshots.subtitle') }}</p>
      </div>

      <UTabs v-model="active" :items="tabs" class="mt-8 mx-auto max-w-5xl" :ui="{ trigger: 'grow' }">
        <template #content="{ item }">
          <div class="overflow-hidden rounded-2xl border border-content/10 bg-surface shadow-xl shadow-black/20 ring-1 ring-black/5">
            <div class="flex items-center gap-1.5 border-b border-content/10 bg-surface-alt px-4 py-2.5">
              <span class="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span class="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span class="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              <span class="ml-3 text-[11px] font-medium text-content-muted">templatecreator.app/demo</span>
            </div>
            <img :src="item.src" :alt="item.alt" class="block w-full dark:hidden" loading="lazy" />
            <img :src="item.srcDark" :alt="item.alt" class="hidden w-full dark:block" loading="lazy" />
          </div>
        </template>
      </UTabs>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()

const active = ref('preview')

const tabs = computed(() => [
  { value: 'preview', label: t('screenshots.tabs.preview'), src: '/screenshots/editor-preview.png', srcDark: '/screenshots/editor-preview-dark.png', alt: t('screenshots.alt.preview') },
  { value: 'schema', label: t('screenshots.tabs.schema'), src: '/screenshots/editor-schema.png', srcDark: '/screenshots/editor-schema-dark.png', alt: t('screenshots.alt.schema') },
  { value: 'styles', label: t('screenshots.tabs.styles'), src: '/screenshots/editor-styles.png', srcDark: '/screenshots/editor-styles-dark.png', alt: t('screenshots.alt.styles') },
  { value: 'data', label: t('screenshots.tabs.data'), src: '/screenshots/editor-data.png', srcDark: '/screenshots/editor-data-dark.png', alt: t('screenshots.alt.data') }
])
</script>
