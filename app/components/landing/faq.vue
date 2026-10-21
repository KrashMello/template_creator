<template>
  <section id="faq" class="scroll-mt-20 border-t border-content/10 bg-surface-alt py-20 sm:py-24">
    <div class="mx-auto w-full max-w-3xl px-4 sm:px-6">
      <div class="text-center">
        <h2 class="text-3xl font-bold tracking-tight text-content sm:text-4xl">
          {{ t('faq.title') }}
        </h2>
        <p class="mt-3 text-base text-content-muted sm:text-lg">{{ t('faq.subtitle') }}</p>
      </div>

      <UAccordion :items="items" class="mt-10" />
    </div>
  </section>
</template>

<script setup lang="ts">
const { t, tm } = useI18n()

// See features.vue: tm() only provides the shape; leaves go through t().
const items = computed(() =>
  (tm('faq.items') as unknown[]).map((_, i) => ({
    label: t(`faq.items.${i}.q`),
    content: t(`faq.items.${i}.a`)
  }))
)
</script>
