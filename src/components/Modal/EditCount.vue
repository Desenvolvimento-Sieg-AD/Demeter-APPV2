<template>
  <LazyModal v-model:enable="enableValue" :actions="actions" :title="title" width="700px">
    <template #content>
      <v-container class="txt-center">
        <v-row justify="space-beetween" alilgn="center">
          <v-col cols="6">
            <CustomInput v-model="payment.usuario.nome" disabled label="Solicitante" />
          </v-col>

          <v-col cols="6">
            <CustomInput v-model="payment.valor_total" disabled label="Valor" mask="money" />
          </v-col>

        </v-row>

        <v-row class="mt-3">
          <v-col cols="6">
            <CustomInput type="autocomplete" required label="Empresa pagadora" :items="empresas" v-model="form.empresa_id" itemValue="id" itemTitle="apelido" hide-details />
          </v-col>

          <v-col cols="6" v-if="payment.tipo_id == 5 || payment.tipo_id == 6">
            <CustomInput
              :disabled="!form.empresa_id"
              type="autocomplete"
              required
              label="Conta"
              :items="contasEmpresa"
              v-model="form.conta_id"
              itemValue="id"
              itemTitle="descricao"
              hide-details
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" md="6">
            <CustomInput 
              type="autocomplete"
              required
              label="Grupo de categoria" 
              :items="gruposCategoria" 
              v-model="form.grupo_id" 
              itemValue="id" 
              itemTitle="nome"
            />
          </v-col>

          <v-col>
            <CustomInput
              :disabled="!form.grupo_id"
              type="autocomplete"
              required
              :items="selectedCategories"
              label="Categoria"
              v-model="form.categoria_id"
              itemValue="id"
              itemTitle="nome"
            />
          </v-col>
        </v-row>
      </v-container>
    </template>
  </LazyModal>
</template>

<script setup>
//* IMPORTS

import { updatePagamento, getOnePayment, getCategoriasUsuario, getContasDisponiveis, getEmpresa } from '@api'
const { $toast } = useNuxtApp()

//* PROPS

const props = defineProps({
  enable: { type: Boolean, default: false },
  message: { type: String, default: '' },
  title: { type: String, default: 'Editar pagamento' },
  id: { type: Number }
})

//* DATA

const payment = ref(null)
const loading = ref(false)
const contasEmpresa = ref([])
const categorias = ref([])
const gruposCategoria = ref([])
const empresas = ref([])

const form = reactive({
  empresa_id: null,
  conta_id: null,
  grupo_id: null,
  categoria_id: null,
  setor_id: null, 
})

//* EMITS

const emit = defineEmits('close', 'update-success')

//* COMPUTED

const enableValue = computed({
  get: () => props.enable,
  set: (value) => emit('update:enable', value)
})

const actions = computed(() => [
  {
    icon: 'mdi-close',
    title: 'Cancelar',
    type: 'grey',
    click: () => (enableValue.value = false)
  },
  {
    icon: 'mdi-check',
    title: 'Alterar',
    type: 'padrao',
    loading: loading.value,
    click: async () => await saveUpdates()
  }
])

const selectedCategories = computed(() => {
  return categorias.value.filter((categoria) => categoria.grupo_id === form.grupo_id)
})

//* METHODS

const getPayment = async () => {
  try {
    const { success, message, data } = await getOnePayment(props.id, 'financeiroPendentes')

    if (!success) throw new Error(message)

    payment.value = data

    form.empresa_id = data.empresa.id
    form.conta_id = data.conta_id
    form.grupo_id = data.categoria.grupo.id
    form.categoria_id = data.categoria_id
    form.setor_solicitante_id = data.setor_solicitante_id
    form.setor_id = data.setor_id

    getContasDisp()
    getCategsUsuario()
    getEmpresas()
  } 
	catch (error) {
    console.error(error)
    $toast.error('Ocorreu um erro ao buscar o pagamento')
  }
}

const getContasDisp = async () => {
  try {
    const { data } = await getContasDisponiveis(payment.value.empresa_id, payment.value.tipo_id)
    contasEmpresa.value = data
  } 
	catch (error) {
    console.error(error)
    $toast.error('Ocorreu um erro ao buscar as contas disponíveis')
  }
}

const getEmpresas = async () => {
  try {
    const { data } = await getEmpresa()
    empresas.value = data
  } 
	catch (error) {
    console.error(error)
    $toast.error('Ocorreu um erro ao buscar as empresas')
  }
}

const getCategsUsuario = async () => {
  try {

    const { data } = await getCategoriasUsuario(12) // ? Financeiro

    const tempGrupos = []

    for (const categoria of data) {
      if (!tempGrupos.find((grupo) => grupo.id === categoria.grupo_id)) {
        tempGrupos.push({
          id: categoria.grupo_id,
          nome: categoria.grupo.nome
        })
      }
    }

    gruposCategoria.value = tempGrupos
    categorias.value = data

  } 
	catch (error) {
    console.error(error)
    $toast.error('Ocorreu um erro ao buscar as categorias')
  }
}

await getPayment()

const saveUpdates = async () => {
  loading.value = true
  try {
    const payload = {
      conta_id: form.conta_id,
      empresa_id: form.empresa_id,
      categoria_id: form.categoria_id,
      setor_solicitante_id: form.setor_solicitante_id,
    }

    const { success, message } = await updatePagamento(props.id, payload)

    if (!success) throw new Error(message)

    enableValue.value = false
    emit('update-success')
  } 
	catch (error) {
    console.error(error)
    $toast.error('Ocorreu um erro ao atualizar o pagamento')
  }
  loading.value = false
}

// TODO: Achar outra maneira de limpar esses campos

//* WATCHERS

watch(
  () => form.empresa_id,
  (v) => {
    getContasDisp()
    if (v !== payment.value?.empresa_id) {
      form.conta_id = null
    }
  },
  { deep: true, immediate: true }
)

watch(
  () => form.grupo_id,
  (v) => {
    if (categorias.value.length === 0) return
    const find = categorias.value.find((categoria) => categoria.id === form.categoria_id)
    if (!find || find.grupo_id !== v) form.categoria_id = null
  },
  { deep: true, immediate: true }
)
</script>

<style scoped>
.txt-center {
  text-align: center;
}
</style>
