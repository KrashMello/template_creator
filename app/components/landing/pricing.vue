<template>
  <section id="pricing" class="scroll-mt-20 py-20 sm:py-24">
    <div class="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <div class="mx-auto max-w-2xl text-center">
        <h2 class="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {{ t('pricing.title') }}
        </h2>
        <p class="mt-3 text-base text-slate-500 sm:text-lg">{{ t('pricing.subtitle') }}</p>
      </div>

      <div class="mt-12 grid gap-6 lg:grid-cols-3">
        <div
          v-for="(plan, i) in plans"
          :key="plan.name"
          :class="[
            'relative flex flex-col rounded-2xl border bg-white p-7 transition-all',
            i === 1
              ? 'border-blue-600 shadow-xl shadow-blue-600/10 ring-1 ring-blue-600 lg:-translate-y-2'
              : 'border-slate-200 shadow-sm hover:shadow-md'
          ]"
        >
          <span
            v-if="i === 1"
            class="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm"
          >
            {{ t('pricing.popular') }}
          </span>

          <h3 class="text-sm font-bold uppercase tracking-widest text-slate-400">{{ plan.name }}</h3>
          <div class="mt-3 flex items-baseline gap-1">
            <span class="text-4xl font-extrabold tracking-tight text-slate-900">{{ plan.price }}</span>
            <span class="text-sm font-medium text-slate-400">{{ t('pricing.monthly') }}</span>
          </div>
          <p class="mt-3 text-sm leading-relaxed text-slate-500">{{ plan.desc }}</p>

          <ul class="mt-6 flex-1 space-y-3">
            <li v-for="feature in plan.features" :key="feature" class="flex items-start gap-2.5">
              <svg
                class="mt-0.5 h-4 w-4 shrink-0 text-blue-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <span class="text-sm text-slate-600">{{ feature }}</span>
            </li>
          </ul>

          <NuxtLink
            to="/demo"
            :class="[
              'mt-7 inline-flex h-11 items-center justify-center rounded-full text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 active:scale-[0.98]',
              i === 1
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700'
                : 'border border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50'
            ]"
          >
            {{ plan.cta }}
          </NuxtLink>
        </div>
      </div>

      <p class="mt-8 text-center text-xs text-slate-400">{{ t('pricing.note') }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t, tm } = useI18n()

// See features.vue: tm() only provides the shape; leaves go through t().
const plans = computed(() =>
  (tm('pricing.plans') as unknown[]).map((_, i) => ({
    name: t(`pricing.plans.${i}.name`),
    price: t(`pricing.plans.${i}.price`),
    desc: t(`pricing.plans.${i}.desc`),
    cta: t(`pricing.plans.${i}.cta`),
    features: (tm(`pricing.plans.${i}.features`) as unknown[]).map((_, j) =>
      t(`pricing.plans.${i}.features.${j}`)
    )
  }))
)
</script>
