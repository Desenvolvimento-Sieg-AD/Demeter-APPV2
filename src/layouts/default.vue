<template>
  <v-app :theme="theme.name">
    <div v-if="logged" class="pageClass">
      <LayoutSidebar :user="user" />

      <transition name="page" appear>
        <div class="aj">
          <slot />
        </div>
      </transition>
    </div>

    <div v-else class="unlogged">
      <img src="/img/triste.png" />

      <h1>{{ message }}</h1>
      <h1>Por favor, entre em contato com o responsável técnico.</h1>

      <v-btn rounded class="my-2" :loading="loading" @click="reload">
        <v-icon icon="mdi-reload" start />
        Tentar novamente
      </v-btn>
    </div>

    <!-- <LazyModalUpdateAvailable v-model:enable="enableModal.available" /> -->
  </v-app>
</template>

<script setup>
import { useAuthStore } from '~/store/auth'

const { authenticateUser, user } = useAuthStore()

const theme = useTheme()

const { $toast } = useNuxtApp()

const logged = ref(false)
const message = ref('')
const loading = ref(false)

const enableModal = reactive({
  available: false
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
    $toast.error(error.message)
    message.value = error.message ?? 'Erro ao autenticar usuário'
  }
}
await login()

const reload = async () => {
  loading.value = true

  await useElectron().actions.reload()
  loading.value = false
}

const electron = useElectron()

// const getUpdateAvailable = () => {
//	electron.actions.updateAvailable((event, newVersion, version) => {
//		if (newVersion) {
//			enableModal.available = true;
//		}
//	});
// };

// getUpdateAvailable();
</script>

<style scoped>
.aj {
  margin-left: 60px !important;
  max-width: calc(100vw - 60px) !important;
  z-index: 1;
}
.logo-fixo {
  position: fixed;
  bottom: 0;
  right: 0;
  width: 17%;
  z-index: 0;
}
.pageClass {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: rgba(240, 240, 240, 0.288);
  background-size: cover;
  background-position: center;
}
.pageClass::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.055);
  z-index: 0;
}
.unlogged {
  background-color: #f68a1a;
}
.unlogged img {
  width: 25%;
  margin-bottom: 10px;
}
.unlogged {
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  height: 100%;
}
.unlogged h1 {
  color: white;
  text-align: center;
  font-size: x-large;
}
</style>
<style>
html {
  overflow: hidden !important;
}
</style>
