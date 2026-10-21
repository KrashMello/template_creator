<template>
  <footer class="border-t border-content/10 bg-surface-alt">
    <div class="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <div class="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div class="lg:col-span-2">
          <div class="flex items-center gap-2.5">
            <img src="/logo-light.png" alt="" class="h-8 w-8 dark:hidden" />
            <img src="/logo-dark.png" alt="" class="hidden h-8 w-8 dark:block" />
            <span class="text-[15px] font-bold tracking-tight text-content">Template Creator</span>
          </div>
          <p class="mt-3 max-w-sm text-sm leading-relaxed text-content-muted">
            {{ t('footer.tagline') }}
          </p>
        </div>

        <div>
          <h3 class="text-xs font-bold uppercase tracking-widest text-content-muted">{{ t('footer.product') }}</h3>
          <ul class="mt-4 space-y-2.5">
            <li v-for="link in productLinks" :key="link.href">
              <a :href="link.href" class="text-sm text-content-muted transition-colors hover:text-accent">
                {{ link.label }}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 class="text-xs font-bold uppercase tracking-widest text-content-muted">{{ t('footer.demo') }}</h3>
          <ul class="mt-4 space-y-2.5">
            <li>
              <NuxtLink to="/demo" class="text-sm text-content-muted transition-colors hover:text-accent">
                {{ t('common.demoCta') }}
              </NuxtLink>
            </li>
          </ul>
          <div class="mt-5">
            <ui-locale-switcher />
          </div>
        </div>
      </div>

      <div class="mt-10 border-t border-content/10 pt-6">
        <i18n-t keypath="footer.credits" tag="p" class="text-xs text-content-muted">
          <template #link>
            <a
              href="https://krashmello.vercel.app"
              target="_blank"
              rel="noopener"
              class="font-medium text-content-muted transition-colors hover:text-accent"
            >
              Krashmello
            </a>
          </template>
        </i18n-t>
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
