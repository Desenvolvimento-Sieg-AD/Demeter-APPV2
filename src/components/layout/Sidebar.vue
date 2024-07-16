<template>
  <v-navigation-drawer location="left" v-model:rail="drawer" rail expand-on-hover color="bg_navbar" permanent @mouseleave="activeOption = []">
    <div class="px-2 pt-3 d-flex w-full justify-center" style="height: 85px">
      <v-img src="../../img/SIEG.png" height="auto" max-width="80px" />
    </div>

    <v-list open-strategy="single" nav v-model:selected="selectedOption" v-model:opened="activeOption" class="sidebar d-flex flex-column">
      <template v-for="(item, itemIndex) in menuOptions" :key="itemIndex">
        <v-list-item
          v-if="!item.tabs"
          :key="itemIndex"
          v-show="item.setores.includes('ALL') || item.setores.some((setor) => setor === user?.tipo?.sigla)"
          :value="getItemValue(item)"
          :to="item.to"
          style="color: #118B9F"
          :prepend-icon="item.icon"
        >
          <template #title>
            <span class="sidebar-item">{{ item.title }}</span>
          </template>
        </v-list-item>

        <v-list-group v-else :value="getItemValue(item)" fluid v-show="item.setores.includes('ALL') || item.setores.some((setor) => setor === user?.tipo?.sigla)">
          <template #activator="{ props }">
            <v-list-item v-bind="props" :value="item.active" :prepend-icon="item.icon" style="color: #118B9F">
              <template #title>
                <span class="sidebar-item">{{ item.title }}</span>
              </template>
            </v-list-item>
          </template>

          <v-card color="bg_secondary" flat>
            <v-list-item v-for="(sub, subIndex) in item.tabs" :key="subIndex" :value="getSubitemValue(item, sub)" :to="sub.to" exact variant="text" color="#118B9F" class="ml-5">
              <template #prepend>
                <v-icon :color="sub.color" :icon="sub.icon" />
              </template>

              <template #title>
                <span class="sidebar-item">{{ sub.title }}</span>
              </template>
            </v-list-item>
          </v-card>
        </v-list-group>
      </template>

      <div class="spacer" style="flex-grow: 1"></div>

      <v-list-item class="footer" v-for="(item, index) in menuFooter" :key="index" @click="sendLink(item.to)" style="color: #118B9F" :prepend-icon="item.icon">
        <template #title>
          <span class="sidebar-item">{{ item.title }}</span>
        </template>
      </v-list-item>

      <!-- version -->
      <div class="footer-version">
        <v-divider/>

        <p class="version-text">{{ version }}</p>

        <!-- <v-btn @click="toggleTheme" icon flat color="secondary" variant="text">
          <v-icon>mdi-theme-light-dark</v-icon>
        </v-btn> -->
      </div>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
//* IMPORTS

import { useAuthStore } from '~/store/auth'
import { useThemeStore } from '~/store/theme';
const { authenticateUser } = useAuthStore()

const { toggleTheme } = useThemeStore()
const route = useRoute()

const { actions } = useElectron()

const version = ref(await actions.getVersion())

//* DATA

const user = ref({})
const activeOption = ref([])
const selectedOption = ref([])
const drawer = ref(true)
let timer;

//* METHODS

const login = async () => {
  try {
    const usuario = await useOs().getUser()
    const sigla = usuario?.username?.toUpperCase()

    const { success, user: data } = await authenticateUser(sigla)
    if (!success) throw new Error('Erro ao autenticar usuário')

    user.value = data
  } catch (error) {
    console.error('Erro ao autenticar usuário:', error)
  }
}

const menuOptions = ref([
  { title: 'Pagamentos', icon: 'mdi-cash-check', to: '/', setores: ['ALL'] },
  { title: 'Novo pagamento', icon: 'mdi-cash-plus', to: '/pagamento/novo', setores: ['ALL'] },
  {
    title: 'Financeiro',
    icon: 'mdi-account-cash-outline',
    to: '/financeiro',
    setores: ['FIN', 'GER', 'ADM'],
    tabs: [
      { title: 'Pendentes', icon: 'mdi-account-clock-outline', to: '/financeiro/pendentes', color: 'red' },
      { title: 'Aprovadas', icon: 'mdi-account-check-outline', to: '/financeiro/aprovadas', color: 'green' },
      { title: 'Provisionados', icon: 'mdi-cash-sync', to: '/financeiro/provisionados', color: 'blue' }
    ]
  },
  { title: 'Gerência', icon: 'mdi-account-tie-outline', to: '/gerencia', setores: ['GER', 'ADM'] },
  { title: 'Histórico', icon: 'mdi-clock-outline', to: '/historico', setores: ['FIN', 'ADM', 'GER'] },
  { title: 'Configurações', icon: 'mdi-cog-outline', to: '/configuracoes', setores: ['FIN', 'GER', 'ADM'], tabs: [
    { title: 'Setores', to: '/configuracoes/setores', icon: 'mdi-account-group', color: 'green' },
    { title: 'Categorias', to: '/configuracoes/categorias', icon: 'mdi-format-list-bulleted', color: 'blue'}
  ]},
])

const menuFooter = ref([
  { title: 'Manual de Uso', icon: 'mdi-book-open-outline', to: 'https://docs.google.com/document/d/1D8p-yGRfOW6jAeXyb8T5MlXcqLREeJRc/edit' },
  { title: 'Formulário', icon: 'mdi-list-box-outline', to: 'https://docs.google.com/forms/d/e/1FAIpQLSc99PuYBdLKRUMMOT14M-iBNlMBAnQjtztTjl9e_vJzOP5YLQ/viewform' },
])

//* ACTIONS

const getItemValue = (item) => `item-${item.title.toLowerCase()}`
const getSubitemValue = (item, sub) => `item-${item.title.toLowerCase()}-subitem-${sub.title.toLowerCase()}`

const sendLink = (link) => {
  useOs().sendLink(link)
}

//* HOOKS

onBeforeMount(async () => await login())

//* WATCHERS

watch(
  () => route.path,
  (value) => {
    if (timer) clearTimeout(timer)

    const match = /^\/(\w+)\/(\w+)/.exec(value)
    if (!match) return

    selectedOption.value = [`item-${match[1]}-subitem-${match[2]}`]
    timer = setTimeout(() => {
      if (drawer.value) activeOption.value = []
    }, 1200)
  },
  { deep: true, immediate: true }
)
</script>

<style>
.sidebar-item {
  font-size: 15px;
  color: #118B9F;
}

.sidebar {
  display: flex;
  flex-direction: column;
  height: 90%;
}
.footer {
  margin-top: auto;
}

.footer-version {
  text-align: center;
  color: #118B9F;
}

.version-text {
  margin: 20px 0 0px;
  font-size: 14px;
  white-space: nowrap;
}

.footer-version v-divider {
  margin-bottom: 8px;
}
</style>
