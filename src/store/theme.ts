import { defineStore } from 'pinia';

import { dark, light } from '@/utils/themes';

export const useThemeStore = defineStore({
  id: 'theme-store',
  state: () => ({ 
    theme: 'light'
  }),
  persist: {
    storage: persistedState.localStorage,
    paths: ['theme']
  },
  getters: {
    isDarkTheme(state) {
      return state.theme === 'dark'
    },
    currentTheme(state) {
      return state.theme === 'dark' ? dark : light
    }
  },
  actions: {
    setTheme(theme: string) {
      this.theme = theme
    },
    toggleTheme() {
      this.theme = this.theme === 'dark' ? 'light' : 'dark'
    }
  }
})
