<template>
  <section id="faq" class="scroll-mt-20 border-t border-slate-200 bg-slate-50 py-20 sm:py-24">
    <div class="mx-auto w-full max-w-3xl px-4 sm:px-6">
      <div class="text-center">
        <h2 class="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {{ t('faq.title') }}
        </h2>
        <p class="mt-3 text-base text-slate-500 sm:text-lg">{{ t('faq.subtitle') }}</p>
      </div>

      <div class="mt-10 space-y-3">
        <details
          v-for="item in items"
          :key="item.q"
          class="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm open:border-blue-200 open:shadow-md transition-all"
        >
          <summary
            class="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-semibold text-slate-800 transition-colors hover:text-blue-700 [&::-webkit-details-marker]:hidden"
          >
            {{ item.q }}
            <svg
              class="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-45"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              aria-hidden="true"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </summary>
          <p class="border-t border-slate-100 px-5 py-4 text-sm leading-relaxed text-slate-500">
            {{ item.a }}
          </p>
        </details>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t, tm } = useI18n()

// See features.vue: tm() only provides the shape; leaves go through t().
const items = computed(() =>
  (tm('faq.items') as unknown[]).map((_, i) => ({
    q: t(`faq.items.${i}.q`),
    a: t(`faq.items.${i}.a`)
  }))
)
</script>
