<template>
  <footer class="border-t border-slate-200 bg-slate-50">
    <div class="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <div class="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div class="lg:col-span-2">
          <div class="flex items-center gap-2.5">
            <img src="/short-logo.png" alt="" class="h-8 w-8 rounded-lg ring-1 ring-slate-200" />
            <span class="text-[15px] font-bold tracking-tight text-slate-900">Template Creator</span>
          </div>
          <p class="mt-3 max-w-sm text-sm leading-relaxed text-slate-500">
            {{ t('footer.tagline') }}
          </p>
        </div>

        <div>
          <h3 class="text-xs font-bold uppercase tracking-widest text-slate-400">{{ t('footer.product') }}</h3>
          <ul class="mt-4 space-y-2.5">
            <li v-for="link in productLinks" :key="link.href">
              <a :href="link.href" class="text-sm text-slate-600 transition-colors hover:text-blue-600">
                {{ link.label }}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 class="text-xs font-bold uppercase tracking-widest text-slate-400">{{ t('footer.demo') }}</h3>
          <ul class="mt-4 space-y-2.5">
            <li>
              <NuxtLink to="/demo" class="text-sm text-slate-600 transition-colors hover:text-blue-600">
                {{ t('nav.openDemo') }}
              </NuxtLink>
            </li>
          </ul>
          <div class="mt-5">
            <ui-locale-switcher />
          </div>
        </div>
      </div>

      <div class="mt-10 border-t border-slate-200 pt-6">
        <p class="text-xs text-slate-400">{{ t('footer.rights', { year: new Date().getFullYear() }) }}</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const { t } = useI18n()

const productLinks = computed(() => [
  { href: '#features', label: t('nav.features') },
  { href: '#screenshots', label: t('nav.screenshots') },
  { href: '#faq', label: t('nav.faq') }
])
</script>
