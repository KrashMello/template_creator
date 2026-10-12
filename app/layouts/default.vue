<template>
  <div class="flex min-h-svh flex-col bg-white text-slate-900 antialiased">
    <layout-site-header />
    <main class="flex-1">
      <slot />
    </main>
    <layout-site-footer />
  </div>
</template>
