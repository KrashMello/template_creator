<template>
  <landing-hero />
  <landing-features />
  <landing-screenshots />
  <!-- pricing hidden temporarily
  <landing-pricing />
  -->
  <landing-faq />
  <landing-cta />
</template>

<script setup lang="ts">
const { t } = useI18n()

useHead(() => ({
  title: t('meta.title'),
  meta: [{ name: 'description', content: t('meta.description') }]
}))
</script>
