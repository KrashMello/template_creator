<template>
  <section class="relative overflow-hidden py-20 sm:py-24">
    <div class="pointer-events-none absolute inset-0 -z-10">
      <div class="absolute inset-x-0 top-0 h-full bg-gradient-to-b from-surface-alt to-surface" />
      <div class="absolute left-1/2 top-1/2 h-72 w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/15 blur-3xl" />
    </div>

    <div class="mx-auto w-full max-w-3xl px-4 text-center sm:px-6">
      <h2 class="text-3xl font-bold tracking-tight text-content sm:text-4xl">
        {{ t('cta.title') }}
      </h2>
      <p class="mt-3 text-base text-content-muted sm:text-lg">{{ t('cta.subtitle') }}</p>
      <UButton
        to="/demo"
        trailing-icon="i-lucide-arrow-right"
        color="primary"
        variant="solid"
        class="mt-8 h-12 rounded-full px-8 font-semibold shadow-lg shadow-primary/25 hover:shadow-xl active:scale-[0.98]"
      >
        {{ t('common.demoCta') }}
      </UButton>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()
</script>
