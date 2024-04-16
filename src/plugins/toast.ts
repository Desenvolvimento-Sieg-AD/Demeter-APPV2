import Vue3Toastify, { toast, type ToastOptions } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(Vue3Toastify, {});

  return {
    provide: { toast }
  };
});