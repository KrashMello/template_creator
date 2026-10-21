<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
const i18nHead = useLocaleHead()
const { resolved } = useTheme()

useHead(() => ({
  htmlAttrs: {
    lang: i18nHead.value.htmlAttrs?.lang,
    dir: i18nHead.value.htmlAttrs?.dir,
    // null (unresolved "system") leaves the html unclassed: the CSS media
    // query owns the colors until the client resolves the real preference
    class: { dark: resolved.value === "dark", light: resolved.value === "light" }
  },
  link: i18nHead.value.link || [],
  meta: i18nHead.value.meta || []
}))
</script>
