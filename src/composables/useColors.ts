export const theme = () => {
  // process.env.VUE_APP_THEME
  const vuetifyTheme = useTheme()

  const name: string = vuetifyTheme.name as unknown as string

  const colors: any = themes['dark']
  const isDark = name === 'dark'

  return { colors, isDark, name }
}
