import tailwindcss from "@tailwindcss/vite"

export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['./app/assets/css/main.css'],
  compatibilityDate: '2024-04-03',
  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/short-logo.png' }
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
})
