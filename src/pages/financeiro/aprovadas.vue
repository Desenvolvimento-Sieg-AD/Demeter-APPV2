<template>
  <LayoutForm>
    <v-form ref="form">
      <div class="d-flex" style="flex-direction: column; justify-content: center; align-items: start">
        <LayoutTitle title="Cliente" />

        <CustomInput
          label="Selecione o cliente"
          type="autocomplete"
          v-model="selectedClient"
          :items="clients"
          itemValue="id"
          noDataText="Nenhum cliente com pagamentos aprovados"
          itemTitle="apelido"
          hide-details="auto"
          class="px-3 pb-3 pt-1"
          style="width: 400px"
        />
      </div>

      <v-divider />

      <LayoutLoading v-if="loadingPayments" />

      <div v-else-if="showPayments">
        <LayoutTitle title="Pagamentos">
          <div>
            <CustomText class="mr-5" v-if="countPayments > 0" :title="paymentsCountTitle" color="#118B9F" size="16" :bold="true" />
            <v-chip color="#F68A1A" text="Pagamentos aprovados pela gerência"></v-chip>
          </div>
        </LayoutTitle>

        <v-card height="calc(100vh - 345px)" flat style="overflow-y: auto">
          <v-card
            v-for="(payment, index) in payments"
            :key="`${payment}-${index}`"
            color="bgsecondary"
            :class="{
              'card-payment-box': true,
              'approved-box': payment.codigo_lancamento_omie,
              'error-box': (payment.enviado_externo && !payment.codigo_lancamento_omie) || sentAndError(payment),
              'selected-box': payment.selectedOmie && !sentAndError(payment)
            }"
            flat
            @click="selectPayment(payment.id)"
            :disabled="payment.codigo_lancamento_omie"
          >
            <v-row justify="space-between" dense>
              <v-col cols="10">
                <v-row dense>
                  <v-col cols="5">
                    <CustomInput label="Fornecedor" v-model="payment.fornecedor.razao_social" color="primary" disabled hide-details />
                  </v-col>

                  <v-col cols="2">
                    <CustomInput label="Valor" v-model="payment.valor_total" color="primary" disabled mask="money" hide-details />
                  </v-col>

                  <v-col cols="2">
                    <CustomInput label="Vencimento" v-model="payment.data_vencimento" color="primary" disabled hide-details />
                  </v-col>

                  <v-col cols="auto" >
                    <v-chip color="blue" text="Internacional" v-if="!payment.internacional" />
                    <v-chip color="secondary" text="Urgente" v-if="!payment.urgente" />
                  </v-col>

                  <v-col cols="3">
                    <CustomInput label="Categoria" v-model="payment.categoria.nome" color="primary" disabled hide-details />
                  </v-col>

                  <v-col cols="4" v-if="payment.projeto">
                    <CustomInput label="Projeto" v-model="payment.projeto.nome" color="primary" disabled hide-details v-if="payment.projeto" />
                  </v-col>

                  <v-col cols="2">
                    <CustomInput label="Tipo" v-model="payment.tipo_pagamento.nome" color="primary" disabled hide-details />
                  </v-col>

                  <v-col cols="2">
                    <CustomInput label="Solicitante" v-model="payment.usuario.nome" color="primary" disabled hide-details />
                  </v-col>

                  

                  <!-- <v-col cols="2">
                    <CustomInput label="Internacional" :value="payment.fornecedor.internacional ? 'Sim' : 'Não'" color="primary" disabled hide-details />
                  </v-col> -->

                  

                  

                  <!-- <v-col cols="2" v-if="isTED(payment.tipo_pagamento.nome)">
                    <CustomInput label="Banco" v-model="payment.dados_bancarios.banco" color="primary" disabled hide-details />
                  </v-col>

                  <v-col cols="2" v-if="isTED(payment.tipo_pagamento.nome)">
                    <CustomInput label="Agência" v-model="payment.dados_bancarios.agencia" color="primary" disabled hide-details />
                  </v-col>

                  <v-col cols="2" v-if="isTED(payment.tipo_pagamento.nome)">
                    <CustomInput label="Conta" v-model="payment.dados_bancarios.conta" color="primary" disabled hide-details />
                  </v-col>

                  <v-col cols="3" v-if="isPIX(payment.tipo_pagamento.nome)">
                    <CustomInput label="Chave PIX" v-model="payment.dados_bancarios.chave_pix" color="primary" disabled hide-details />
                  </v-col>

                  <v-col cols="6" v-if="isBoleto(payment.tipo_pagamento.nome)">
                    <CustomInput label="Código de Barras" v-model="payment.dados_bancarios.codigo_barras" color="primary" disabled hide-details />
                  </v-col>

                  <v-col cols="6" v-if="isPagOnline(payment.tipo_pagamento.nome)">
                    <CustomInput label="Link de Pagamento" v-model="payment.dados_bancarios.outhers" color="primary" disabled hide-details />
                  </v-col>

                  <v-col cols="2" v-if="isCartao(payment.tipo_pagamento.nome) && payment.conta_empresa">
                    <CustomInput label="Número do Cartão" v-model="payment.conta_empresa.descricao" color="primary" disabled hide-details />
                  </v-col> -->
                </v-row>
              </v-col>

              <v-col cols="2">
                <v-row align="end" style="flex-direction: column" justify="center">
                  <v-col cols="auto">
                    <v-chip v-if="sentWithSuccess(payment)" color="green" text="Enviado com sucesso" />
                    <v-chip v-else-if="sentAndError(payment)" color="red" text="Erro ao enviar" />
                    <v-chip v-else color="gray" text="Não enviado" />
                  </v-col>

                  <v-col cols="auto">
                    <v-btn flat icon @click.stop="viewPayment(payment.id)" variant="plain" color="primary" size="40">
                      <v-icon>mdi-eye</v-icon>
                      <v-tooltip text="Visualizar pagamento" activator="parent" location="top" />
                    </v-btn>

                    <v-btn flat icon @click.stop="editPayment(payment.id)" variant="plain" color="primary" size="40">
                      <v-icon>mdi-pencil</v-icon>
                      <v-tooltip text="Editar pagamento" activator="parent" location="top" />
                    </v-btn>

                    <v-btn flat icon @click.stop="sendPaidPayment(payment.id)" variant="plain" color="primary" size="40">
                      <v-icon>mdi-send-clock</v-icon>
                      <v-tooltip text="Mover para provisionado" activator="parent" location="top"></v-tooltip>
                    </v-btn>

                    <v-btn flat icon @click.stop="confirmCancelPayment(payment.id)" variant="plain" color="red" size="40">
                      <v-icon>mdi-cancel</v-icon>
                      <v-tooltip text="Cancelar pagamento" activator="parent" location="top" />
                    </v-btn>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>

            <v-row justify="start">
              <v-col v-if="payment.enviado_externo" cols="auto">
                <v-alert :text="payment.retorno_externo?.codigo_status" :color="payment.retorno_externo?.color" density="compact" />
                <v-tooltip activator="parent" text="Código de erro do sistema Omie" />
              </v-col>
              <v-col v-if="payment.enviado_externo" cols="auto">
                <v-alert :text="payment.retorno_externo?.descricao_status" :color="payment.retorno_externo?.color" density="compact" />
                <v-tooltip activator="parent" text="Mensagem de erro do sistema Omie" />
              </v-col>
            </v-row>
          </v-card>
        </v-card>
      </div>

      <v-row no-gutters align="center" justify="center" class="my-10" v-else-if="notExistPayments">
        <CustomText title="Não existe pagamentos nesse cliente" color="primary" size="20" :bold="true" class="text-center" />
      </v-row>

      <v-row no-gutters align="center" justify="center" class="my-10" v-else>
        <CustomText title="Selecione um cliente primeiro" color="primary" size="20" :bold="true" class="text-center" />
      </v-row>

      <v-btn color="green" class="btn-send" icon size="75" @click="sendOmie" :loading="loading" :disabled="countPayments === 0">
        <v-icon>mdi-send</v-icon>
        <v-tooltip text="Enviar pagamentos para o Omie" activator="parent" location="left" />
      </v-btn>

      <LazyModalConfirmCancel v-model:enable="enableModal.cancel" v-model:justificativa="justificativa" :actions="modalActions" :item="selectedPayment" />
      <LazyModalPagamento v-model:enable="enableModal.viewPayment" :id="selectedPayment?.id" />
    </v-form>
  </LayoutForm>
</template>
<script setup>
// * IMPORTS

import dayjs from '#build/dayjs.imports.mjs'
import { getEmpresa, getClientByPayment, getPagamentoByClient, sendPaymentsToOmie, postStatus } from '@api'

const router = useRouter()
const route = useRoute()
const { $toast } = useNuxtApp()

// * DATA

const clients = ref([])
const payments = ref([])

const loading = ref(false)
const loadingPayments = ref(false)
const showPayments = ref(false)
const notExistPayments = ref(false)

const justificativa = ref(null)

const selectedClient = ref(null)
const selectedPayment = ref(null)
const enableModal = reactive({ cancel: false, viewPayment: false })

// * COMPUTEDS

const countPayments = computed(() => payments.value.filter((payment) => payment.selectedOmie).length)
const paymentsCountTitle = computed(() => `Pagamentos selecionados: ${countPayments.value}`)
const hasPaymentSuccessFul = computed(() => payments.value.some((payment) => payment.enviado_externo && payment.codigo_lancamento_omie))

const modalActions = computed(() => [
  { title: 'Fechar', icon: 'mdi-close', color: 'grey', type: 'cancel', click: () => (enableModal.cancel = false) },
  { title: 'Confirmar', icon: 'mdi-check', color: 'green', type: 'success', click: cancelPayment, loading: loading.value }
])

// * METHODS

const getClients = async () => {
  try {
    const { success, message, data } = await getClientByPayment()
    if (!success) throw new Error(message)

    clients.value = data
  } catch (error) {
    console.log(error)
    $toast.error('Erro ao buscar clientes')
  }
}

const getPaymentByClient = async () => {
  loadingPayments.value = true
  showPayments.value = false
  notExistPayments.value = false
  try {
    const { success, message, data } = await getPagamentoByClient(selectedClient.value)
    if (!success) throw new Error(message)
    payments.value = data.map(formatPaymentData)

    showPayments.value = payments.value.length > 0
    notExistPayments.value = payments.value.length === 0
  } catch (error) {
    console.error(error)
    $toast.error('Erro ao buscar pagamentos')
  } finally {
    loadingPayments.value = false
  }
}

const sendOmie = async () => {
  if (countPayments.value === 0) return $toast.error('Selecione ao menos um pagamento')

  let errorCount = 0,
    successCount = 0

  const paymentsToSend = payments.value.filter((payment) => payment.selectedOmie)

  for await (const payment of paymentsToSend) {
    let codigo = ''
    try {
      const { success, message, data } = await sendPaymentsToOmie(payment.id)
      if (!success) throw new Error(message)

      if (!data.success) {
        codigo = data.faultcode
        throw new Error(data.message)
      }

      payment.codigo_lancamento_omie = data.codigo_lancamento_omie

      const findPayment = payments.value.find((p) => p.id === payment.id)
      findPayment.selectedOmie = false

      payment.retorno_externo = { codigo_status: '1', descricao_status: 'Enviado com sucesso', color: 'green' }
      payment.enviado_externo = true

      successCount++
    } catch (error) {
      payment.retorno_externo = { codigo_status: codigo, descricao_status: error.message, codigo_status: codigo, color: '#e75c51' }
      payment.enviado_externo = true

      errorCount++
      console.error(error.message)
    }
  }

  // await getPaymentByClient()

  loading.value = false

  if (errorCount === 0) $toast.success('Todos os pagamentos foram enviados com sucesso')
  else $toast.error(`Alguns pagamentos falharam. Sucessos: ${successCount}, Falhas: ${errorCount}`, { duration: 5000 })
}

const sendPaidPayment = async (id) => {
  loading.value = true

  try {
    const { success, message } = await postStatus({ id: [id], status: 5 }) // * Pago

    if (!success) throw new Error(message)

    $toast.success('Pagamento provisionado com sucesso')

    await getPaymentByClient()

    loading.value = false
  } catch (error) {
    console.error(error)
    $toast.error('Erro ao mover pagamento para provisionado')
  }
}

const cancelPayment = async () => {
  try {
    if (!justificativa.value) return $toast.error('Justificativa é obrigatória')

    const { success, message } = await postStatus({ id: [selectedPayment.value.id], status: 7, justificativa: justificativa.value }) // ! Cancelado
    if (!success) throw new Error(message)

    $toast.success('Pagamento cancelado com sucesso')

    await getPaymentByClient()

    enableModal.cancel = false
    justificativa.value = null
  } catch (error) {
    console.error(error)
    $toast.error('Erro ao cancelar pagamento')
  }
}

const viewPayment = (id) => {
  const payment = payments.value.find((payment) => payment.id === id)
  if (!payment) return $toast.error('Pagamento não encontrado')

  selectedPayment.value = payment
  enableModal.viewPayment = true
}

// * AUX

const isPIX = (type) => type === 'PIX'
const isTED = (type) => type === 'TED'
const isBoleto = (type) => type === 'Boleto'
const isPagOnline = (type) => type === 'Pagamento Online'
const isCartao = (type) => type === 'Cartão de crédito' || type === 'Cartão de débito'

watch(selectedClient, async (value) => { if (selectedClient.value) await getPaymentByClient() })

watch(route, (value) => {
  console.log(value.query)
  if(value.query.client_id) selectedClient.value = Number(value.query.client_id)
}, {deep: true, immediate: true})

const editPayment = (id) => router.push({ path: `../pagamento/${id}`, query: { client_id: selectedClient.value, edit: false } })

const sentAndError = (payment) => payment.enviado_externo && !payment.codigo_lancamento_omie
const sentWithSuccess = (payment) => payment.enviado_externo && payment.codigo_lancamento_omie

const confirmCancelPayment = async (id) => {
  selectedPayment.value = payments.value.find((payment) => payment.id === id)
  enableModal.cancel = true
}

const selectPayment = (id) => {
  const payment = payments.value.find((payment) => payment.id === id)
  if (!payment) return $toast.error('Pagamento não encontrado')

  payment.selectedOmie = !payment.selectedOmie
  countPayments.value = payments.value.filter((payment) => payment.selectedOmie).length
}

const formatPaymentData = (payment) => {
  payment.data_vencimento = dayjs(payment.data_vencimento).format('DD/MM/YYYY')

  if (typeof payment.dados_bancarios === 'string') payment.dados_bancarios = JSON.parse(payment.dados_bancarios)
  if (typeof payment.retorno_externo === 'string') payment.retorno_externo = JSON.parse(payment.retorno_externo)

  payment.selectedOmie = false
  return payment
}

const paymentSelectedOrNot = (selected) => {
  if (selected) return 'mdi-checkbox-marked'
  return 'mdi-checkbox-blank-outline'
}

const colorDependingOnReturn = (payment) => {
  if (payment.enviado_externo && !payment.codigo_lancamento_omie) return '#e75c51'
  else return 'green'
}

// * HOOKS

onMounted(async () => await getClients())

// * WATCHERS

watch(selectedClient, async () => {
  if (selectedClient.value) await getPaymentByClient()
})
</script>
<style scoped>

.row-text {
  margin: 10px;
}
.row-input {
  margin-left: 10px;
}
.icon-box {
  display: flex;
  justify-content: end;
  align-items: center;
}

.text-header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 750px;
}

.row-input-header {
  margin-left: 10px;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
}

.card-payment-box {
  border-radius: 6px;
  padding: 14px 14px 7px;
}

.btn-send {
  position: fixed;
  bottom: 25px;
  right: 20px;
  padding: 10px 20px;
  font-size: 16px;
  font-weight: bold;
  color: white;
  background-color: #118b9f;
}

.approved-box {
  background-color: #ddffdd!important;
}

.error-box {
  background-color: #ffdddd!important;
}

.selected-box {
  background-color: #118c9f60!important;
}
</style>
