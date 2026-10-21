<template>
  <section class="relative overflow-hidden">
    <!-- Background -->
    <div class="pointer-events-none absolute inset-0 -z-10">
      <div class="absolute -top-32 left-1/2 h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-accent/20 blur-3xl" />
      <div class="absolute -left-24 top-40 h-72 w-72 rounded-full bg-nord-15/15 blur-3xl" />
      <div class="absolute -right-24 top-64 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
      <div
        class="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]"
      />
    </div>

    <div class="mx-auto w-full max-w-6xl px-4 pb-20 pt-14 text-center sm:px-6 sm:pt-20">
      <span
        class="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-surface/80 px-3 py-1 text-xs font-semibold text-accent shadow-sm"
      >
        <span class="h-1.5 w-1.5 rounded-full bg-accent/100" />
        {{ t('hero.badge') }}
      </span>

      <h1 class="mx-auto mt-6 max-w-3xl text-4xl font-extrabold tracking-tight text-content sm:text-5xl lg:text-6xl">
        {{ t('hero.title') }}
      </h1>

      <p class="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-content-muted sm:text-lg">
        {{ t('hero.subtitle') }}
      </p>

      <div class="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <NuxtLink
          to="/demo"
          class="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary-hover hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-surface active:scale-[0.98]"
        >
          {{ t('common.demoCta') }}
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </NuxtLink>
        <!-- secondary CTA ("See pricing") hidden while pricing section is disabled
        <a
          href="#pricing"
          class="inline-flex h-12 items-center rounded-full border border-content/25 bg-surface px-7 text-sm font-semibold text-content shadow-sm transition-all hover:border-content/30 hover:bg-surface-alt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-surface"
        >
          {{ t('hero.ctaSecondary') }}
        </a>
        -->
      </div>

      <p class="mt-4 text-xs font-medium text-content-muted">{{ t('hero.note') }}</p>

      <!-- Product screenshot -->
      <div class="relative mx-auto mt-14 max-w-4xl">
        <div
          class="absolute -inset-x-6 -top-6 bottom-0 rounded-[2rem] bg-gradient-to-b from-accent/20 to-transparent blur-xl"
          aria-hidden="true"
        />
        <div
          class="relative overflow-hidden rounded-2xl border border-content/10 bg-surface shadow-2xl shadow-black/20 ring-1 ring-black/5"
        >
          <div class="flex items-center gap-1.5 border-b border-content/10 bg-surface-alt px-4 py-2.5">
            <span class="h-2.5 w-2.5 rounded-full bg-red-400" />
            <span class="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span class="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <span class="ml-3 truncate text-[11px] font-medium text-content-muted">templatecreator.app/demo</span>
          </div>
          <img
            src="/screenshots/editor-preview.png"
            :alt="t('screenshots.alt.preview')"
            class="block w-full dark:hidden"
            loading="eager"
          />
          <img
            src="/screenshots/editor-preview-dark.png"
            :alt="t('screenshots.alt.preview')"
            class="hidden w-full dark:block"
            loading="eager"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useI18n()
</script>
