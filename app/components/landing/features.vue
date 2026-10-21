<template>
  <section id="features" class="scroll-mt-20 py-20 sm:py-24">
    <div class="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <div class="mx-auto max-w-2xl text-center">
        <h2 class="text-3xl font-bold tracking-tight text-content sm:text-4xl">
          {{ t('features.title') }}
        </h2>
        <p class="mt-3 text-base text-content-muted sm:text-lg">{{ t('features.subtitle') }}</p>
      </div>

      <div class="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="(item, i) in items"
          :key="item.title"
          class="group relative rounded-2xl border border-content/10 bg-surface p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-accent/40 hover:shadow-lg hover:shadow-primary/10"
        >
          <div
            :class="[
              'flex h-11 w-11 items-center justify-center rounded-xl transition-colors',
              accents[i % accents.length].bg
            ]"
          >
            <svg
              class="h-5 w-5"
              :class="accents[i % accents.length].fg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path :d="icons[i % icons.length]" />
            </svg>
          </div>
          <h3 class="mt-4 text-base font-bold text-content">{{ item.title }}</h3>
          <p class="mt-2 text-sm leading-relaxed text-content-muted">{{ item.desc }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t, tm } = useI18n()

// tm() can return vue-i18n message ASTs instead of plain strings on the client,
// so use it only for the length and resolve each leaf through t().
const items = computed(() =>
  (tm('features.items') as unknown[]).map((_, i) => ({
    title: t(`features.items.${i}.title`),
    desc: t(`features.items.${i}.desc`)
  }))
)

const icons = [
  // drag & drop
  'M9 3v4M15 3v4M9 17v4M15 17v4M3 9h4M3 15h4M17 9h4M17 15h4M7 7l10 10M17 7L7 17',
  // layout zones
  'M3 5h18v5H3zM3 14h18v5H3z',
  // braces / data
  'M8 3H6a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2 2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h2M16 3h2a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2 2 2 0 0 0-2 2v4a2 2 0 0 1-2 2h-2',
  // palette
  'M12 3a9 9 0 1 0 0 18h1.5a2.5 2.5 0 0 0 0-5H12a2 2 0 0 1 0-4h6.5A2.5 2.5 0 0 0 21 9.5 9 9 0 0 0 12 3zM7.5 10h.01M9.5 6.5h.01M14.5 6h.01M17 9h.01',
  // export pdf
  'M12 3v12M7 10l5 5 5-5M4 19h16',
  // history
  'M3 7v6h6M3.5 13a8.5 8.5 0 1 0 2.2-6.4L3 9'
]

const accents = [
  { bg: 'bg-blue-100 dark:bg-blue-950/50', fg: 'text-blue-700 dark:text-blue-300' },
  { bg: 'bg-indigo-100 dark:bg-indigo-950/50', fg: 'text-indigo-700 dark:text-indigo-300' },
  { bg: 'bg-emerald-100 dark:bg-emerald-950/50', fg: 'text-emerald-700 dark:text-emerald-300' },
  { bg: 'bg-amber-100 dark:bg-amber-950/50', fg: 'text-amber-700 dark:text-amber-300' },
  { bg: 'bg-rose-100 dark:bg-rose-950/50', fg: 'text-rose-700 dark:text-rose-300' },
  { bg: 'bg-sky-100 dark:bg-sky-950/50', fg: 'text-sky-700 dark:text-sky-300' }
]
</script>
