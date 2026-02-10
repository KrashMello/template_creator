<template>
  <div
    class="min-h-screen bg-muted/30 p-4 md:p-6 transition-colors duration-300"
  >
    <div
      class="h-[calc(100vh-2rem)] md:h-[calc(100vh-3rem)] grid grid-cols-12 gap-4 md:gap-6 mx-auto max-w-[1920px] bg-background rounded-2xl border border-border overflow-hidden shadow-sm"
    >
      <slot />
    </div>
  </div>
</template>
