<template>
  <header class="sticky top-0 z-40 border-b border-content/10 bg-surface/85 backdrop-blur-md">
    <div class="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
      <NuxtLink to="/" class="flex items-center gap-2.5">
        <img src="/logo-light.png" alt="" class="h-8 w-8 dark:hidden" />
        <img src="/logo-dark.png" alt="" class="hidden h-8 w-8 dark:block" />
        <span class="hidden text-[15px] font-bold tracking-tight text-content sm:inline">Template Creator</span>
      </NuxtLink>

      <nav class="hidden items-center gap-7 md:flex">
        <a
          v-for="link in links"
          :key="link.href"
          :href="link.href"
          class="text-sm font-medium text-content-muted transition-colors hover:text-content"
        >
          {{ link.label }}
        </a>
      </nav>

      <div class="flex items-center gap-2 sm:gap-3">
        <ui-theme-toggle />
        <ui-locale-switcher />
        <NuxtLink
          to="/demo"
          class="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full bg-primary px-3.5 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/20 transition-all hover:bg-primary-hover hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-surface active:scale-[0.98] sm:px-4"
        >
          {{ t('common.demoCta') }}
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
  { href: '#faq', label: t('nav.faq') }
])
</script>
