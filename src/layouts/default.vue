<template>
  <v-app :theme="theme" :style="`background-color: ${currentTheme.bgprimary}`">
    <div v-if="logged" >
      <LayoutSidebar :user="user" />

      <transition name="page" appear>
        <div class="layout-block">
          <v-breadcrumbs :items="breadcrumbs" color="primary" icon="mdi-home">
            <template #title="{ item }">
              <b>{{ item.title }}</b>
            </template>
          </v-breadcrumbs>

          <v-divider />

          <div class="layout-content">
            <slot />
          </div>
        </div>
      </transition>
    </div>

    <div v-else class="layout-error">
      <v-card flat class="pa-6 layout-error-content">
        <v-icon color="red" size="80">mdi-robot-dead-outline</v-icon>
  
        <h2>Não foi possível autenticar o usuário</h2>
        <h3>Entre em contato com o suporte</h3>
  
        <br>

        <v-alert icon="mdi-alert-outline" color="red" variant="tonal">
          <span>{{ message }}</span>
        </v-alert>
        
        <br>
  
        <v-btn class="my-2" :loading="loading" @click="reload" flat color="primary">
          <v-icon icon="mdi-reload" start />
          <b>Tentar novamente</b>
        </v-btn>
      </v-card>
    </div>
  </v-app>
</template>

<script setup>
import { useAuthStore } from '~/store/auth'
import { useThemeStore } from '~/store/theme';

const route = useRoute()
const { $toast } = useNuxtApp()

const { authenticateUser, user } = useAuthStore()
const { theme, currentTheme } = useThemeStore()

const logged = ref(false);
const message = ref('Erro não identificado');
const loading = ref(false);

const breadcrumbs = computed(() => {
  const paths = route.path.split('/').filter((item) => item !== '').map((item) => capitalize(item));

  if (paths.length === 0) return ['Pagamento']
  return paths;
})

const login = async () => {
  try {
    const user = await useOs().getUser()
    const sigla = user?.username?.toUpperCase()
    const token = localStorage.getItem('token')

    await useElectron().actions.sendToken(token)

    const { success, message } = await authenticateUser(sigla)
    if (!success) throw new Error(message)

    logged.value = true
  } catch (error) {
    console.error(error)
    $toast.error('Erro ao autenticar usuário')
    message.value = error.message ?? 'Erro ao autenticar usuário'
  }
}
await login()

const reload = async () => {
  loading.value = true

  await useElectron().actions.reload()
  loading.value = false
}
</script>

<style scoped>
.layout-block {
  padding-left: 60px;
  max-width: calc(100vw - 10px);
  z-index: 1;
}
.layout-content {
  padding: 20px;
  margin: auto;
}
.layout-content > * {
  margin: auto;
}
.layout-error {
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  height: 100%;
}
.layout-error-content {
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
}

</style>

<style>
html {
  overflow: hidden !important;
}
</style>