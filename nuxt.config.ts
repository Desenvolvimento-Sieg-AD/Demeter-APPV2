// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
	typescript: {
		shim: false,
	},
	ssr: false,
	components: true,
	srcDir: 'src',
	app: {
		head: {
			titleTemplate: '%s - Pagamentos',
			title: 'Início',
			htmlAttrs: { lang: 'pt-br' },
			meta: [
				{ charset: 'utf-8' },
				{ name: 'viewport', content: 'width=device-width, initial-scale=1' },
				{ hid: 'description', name: 'description', content: '' },
				{ name: 'format-detection', content: 'telephone=no' },
			],
			link: [
				{ rel: "icon", type: "image/x-icon", href: "/public/favicon.ico" },
			],

		},
		pageTransition: { name: 'page', mode: 'out-in' },
		layoutTransition: { name: 'slide-left', mode: 'out-in' }
	},
	css: [
		'@/assets/css/main.css',
		'@/assets/css/fonts.css',
		'vuetify/lib/styles/main.sass',
		'@mdi/font/css/materialdesignicons.min.css',
	],
	plugins: [],
	build: {
		transpile: ['vuetify'],
	},
	vite: {
		define: {
			'process.env.DEBUG': false,
		}
	}
});
