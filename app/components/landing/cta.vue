<template>
  <section class="relative overflow-hidden py-20 sm:py-24">
    <div class="pointer-events-none absolute inset-0 -z-10">
      <div class="absolute inset-x-0 top-0 h-full bg-gradient-to-b from-slate-50 to-white" />
      <div class="absolute left-1/2 top-1/2 h-72 w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-200/40 blur-3xl" />
    </div>

    <div class="mx-auto w-full max-w-3xl px-4 text-center sm:px-6">
      <h2 class="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        {{ t('cta.title') }}
      </h2>
      <p class="mt-3 text-base text-slate-500 sm:text-lg">{{ t('cta.subtitle') }}</p>
      <NuxtLink
        to="/demo"
        class="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-blue-600 px-8 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-700 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 active:scale-[0.98]"
      >
        {{ t('common.demoCta') }}
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()
</script>
