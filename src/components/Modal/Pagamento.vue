<template>
  <Modal v-model:enable="enableValue" :actions="actions" title="Detalhes do Pagamento" width="auto">
    <template #content>
      <LayoutLoading v-if="loading" />

      <v-col v-else-if="pagamento">
        <v-row align="center" class="mb-2">
          <v-col cols="5" class="d-flex align-center justify-start pb-0">
            <h3 style="color: #F68A1A">Dados do Pagamento</h3>
          </v-col>
          <v-col cols="7" class="d-flex align-center justify-end pb-0 ga-2">
            <v-chip :color="ultimaMovimentacao.status_pagamento.cor" :text="ultimaMovimentacao.status_pagamento.nome" hide-details />
            <v-chip v-if="pagamento.urgente" color="red" text="Urgente" hide-details prepend-icon="mdi-alert" class="ml-1" />
            <v-chip v-if="pagamento.updatedByUser?.sigla" class="text-body-2" :text="textUpdatedByUser" color="primary"/>
            <v-chip v-if="pagamento.privado" text="Privado" class="text-body-2" color="red-accent-4"></v-chip>
          </v-col>
        </v-row>

        <v-row class="my-2" v-if="statusCancelados">
          <v-col>
            <CustomInput
              type="textarea"
              v-model="pagamento.observacao"
              :label="labelObservacaoCancelamento"
              :value="ultimaMovimentacao.justificativa ?? ultimaMovimentacao.justificativa_solicitante"
              hide-details
              readonly
              :rows="1"
            />
          </v-col>
        </v-row>

        <v-divider class="mb-6" />

        <v-row align="center">
          <v-col cols="3">
            <CustomInput readonly label="Solicitante" hide-details v-model="pagamento.usuario.sigla" />
          </v-col>

          <v-col cols="3" v-if="pagamento.setorSolicitante">
            <CustomInput readonly label="Setor Solicitante" hide-details v-model="pagamento.setorSolicitante.nome" />
          </v-col>

          <v-col cols="3" v-if="pagamento.setorReferencia">
            <CustomInput readonly label="Setor Referência" hide-details v-model="pagamento.setorReferencia.nome" />
          </v-col>

          <v-col cols="3">
            <CustomInput readonly label="Data Solicitação" hide-details :value="dataSolitacao" v-model="dataSolitacao" />
          </v-col>

          <v-divider class="mx-3" />

          <v-col cols="3">
            <CustomInput readonly label="Empresa Pagadora" hide-details v-model="pagamento.empresa.apelido" />
          </v-col>

          <v-col cols="4">
            <CustomInput readonly label="Grupo" hide-details v-model="pagamento.categoria.grupo.nome" />
          </v-col>

          <v-col cols="5">
            <CustomInput readonly label="Categoria" hide-details v-model="pagamento.categoria.nome" />
          </v-col>

          <v-col cols="7">
            <CustomInput readonly label="Fornecedor" hide-details v-model="pagamento.fornecedor.razao_social" />
          </v-col>

          <v-col cols="3" v-if="!isInternacional">
            <CustomInput readonly label="Documento" hide-details v-model="documentoFormatado" :value="documentoFormatado" />
          </v-col>

          <v-col cols="2">
            <CustomInput readonly label="Internacional" hide-details v-model="isInternacionalText" />
          </v-col>

          <v-col cols="3">
            <CustomInput readonly :label="isInternacional ? 'Invoice' : 'Número NF'" hide-details v-model="numero_nf" />
          </v-col>

          <v-col cols="9" v-if="!isInternacional">
            <CustomInput readonly label="Chave de Acesso" hide-details v-model="chave_nf" />
          </v-col>

          <v-col cols="12" v-if="pagamento.projeto"> 
            <CustomInput readonly label="Projeto" hide-details v-model="pagamento.projeto.nome" />
          </v-col>

          <v-col v-if="isInternacional" cols="3">
            <CustomInput readonly label="Valor em Dólar" hide-details mask="money" currency="USD" v-model="pagamento.valor_total_dolar" />
          </v-col>

          <v-col cols="3">
            <CustomInput readonly :label="isInternacional ? 'Valor em Reais' : 'Valor total'" hide-details mask="money" v-model="pagamento.valor_total" />
          </v-col>

          <v-col cols="2">
            <CustomInput readonly label="Vencimento" hide-details v-model="dataVencimento" :value="dataVencimento" />
          </v-col>

          <v-col cols="4">
            <CustomInput readonly label="Forma de Pagamento" hide-details v-model="pagamento.tipo_pagamento.nome" />
          </v-col>

          <v-col cols="3" v-if="pagamento.conta_empresa">
            <CustomInput readonly label="Conta" hide-details v-model="pagamento.conta_empresa.descricao" />
          </v-col>

          <v-col v-if="pagamento.tipo_pagamento.nome === 'PIX' && pagamento.tipo_chave_pix" cols="2">
            <CustomInput readonly label="Tipo de Chave" hide-details v-model="pagamento.tipo_chave_pix.nome" />
          </v-col>

          <v-col cols="4" v-if="isTED">
            <CustomInput readonly label="Banco" hide-details v-model="dados_bancarios.banco" />
          </v-col>

          <v-col cols="4" v-if="isTED">
            <CustomInput readonly label="Agência" hide-details v-model="dados_bancarios.agencia" />
          </v-col>

          <v-col cols="4" v-if="isTED">
            <CustomInput readonly label="Conta" hide-details v-model="dados_conta" />
          </v-col>

          <v-col v-else>
            <CustomInput readonly :label="labelDataPayment" hide-details v-model="outhers" />
          </v-col>

          <v-divider class="mx-4" />

          <v-col cols="12">
            <CustomInput type="textarea" readonly label="Motivo do Pagamento" hide-details :rows="2" v-model="pagamento.motivo" />
          </v-col>

          <v-col cols="12">
            <CustomInput type="textarea" readonly label="Observações" hide-details :rows="2" v-model="pagamento.dados_complementares" />
          </v-col>

          <v-col v-if="pagamento.urgente">
            <CustomInput type="textarea" readonly label="Justificativa Urgência" hide-details :rows="2" v-model="pagamento.justificativa_urgente" />
          </v-col>

        </v-row>

        <v-divider class="my-6" v-if="pagamento?.anexos_pagamento?.length > 0" />

        <v-row align="center" class="mb-2" no-gutters v-if="pagamento?.anexos_pagamento?.length > 0">

          <v-col cols="12">
            <h3 style="color: #F68A1A">Arquivos</h3>
          </v-col>

          <v-row class="d-flex flex-wrap mr-2" no-gutters>
            <div v-for="anexo in pagamento.anexos_pagamento" :key="anexo.id" class="d-flex align-center mb-2 mr-2">
              <v-card flat color="#F7F5F5" @click="openFile(anexo.caminho, pagamento.privado)" class="d-flex flex-row align-center mr-2" width="450px">
                <v-icon color="primary" class="ml-2 mr-2">mdi-file-document</v-icon>
                <v-card-text>
                  {{ anexo.nome }}
                </v-card-text>
                <v-btn icon @click.stop="copyFilePath(anexo.caminho, pagamento.privado)" flat color="transparent" class="ml-auto">
                  <v-icon color="primary" class="cursor-pointer">mdi-content-copy</v-icon>
                  <v-tooltip text="Copiar local do arquivo" activator="parent" location="bottom" />
                </v-btn>
              </v-card>
            </div>
          </v-row>
          
        </v-row>
      </v-col>
    </template>
  </Modal>
</template>

<script setup>
//* IMPORTS

import { getPagamentoById, updatePagamento } from '@api/pagamento'
const { $toast } = useNuxtApp()
const dayjs = useDayjs()
const access = useRuntimeConfig()

//* PROPS

const props = defineProps({
  id: { type: Number },
  enable: { type: Boolean, default: false },
  pagamento: { type: Object, default: null }
})

//* EMITS

const emit = defineEmits(['update:enable', 'getPagamento'])

//* DATA

const caminho_normal = access.public.PAGAMENTO_PATH
const caminho_privado = access.public.PAGAMENTO_PRIVADO_PATH
const pagamento = ref(null)
const loading = ref(false)
const urgente = ref(null)
const dados_bancarios = ref(null)
const dados_conta = ref(null)
const outhers = ref(null)
const chave_nf = ref(null)
const numero_nf = ref(null)

const isTED = computed(() => pagamento.value.tipo_pagamento.nome === 'TED')

const labelDataPayment = computed(() => {
  if (pagamento.value.tipo_pagamento.nome === 'PIX') return 'Chave PIX'
  if (pagamento.value.tipo_pagamento.nome === 'Boleto') return 'Código de Barras'
  else return 'Dados do Pagamento'
})

//* COMPUTED

const enableValue = computed({
  get: () => props.enable,
  set: (value) => emit('update:enable', value)
})

const ultimaMovimentacao = computed(() => {
  if (!pagamento.value) return null
  return pagamento.value.movimentacoes_pagamento.find((mov) => !mov.data_fim)
})

const statusdeCancelamento = [2, 7, 8, 9]

const statusCancelados = computed(() => statusdeCancelamento.includes(ultimaMovimentacao.value.status_pagamento.id))

const labelObservacaoCancelamento = computed(() => {
  if(ultimaMovimentacao.value.status_pagamento.id === 2) return 'Motivo da Revisão'
  else return 'Motivo do Cancelamento'
})

const dataSolitacao = computed(() => {
  if (!pagamento.value) return null
  return dayjs(pagamento.value.created_at).format('DD/MM/YYYY HH:mm')
})

const dataVencimento = computed(() => {
  if (!pagamento.value) return null
  return dayjs(pagamento.value.data_vencimento).format('DD/MM/YYYY')
})

const documentoFormatado = computed(() => {
  const documento = pagamento.value.fornecedor.documento
  if (!documento) return null
  if (!pagamento.value) return null
  if (pagamento.value.fornecedor.tipo === 'juridico' && documento) return maskCnpj(documento)
  return maskCpf(documento)
})

const isInternacional = computed(() => pagamento.value.fornecedor.internacional)

const isInternacionalText = computed(() => (pagamento.value.fornecedor.internacional ? 'Sim' : 'Não'))

const actions = computed(() => [
  {
    title: 'Fechar',
    icon: 'mdi-close',
    tooltip: 'Fechar',
    type: 'cancel',
    click: () => (enableValue.value = false)
  }
])

const textUpdatedByUser = computed(() => {
  if (!pagamento.value.updatedByUser) return ''
  return `Atualizado por: ${pagamento.value.updatedByUser.sigla}`
})

//* METHODS

const getPagamento = async () => {
  try {
    loading.value = true

    const { success, message, data } = await getPagamentoById(props.id)

    if (!success) throw new Error(message)

    pagamento.value = data

    dados_bancarios.value = JSON.parse(pagamento?.value.dados_bancarios)

    dados_conta.value = `${dados_bancarios?.value?.conta} - ${dados_bancarios?.value?.digito}`

    outhers.value = dados_bancarios?.value?.outhers ?? 'Não informado'

    urgente.value = pagamento.value.urgente ? 'Sim' : 'Não'

    chave_nf.value = pagamento.value.chave_nf ?? 'Não informado'

    numero_nf.value = pagamento.value.numero_nf ?? 'Não informado'

    loading.value = false
  } catch (error) {
    console.error('Erro ao buscar pagamento:', error.message)
    $toast.error('Erro ao buscar pagamento')
  }
}

const saveUpdatePagamento = async () => {
  try {
    const { success, message } = await updatePagamento(pagamento.value.id, pagamento.value)

    if (!success) throw new Error(message)

    $toast.success('Pagamento atualizado com sucesso')

    enableValue.value = false

    emit('getPagamento')
  } catch (error) {
    console.error('Erro ao atualizar pagamento:', error.message)
    $toast.error('Erro ao atualizar pagamento')
  }
}

const openFile = async (path, privado) => {
  try {

    const caminho = privado ? caminho_privado : caminho_normal
    await useOs().openFile(`${caminho}/${path}`)

  } catch (error) {
    console.error('Erro ao abrir arquivo:', error.message)
    $toast.error('Não foi possível abrir o arquivo')
  }
}

const copyFilePath = async (anexo, privado) => {
  try {

    const caminho = privado ? caminho_privado : caminho_normal
    await useOs().copyFilePath(`${caminho}/${anexo.caminho}`)

    $toast.success('Caminho do arquivo copiado')
  } catch (error) {
    console.error('Erro ao copiar caminho do arquivo:', error.message)
    $toast.error('Não foi possível copiar o caminho do arquivo')
  }
}

const copyData = async (data) => {
  try {
    await useOs().copyFilePath(pagamento.value.chave_pix)
    $toast.success('Dados de pagamento copiado')
  } catch (error) {
    console.log('Erro ao copiar dados de pagamento:', error.message)
    $toast.error('Não foi possível copiar os dados de pagamento')
  }
}

//* WATCHERS

watch(() => props.enable, (value) => { if (value) getPagamento() })

</script>
