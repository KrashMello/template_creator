<template>
  <header class="sticky top-0 z-40 border-b border-content/10 bg-surface/85 backdrop-blur-md">
    <div class="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
      <NuxtLink to="/" class="flex items-center gap-2.5">
        <img src="/logo-light.png" alt="" class="h-8 w-8 dark:hidden" />
        <img src="/logo-dark.png" alt="" class="hidden h-8 w-8 dark:block" />
        <span class="hidden text-[15px] font-bold tracking-tight text-content sm:inline">Template Creator</span>
      </NuxtLink>

      <nav class="hidden items-center gap-7 md:flex">
        <ULink
          v-for="link in links"
          :key="link.href"
          :href="link.href"
          class="text-sm font-medium text-content-muted transition-colors hover:text-content"
        >
          {{ link.label }}
        </ULink>
      </nav>

      <div class="flex items-center gap-2 sm:gap-3">
        <ui-theme-toggle />
        <ui-locale-switcher />
        <UButton
          to="/demo"
          trailing-icon="i-lucide-arrow-right"
          color="primary"
          variant="solid"
          class="h-9 rounded-full px-3.5 font-semibold shadow-sm shadow-primary/25 hover:shadow-md active:scale-[0.98] sm:px-4"
        >
          {{ t('common.demoCta') }}
        </UButton>
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
