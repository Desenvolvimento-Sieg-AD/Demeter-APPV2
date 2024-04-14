// plugins/vuetify.js
import { createVuetify } from 'vuetify';
import colors from 'vuetify/lib/util/colors';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

export default defineNuxtPlugin(nuxtApp => {
    const vuetify = createVuetify({
        ssr: false,
        components,
        directives,
        theme: {
            options: {
                customProperties: true
            },
            themes: {
                light: {
                    dark: false,
                    colors: {
                        primary: '#118B9F',
                        primary_light: '#58959E',
                        message_light: '#3DA6BA',
                        secondary: '#F68A1A',
                        tertiary: colors.grey.lighten2,
                        quaternary: colors.grey.lighten3,
                        bg_navbar: '#FFFFFF',
                        bg_primary: '#D7D7D7',
                        bg_secondary: '#F2F2F2',
                        bg_tertiary: '#E8E8E8',
                        bg_quaternary: '#FFFFFF',
                        text: '#1F1F1F',
                        message: '#5CB6FF',
                        done: '#4CAF50',
                        alert: '#F68A1A',
                        error: '#FE6A6A',
                        grey: colors.grey.lighten2,
                        green: colors.green.lighten1, //#66BB6A
                        pale_green: "#DDFFDD",
                        red: colors.red.lighten1, //#EF5350
                        blue: colors.blue.lighten1, //#42A5F5
                        purple: colors.purple.lighten1, //#AB47BC
                        amber: colors.amber.lighten1, //#FFCA28
                        orange: colors.orange.lighten1, //#FFA726
                    }
                },
                dark: {
                    dark: true,
                    colors: {
                        primary: '#118B9F',
                        primary_light: '#58959E',
                        message_light: '#3DA6BA',
                        secondary: '#F68A1A',
                        tertiary: '#7D7D7D', // Approximated from lighten2
                        quaternary: '#9E9E9E', // Approximated from lighten3
                        bg_navbar: '#1F1F1F',
                        bg_primary: '#2B2B2B', // Darker shade
                        bg_secondary: '#3D3D3D', // Darker shade
                        bg_tertiary: '#1F1F1F', // Darker shade
                        bg_quaternary: '#1F1F1F', // Darker shade
                        text: '#D7D7D7', // Lightened
                        message: '#5CB6FF',
                        done: '#4CAF50',
                        alert: '#F68A1A',
                        error: '#FE6A6A',
                        green: '#66BB6A', // Assuming this is the lighten1 value
                        red: '#EF5350', // Assuming this is the lighten1 value
                        blue: '#42A5F5', // Assuming this is the lighten1 value
                        purple: '#AB47BC', // Assuming this is the lighten1 value
                        amber: '#FFCA28', // Assuming this is the lighten1 value
                        orange: '#FFA726' // Assuming this is the lighten1 value
                    }
                }
            }
        }
    })

    nuxtApp.vueApp.use(vuetify)
})