<template>
  <div>
    <LayoutForm class="mb-12">
      <v-form ref="formValidate">
        <v-card flat class="card-pagamento">
          <ModalPagamentoFornecedor v-model:form="form" />
        </v-card>

        <v-divider class="mt-2 mb-2" />

        <v-card class="pt-2 card-pagamento" flat>
          <ModalPagamentoEmpresa v-model:form="form" :documentRequired="documentRequired" />
        </v-card>

        <v-divider class="mt-2 mb-2" />

        <v-card class="card-pagamento" flat>
          <ModalPagamentoCategoria v-model:form="form" />
        </v-card>

        <v-divider class="mt-2 mb-2" />

        <v-card class="pt-2 card-pagamento" flat>
          <ModalPagamentoObservacoes v-model:form="form" :user="user" />
        </v-card>

        <v-divider class="mt-2 mb-2" />

        <v-card class="pt-2 card-pagamento" flat>
          <ModalPagamentoDadosBancarios v-model:form="form" :paymentsType="paymentsType" />
        </v-card>

        <div class="pt-2 mt-6 mb-2 w-full d-flex justify-end align-center ga-2">
          <v-btn v-for="(action, index) of actionsForm" :key="`${action}-${index}`" :color="action.color" @click="action.onClick()">
            {{ action.title }}
            <v-icon size="small" :icon="action.icon" />
            <v-tooltip :text="action.tooltip" activator="parent" location="top" v-if="route.query.edit === 'true'"/>
          </v-btn>
        </div>
      </v-form>
    </LayoutForm>
    <v-btn class="btn-flutter" variant="plain" icon color="primary" v-if="routeId" @click="sendRoute()">
      <v-icon>mdi-arrow-left</v-icon>
      <v-tooltip text="Voltar" activator="parent" location="right"></v-tooltip>
    </v-btn>
  </div>
</template>

<script setup>
// * IMPORTS

import { getPagamentoTipo, getOnePayment, updatePagamento } from '@api'
import { postStatus } from '~/api/pagamento'

import { useAuthStore } from '../../store/auth'


const { $toast } = useNuxtApp()

const dayjs = useDayjs()
const { user } = useAuthStore()

const route = useRoute()
const router = useRouter()
const form = ref(initFormState())

//* DATA

const priceNow = ref(null)
const paymentsType = ref([])
const formValidate = ref(null)

// * COMPUTEDS

const currentRoute = computed(() => route.query.edit === 'true' ? `/` : { path: '/financeiro/aprovadas', query: { client_id: route.query.client_id }})

const sendRoute = () => router.push(currentRoute.value) 

const routeId = computed(() => route.params.id )

const documentRequired = computed(() => {
  const type = paymentsType.value.find((tipo) => form.value.tipo_id === tipo.id)
  return type?.requer_documento
})

const actionsForm = [
  {
    title: 'Atualizar',
    tooltip: 'Atualizar pagamento e enviar para aprovação',
    icon: 'mdi-currency-usd',
    color: 'green',
    onClick: () => {
      updatePayment(Number(routeId.value), form.value)
    }
  }
]

// * METHODS

function buildFormData() {
  const formData = new FormData()

  const deleteKeys = ['fornecedor_id', 'conta_empresa', 'empresa', 'usuario', 'categoria', 'tipo_pagamento', 'anexos_pagamento', 'movimentacoes_pagamento']

  for (const key in form.value) {
    if (deleteKeys.includes(key)) continue

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
    if (form.value.nf && key === 'nf' && form.value.nf && form.value.nf.length > 0) {
      formData.append('nf', form.value.nf[0])
      continue
    }
    if (form.value.doc && key === 'doc' && form.value.doc.length > 0) {
      for (let i = 0; i < form.value.doc.length; i++) {
        formData.append('doc', form.value.doc[i])
      }
      continue
    }
    formData.append(key, form.value[key])
  }

  return formData
}

const updatePayment = async (id, data) => {
  try {
    const payload = buildFormData()

    const { success, message } = await updatePagamento(id, payload)

    if (!success) throw new Error(message)

    $toast.success(message)
    
    if(route.query.edit === 'true' && route.query.revision === 'true') await postStatus({ id: [id], status: 1, justificativa: 'Pagamento atualizado pelo usuário'})

    setTimeout(() => router.push(currentRoute.value), 750)

  } 
  catch (error) {
    console.error('Erro ao atualizar pagamento', error)
    $toast.error('Erro ao atualizar pagamento')
  }
}

const definePaymentImportant = async () => {
  try {
    const { data: pagamentos, success, message } = await getPagamentoTipo()

    if (!success) throw new Error(message)

    const priorizados = pagamentos.filter((p) => p.nome === 'PIX' || p.nome === 'Boleto')
    const restantes = pagamentos.filter((p) => p.nome !== 'PIX' && p.nome !== 'Boleto').sort((a, b) => a.nome.localeCompare(b.nome))
    paymentsType.value = [...priorizados, ...restantes]
  } 
  catch (error) {
    console.error('Erro ao buscar tipos de pagamento', error)
    $toast.error('Erro ao buscar tipos de pagamento')
  }
}

await definePaymentImportant()

function createFileFromAnexo(anexo) {
  if (!anexo) return null

  const base64String = String.fromCharCode(...anexo.base64.data);
  const file = new File([base64String], anexo.nome, { type: anexo.tipo_arquivo.mime })

  return file
}

function formatPaymentData(data) {
  const fileDOC = data.anexos_pagamento?.find((anexo) => anexo.tipo_anexo_id === 4)
  const fileNF = data.anexos_pagamento?.find((anexo) => anexo.tipo_anexo_id === 3)

  const doc = createFileFromAnexo(fileDOC)
  const nf = createFileFromAnexo(fileNF)

  const dados_bancarios = data.dados_bancarios

  dados_bancarios.outhers

  form.value = {
    nf: nf ? [nf] : null,
    doc: doc ? [doc] : null,
    pathNF: nf.path,
    ...data,
    pathDoc: doc.path,
    fornecedor: {
      id: data.fornecedor_id,
      nome: data.fornecedor.razao_social,
      apelido: data.fornecedor.razao_social,
      documento: data.fornecedor.documento,
      tipo: data.fornecedor.tipo,
      internacional: data.fornecedor_internacional
    },
    dados_bancarios: {
      banco: dados_bancarios?.banco,
      agencia: dados_bancarios?.agencia,
      conta: dados_bancarios?.conta,
      digito: dados_bancarios?.digito,
      outhers: dados_bancarios?.outhers,
      codigo_barras: dados_bancarios?.codigo_barras,
      numero_cartao: dados_bancarios?.numero_cartao,
      chave_pix: dados_bancarios?.chave_pix,
      link_online: dados_bancarios?.link_online
    },
    projeto_id: data.projeto_id,
    categoria_id: data.categoria.id,
    grupo_id: data.categoria.grupo.id,
    tipo_chave_pix_id: data.tipo_chave_pix_id,
    data_vencimento: dayjs(data.data_vencimento).format('YYYY-MM-DD')
  }

}

const getPagamento = async (id) => {
  try {
    const { success, data, message } = await getOnePayment(id, 'geral')

    if (!success) throw new Error(message)

    formatPaymentData(data)
  } 
  catch (error) {
    console.error('Erro ao buscar pagamento:', error)
    $toast.error('Erro ao buscar pagamento')
  }
}

// * Função para limpar o formulário

const reset = () => {
  form.value = initFormState()
  form.value.valor_total = null
  form.value.doc = []
  form.value.tipo_chave_pix = null
  form.value.projeto_id = null
}

function initFormState() {
  return {
    fornecedor: { id: null, nome: null, apelido: null, documento: null, tipo: null },
    internacional: false,
    empresa_id: null,
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
    dados_bancarios: {
      banco: null,
      agencia: null,
      conta: null,
      digito: null,
      outhers: null,
      codigo_barras: null,
      numero_cartao: null,
      chave_pix: null,
      link_online: null
    }
  }
}

// * Lifecycle

onMounted(async () => {
  await Promise.all([await definePaymentImportant(), await getPagamento(routeId.value)])
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
  } 
  catch (error) {
    console.error(error)
    $toast.error('Erro ao buscar valor do dolar')
  }
}

onBeforeUnmount(() => form.value = initFormState())

// * Watchers

watch(() => form.value.fornecedor.internacional, async (nv, oV) => {
    if (nv) {
      paymentsType.value = paymentsType.value.filter((type) => type.internacional)
      await getPriceDollar()
    } 
    else await definePaymentImportant()
  },
  { immediate: true }
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
