<template>
  <header class="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
    <div class="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
      <NuxtLink to="/" class="group flex items-center gap-2.5">
        <img
          src="/short-logo.png"
          alt=""
          class="h-8 w-8 rounded-lg shadow-sm ring-1 ring-slate-200 transition-transform group-hover:scale-105"
        />
        <span class="hidden text-[15px] font-bold tracking-tight text-slate-900 sm:inline">Template Creator</span>
      </NuxtLink>

      <nav class="hidden items-center gap-7 md:flex">
        <a
          v-for="link in links"
          :key="link.href"
          :href="link.href"
          class="text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
        >
          {{ link.label }}
        </a>
      </nav>

      <div class="flex items-center gap-2 sm:gap-3">
        <ui-locale-switcher />
        <NuxtLink
          to="/demo"
          class="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full bg-blue-600 px-3.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition-all hover:bg-blue-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 active:scale-[0.98] sm:px-4"
        >
          {{ t('nav.openDemo') }}
          <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </NuxtLink>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const { t } = useI18n()

const links = computed(() => [
  { href: '#features', label: t('nav.features') },
  { href: '#screenshots', label: t('nav.screenshots') },
  { href: '#pricing', label: t('nav.pricing') },
  { href: '#faq', label: t('nav.faq') }
])
</script>
