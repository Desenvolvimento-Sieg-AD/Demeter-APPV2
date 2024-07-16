// https://nuxt.com/docs/api/configuration/nuxt-config
import { resolve } from 'path'
import themes from './src/utils/themes'

export default defineNuxtConfig({
  devtools: {
    enabled: false
  },
  typescript: {
    shim: false
  },
  ssr: false,
  components: true,
  srcDir: 'src',
  app: {
    head: {
      titleTemplate: 'Sieg Pagamentos',
      htmlAttrs: { lang: 'pt-br' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'description', name: 'description', content: '' },
        { name: 'format-detection', content: 'telephone=no' }
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/public/favicon.ico' }]
    }
  },
  css: [
    '@/assets/css/main.css',
    '@/assets/css/fonts.css',
    'vuetify/lib/styles/main.sass',
    '@mdi/font/css/materialdesignicons.min.css',
    'devextreme/dist/css/dx.dark.css',
    'devextreme/dist/css/dx.light.css'
  ],
  plugins: ['@/plugins/maska'],
  modules: ['@pinia/nuxt', 'dayjs-nuxt', 'vuetify-nuxt-module', '@pinia-plugin-persistedstate/nuxt'],
  build: {
    transpile: ['vuetify']
  },
  vite: {
    define: {
      'process.env.DEBUG': false
    },
    resolve: {
      alias: {
        '@api': resolve(__dirname, 'src/api')
      }
    }
  },
  runtimeConfig: {
    public: {
      apiURL: process.env.NUXT_API_URL,
      LOG_PATH: process.env.NUXT_LOG_PATH,
      PAGAMENTO_PATH: process.env.NUXT_PAGAMENTO_PATH,
      PAGAMENTO_PRIVADO_PATH: process.env.NUXT_PAGAMENTO_PRIVADO_PATH
    }
  },
  vuetify: {
    vuetifyOptions: {
      labComponents: ['VTimePicker'],
      theme: {
        defaultTheme: 'light',
        themes: {
          dark: {
            dark: true,
            colors: themes.dark
          },
          light: {
            dark: false,
            colors: themes.light
          }
        }
      }
    }
  },
  dayjs: {
    locales: ['pt-br'],
    defaultLocale: 'pt-br',
    defaultTimezone: 'America/Bahia',
    plugins: ['relativeTime', 'utc', 'timezone', 'localizedFormat']
  }
})
