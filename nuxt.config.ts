import tailwindcss from "@tailwindcss/vite"
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['./app/assets/css/main.css'],
  compatibilityDate: '2024-04-03',
  app: {
    head: {
      title: 'Layout Builder',
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
  }
})
