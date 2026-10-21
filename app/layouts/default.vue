<template>
  <div class="flex min-h-svh flex-col bg-surface text-content antialiased">
    <layout-site-header />
    <main class="flex-1">
      <slot />
    </main>
    <layout-site-footer />
  </div>
</template>
