<template>
  <div>
    <CustomHeader title="Solicitação de Pagamento">
      <v-btn icon variant="plain" color="primary">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
    </CustomHeader>

    <LayoutForm class="mb-12" height="calc(100vh - 175px)">
      <v-form ref="formValidate">
        <v-card class="card-pagamento" flat>
          <ModalPagamentoEmpresa v-model:form="form" />
        </v-card>

        <v-divider class="mt-2 mb-2" />

        <v-card flat class="card-pagamento">
          <ModalPagamentoFornecedor v-model:form="form" />
        </v-card>

        <v-divider class="mt-2 mb-2" />

        <v-card class="card-pagamento" flat>
          <ModalPagamentoCategoria v-model:form="form" :documentRequired="documentRequired" />
        </v-card>

        <v-divider class="mt-2 mb-2" />

        <v-card class="pt-2 card-pagamento" flat>
          <ModalPagamentoObservacoes v-model:form="form" :user="user" />
        </v-card>

        <v-divider class="mt-2 mb-2" />

        <v-card class="pt-2 card-pagamento" flat>
          <ModalPagamentoDadosBancarios v-model:form="form" :paymentsType="paymentsType" />
        </v-card>

        <v-row class="mt-n4 d-flex justify-center align-center ga-2">
          
          <v-btn v-for="(action, index) of actionsForm" :key="`${action}-${index}`" :color="action.color" @click="action.onClick()" width="200" height="43" :loading="action.loading">
            <v-icon size="large" :icon="action.icon" />
            <v-tooltip :text="action.title" location="bottom" activator="parent" />
          </v-btn>
        </v-row>
      </v-form>
    </LayoutForm>

    <v-btn class="btn-flutter" variant="plain" icon color="primary" v-if="routeId" @click="router.push('/financeiro/aprovadas')">
      <v-icon>mdi-arrow-left</v-icon>
      <v-tooltip text="Voltar" activator="parent" location="right"></v-tooltip>
    </v-btn>
    
  </div>
</template>

<script setup>
// * IMPORTS

import { getPagamentoTipo, postPagamento, getOnePayment, updatePagamento } from '@api'
import { useAuthStore } from '~/store/auth'
import { set } from '~~/node_modules/nuxt/dist/app/compat/capi'

const { $toast } = useNuxtApp()

const dayjs = useDayjs()
const { user } = useAuthStore()
const setores = computed(() => user.setores)

const route = useRoute()
const router = useRouter()
const form = ref(initFormState())

const access = useRuntimeConfig()
const path = access.public.PAGAMENTO_PATH

//* DATA

const loading = ref(false)
const priceNow = ref(null)
const paymentsType = ref([])
const formValidate = ref(null)

// * COMPUTEDS

const routeId = computed(() => route.query.id)

const documentRequired = computed(() => {
  if (form.value.fornecedor.internacional || !form.value.tipo_id) return false
  const type = paymentsType.value.find((tipo) => form.value.tipo_id === tipo.id)
  return type?.requer_documento
})

const isExpired = computed(() => dayjs(form.value.data_vencimento).isBefore(dayjs().subtract(1, 'day')))

const validDateToCard = computed(() => isExpired.value && form.value.tipo_id !== 5 && form.value.tipo_id !== 6)

const actionsForm = [
  {
    title: 'Limpar campos',
    icon: 'mdi-trash-can-outline',
    color: 'red',
    onClick: () => reset()
  },
  {
    title: routeId.value ? 'Atualizar' : 'Salvar',
    icon: 'mdi-content-save',
    color: 'green',
    onClick: () => {
      if (routeId.value) updatePayment(Number(routeId.value), form.value)
      else sendForm()
    },
    loading: loading.value
  }
]

// * METHODS

const requer_projeto = computed(() => setores.value.some((setor) => setor.requer_projeto))

function buildFormData() {
  const formData = new FormData()

  for (const key in form.value) {
    if (key === 'fornecedor') {
      formData.append('fornecedor_id', form.value.fornecedor.id)
      formData.append('fornecedor_nome', form.value.fornecedor.nome)
      formData.append('fornecedor_apelido', form.value.fornecedor.apelido)
      formData.append('fornecedor_documento', form.value.fornecedor.documento)
      formData.append('fornecedor_tipo', form.value.fornecedor.tipo)
      formData.append('fornecedor_internacional', form.value.fornecedor.internacional)
      continue
    }
    if (key === 'dados_bancarios') {
      formData.append('dados_bancarios', JSON.stringify(form.value.dados_bancarios))
      continue
    }

    if (key === 'nf' && form.value.nf.length > 0) {
      formData.append('nf', form.value.nf[0])
      continue
    } 
    
    if (key === 'doc' && form.value.doc.length > 0) {
      for (let i = 0; i < form.value.doc.length; i++) {
        formData.append('doc', form.value.doc[i])
      }
      continue
    }
    formData.append(key, form.value[key])
  }

  return formData
}

const sendForm = async () => {
  loading.value = true
  try {

    if(isNaN(Number(form.value.projeto_id)) && requer_projeto.value) return cancelProcess('Selecione um projeto existente ou crie um novo projeto')

    const { valid } = await formValidate.value.validate()

    if (!valid) return cancelProcess('Preencha todos os campos obrigatórios')

    if (validDateToCard.value) return cancelProcess('Data de vencimento expirada')

    const formData = buildFormData()
    const { success, message } = await postPagamento(formData)

    if (!success) throw new Error(message)

    $toast.success(message)

    await definePaymentImportant()

    reset()

    loading.value = false

  } catch (error) {
    console.error(error)
    $toast.error(error.message)
  }
}

const updatePayment = async (id, data) => {
  try {
    const payload = buildFormData()

    const { success, message } = await updatePagamento(id, payload)

    if (!success) throw new Error(message)

    $toast.success(message)

    setTimeout(() => router.push('/financeiro/aprovadas'), 750)
  } catch (error) {
    console.log('Erro ao atualizar pagamento', error.message)
    $toast.error('Erro ao atualizar pagamento')
  }
}

const cancelProcess = (message) => {
  loading.value = false
  $toast.error(message)
}

const definePaymentImportant = async () => {
  try {
    const { data: pagamentos, success, message } = await getPagamentoTipo()

    if (!success) throw new Error(message)

    const priorizados = pagamentos.filter((p) => p.nome === 'PIX' || p.nome === 'Boleto')
    const restantes = pagamentos.filter((p) => p.nome !== 'PIX' && p.nome !== 'Boleto').sort((a, b) => a.nome.localeCompare(b.nome))
    paymentsType.value = [...priorizados, ...restantes]
  } catch (error) {
    console.log('Erro ao buscar tipos de pagamento', error.message)
    $toast.error('Erro ao buscar tipos de pagamento')
  }
}

await definePaymentImportant()

function createFileFromAnexo(anexo) {
  if (!anexo) return { file: null, folder: null }
  const folder = `${path}${anexo.caminho}`
  const file = new File([folder], anexo.nome, { type: anexo.tipo_arquivo.mime })
  return { file, folder }
}

function formatPaymentData(data) {
  const fileDOC = data.anexos_pagamento?.find((anexo) => anexo.tipo_anexo_id === 4)
  const fileNF = data.anexos_pagamento?.find((anexo) => anexo.tipo_anexo_id === 3)

  const { file: doc, folder: pathDoc } = createFileFromAnexo(fileDOC)
  const { file: nf, folder: pathNF } = createFileFromAnexo(fileNF)

  form.value = {
    nf,
    doc: [doc],
    pathNF,
    ...data,
    pathDoc,
    projeto_id: data.projeto_id,
    categoria_id: data.categoria.id,
    grupo_id: data.categoria.grupo.id,
    tipo_chave_pix_id: data.tipo_chave_pix_id,
    dados_bancarios: formatBankingData(data),
    data_vencimento: dayjs(data.data_vencimento).format('YYYY-MM-DD')
  }
}

function formatBankingData(data) {
  const dadosBancarios = JSON.parse(data.dados_bancarios)
  switch (form.value.tipo_id) {
    case 1:
      dadosBancarios.outhers = dadosBancarios.chave_pix.replace(/[\D]/g, '')
      break
    case 3:
      const { banco, agencia, conta, digito } = dadosBancarios
      return { banco, agencia, conta, digito, ...dadosBancarios }
    default:
      return dadosBancarios
  }
}

const getPagamento = async (id) => {
  try {
    const { success, data, message } = await getOnePayment(id, 'geral')

    if (!success) throw new Error(message)

    formatPaymentData(data)
  } catch (error) {
    console.error('Erro ao buscar pagamento:', error.message)
    $toast.error('Erro ao buscar pagamento')
  }
}

// * Função para limpar o formulário

const reset = () => {
  form.value = initFormState()
  form.value.valor_total = null
  form.value.doc = []
  form.value.tipo_chave_pix_id = null
  form.value.projeto_id = null
}

function initFormState() {
  return {
    fornecedor: { id: null, nome: null, apelido: null, documento: null, tipo: null, internacional: false},
    empresa_id: null,
    setor_solicitante_id: user.setores.length <= 1 ? user.setores[0].id : null,
    setor_id: null,
    conta_id: null,
    nf: [],
    doc: [],
    tipo_id: null,
    motivo: null,
    categoria_id: null,
    dados_complementares: null,
    valor_total: null,
    valor_total_dolar: null,
    data_vencimento: null,
    projeto: null,
    projeto_id: null,
    chave_nf: null,
    numero_nf: null,
    tipo_chave_pix: null,
    urgente: false,
    justificativa_urgente: null,
    internacional: false,
    dados_bancarios: {
      banco: null,
      agencia: null,
      conta: null,
      digito: null,
      outhers: null
    }
  }
}

// * Lifecycle

onMounted(async () => {
  await Promise.all([await definePaymentImportant()])
})

const getPriceDollar = async () => {
  try {
    const endpoint = `https://economia.awesomeapi.com.br/json/USD-BRL/1`
    const response = await fetch(endpoint)

    const data = await response.json()

    const ask = data[0].ask
    const bid = data[0].bid

    const price = (parseFloat(ask) + parseFloat(bid)) / 2
    priceNow.value = price

    form.value.valor_total = price
  } catch (error) {
    console.log(error.message)
    $toast.error(error.message)
  }
}

// * Watchers

watch(() => form.value.fornecedor.internacional, async (nv, oV) => {
    if (nv) {
      paymentsType.value = paymentsType.value.filter((type) => type.modo_internacional)
      await getPriceDollar()
    } else await definePaymentImportant()
  }
)

watch(() => form.value.valor_total_dolar, (nv, oV) => {
    if (nv) form.value.valor_total = priceNow.value * nv
  }
)
</script>

<style scoped>
.card-pagamento {
  background-color: white;
  border-radius: 6px;
}
.w-full {
  width: 100%;
  max-width: 100%;
  flex-wrap: wrap;
}
.ajust {
  max-width: 1400px !important;
}

.btn-flutter {
  position: fixed;
  top: 100px;
  left: 70px;
  scale: 1.5;
}


</style>
