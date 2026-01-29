import tailwindcss from "@tailwindcss/vite"

export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: true,
  css: ['./app/assets/css/main.css'],
  compatibilityDate: '2024-04-03',
  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE_URL || '/api' // Para entornos separados
    }
  },
  nitro: {
    preset: 'vercel', // Auto-detect en Vercel
  },
  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/short-logo.png' }
      ],
      script: [
        { src: 'https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4', tagPosition: 'bodyClose' }
      ],
      title: 'template creator',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ]
    }
  },
  vite: {
    plugins: [
      tailwindcss()
    ]
  },
  modules: ['@pinia/nuxt', 'pinia-plugin-persistedstate'],
  pinia: {
    storesDirs: ['./stores/**'],
  },
  piniaPluginPersistedstate: {
    storage: 'sessionStorage',
    maxAge: 24 * 60 * 60,
    debug: true,
  },
})
