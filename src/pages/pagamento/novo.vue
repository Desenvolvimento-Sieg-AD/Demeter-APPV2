<template>
  <div>
    <LayoutForm height="auto" style="width: calc(100vw - 500px); min-width: 1100px">
      <v-form ref="formValidate">
        <ModalPagamentoEmpresa v-model:form="form" />

        <ModalPagamentoFornecedor v-model:form="form" />

        <ModalPagamentoCategoria v-model:form="form" :documentRequired="documentRequired" />

        <ModalPagamentoDadosBancarios v-model:form="form" :paymentsType="paymentsType" />

        <ModalPagamentoObservacoes v-model:form="form" :user="user" />
      </v-form>
    </LayoutForm>

    <Action :buttons="actionsForm" />
  </div>
</template>

<script setup>
// * IMPORTS

import { getPagamentoTipo, postPagamento } from '@api'
import { useAuthStore } from '~/store/auth'

const { $toast } = useNuxtApp()

const dayjs = useDayjs()
const { user } = useAuthStore()
const setores = computed(() => user.setores)

const route = useRoute()
const form = ref(initFormState())

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
    active: true,
    tooltip: 'Resetar campos',
    click: () => reset(),
    loading: loading.value
  },
  {
    title: routeId.value ? 'Atualizar' : 'Salvar',
    icon: 'mdi-content-save',
    color: 'green',
    active: true,
    tooltip: 'Salvar',
    click: () => sendForm(),
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
    if (isNaN(Number(form.value.projeto_id)) && requer_projeto.value) throw new Error('Selecione um projeto')

    const { valid } = await formValidate.value.validate()
    if (!valid) throw new Error('Preencha todos os campos obrigatórios')

    if (validDateToCard.value) throw new Error('Data de vencimento expirada')

    const formData = buildFormData()
    const { success, message } = await postPagamento(formData)

    if (!success) throw new Error(message)

    $toast.success(message)

    await definePaymentImportant()

    reset()

    loading.value = false
  } 
  catch (error) {
    loading.value = false
    console.error(error)
    $toast.error(error.message)
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
    fornecedor: { id: null, nome: null, apelido: null, documento: null, tipo: null, internacional: false },
    empresa_id: null,
    setor_solicitante_id: user.setores.length <= 1 ? user.setores[0].id : null,
    setor_id: null,
    privado: false,
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
  } 
  catch (error) {
    console.error(error)
    $toast.error('Erro ao buscar valor do dolar')
  }
}

// * Watchers

watch(
  () => form.value.fornecedor.internacional,
  async (nv, oV) => {
    if (nv) {
      paymentsType.value = paymentsType.value.filter((type) => type.modo_internacional)
      await getPriceDollar()
    } else await definePaymentImportant()
  }
)

watch(
  () => form.value.valor_total_dolar,
  (nv, oV) => {
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
