import tailwindcss from "@tailwindcss/vite"

const baseUrl =
  process.env.NUXT_PUBLIC_BASE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: true,
  css: ['~/assets/css/main.css'],
  compatibilityDate: '2026-10-12',
  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE_URL || '/api', // Para entornos separados
      baseUrl
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
      title: 'Template Creator',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Template Creator — constructor visual de plantillas PDF con drag & drop, datos dinámicos y exportación en un clic.'
        }
      ]
    }
  },
  vite: {
    plugins: [
      tailwindcss()
    ]
  },
  modules: ['@pinia/nuxt', 'pinia-plugin-persistedstate', '@nuxtjs/i18n'],
  i18n: {
    locales: [
      { code: 'es', language: 'es-ES', name: 'Español', file: 'es.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' }
    ],
    defaultLocale: 'es',
    strategy: 'no_prefix',
    lazy: true,
    baseUrl,
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'tc_locale',
      alwaysRedirect: false,
      redirectOn: 'root'
    }
  },
  pinia: {
    storesDirs: ['./stores/**'],
  },
  piniaPluginPersistedstate: {
    storage: 'sessionStorage',
    maxAge: 24 * 60 * 60,
    debug: true,
  },
})
