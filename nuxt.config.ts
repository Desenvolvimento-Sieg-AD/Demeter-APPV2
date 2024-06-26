// https://nuxt.com/docs/api/configuration/nuxt-config
import { resolve } from 'path'

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
      PAGAMENTO_PATH: process.env.NUXT_PAGAMENTO_PATH
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
            colors: {
              primary: '#118B9F',
              secondary: '#F68A1A',
              danger: '#D9534F',
              info: '#5BC0DE',
              success: '#5CB85C',
              warning: '#F0AD4E',
              light: '#636363',
              muted: '#CCCCCC',
              dark: '#343A40',
              purple: '#6F42C1',
              graylighter: '#2C2C2C',
              graylight: '#3C3C3C',
              gray: '#4C4C4C',
              graydark: '#5C5C5C',
              black: '#000000'
            }
          },
          light: {
            dark: false,
            colors: {
              primary: '#118B9F',
              secondary: '#F68A1A',
              danger: '#D9534F',
              info: '#5BC0DE',
              success: '#5CB85C',
              warning: '#F0AD4E',
              light: '#F7F7F7',
              muted: '#6C757D',
              dark: '#343A40',
              purple: '#6F42C1',
              graylighter: '#EDEDED',
              graylight: '#CCCCCC',
              gray: '#959595',
              graydark: '#636363',
              black: '#000000'
            }
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
