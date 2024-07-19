<template>
  <Modal v-model:enable="enableValue" :actions="actions" title="Editar Pagamento" width="auto">
    <template #content>
      <LayoutLoading v-if="loading" />

      <div v-else-if="pagamento">
        <LayoutTitle title="Dados do Pagamento" :margin="false">
          <div>
            <v-chip v-if="pagamento.urgente" text="Urgente" color="red" variant="tonal" class="mr-1" />
            <v-chip v-if="pagamento.privado" text="Privado" color="purple" variant="tonal" class="mr-1" />
            <v-chip v-if="fornecedor.internacional" text="Internacional" color="blue" variant="tonal" class="mr-1" />
            <v-chip :color="ultimaMovimentacao.status_pagamento.cor" :text="ultimaMovimentacao.status_pagamento.nome" variant="tonal" />
          </div>
        </LayoutTitle>

        <v-alert :color="ultimaMovimentacao.status_pagamento.cor" icon="mdi-alert" density="compact" variant="tonal" v-if="ultimaMovimentacao.status_pagamento.id !== 1 && (ultimaMovimentacao.status_pagamento.justificativa || ultimaMovimentacao.status_pagamento.justificativa_solicitante)">
          {{ ultimaMovimentacao.justificativa ?? ultimaMovimentacao.justificativa_solicitante }}
        </v-alert>

        <v-divider class="my-4" />

        <v-row align="center" style="max-height: calc(100vh - 620px); overflow-y: auto">
          <v-col cols="3">
            <CustomInput disabled label="Solicitante" hide-details v-model="pagamento.usuario.sigla" />
          </v-col>

          <v-col cols="3">
            <CustomInput disabled label="Setor Referência" hide-details v-model="pagamento.setor_referencia.nome" />
          </v-col>

          <v-col cols="3">
            <CustomInput hide-details label="Setor Solicitante" v-model="pagamento.setor_solicitante.nome" disabled />
          </v-col>

          <v-col cols="3">
            <CustomInput disabled label="Data Solicitação" hide-details v-model="pagamento.data_solicitacao" />
          </v-col>

          <v-divider class="mx-3 my-1" />

          <v-col cols="3">
            <CustomInput disabled label="Empresa Pagadora" hide-details v-model="pagamento.empresa.apelido" />
          </v-col>

          <v-col cols="4">
            <CustomInput disabled label="Grupo" hide-details v-model="pagamento.categoria.grupo.nome" />
          </v-col>

          <v-col cols="5">
            <CustomInput disabled label="Categoria" hide-details v-model="pagamento.categoria.nome" />
          </v-col>

          <v-divider class="mx-3 my-1" />

          <!-- Nacional -->

          <v-col cols="9" v-if="!isInternacional">
            <CustomInput disabled label="Fornecedor" hide-details v-model="fornecedor.razao_social" />
          </v-col>

          <v-col cols="3" v-if="!isInternacional">
            <CustomInput disabled label="Documento" hide-details v-model="documentoFormatado" />
          </v-col>

          <v-col cols="3" v-if="!isInternacional">
            <CustomInput label="Número NF" disabled hide-details v-model="pagamento.numero_nf" />
          </v-col>

          <v-col cols="9" v-if="!isInternacional">
            <CustomInput label="Chave de Acesso" disabled hide-details v-model="pagamento.chave_nf" />
          </v-col>

          <!-- Internacional -->

          <v-col cols="7" v-if="isInternacional">
            <CustomInput disabled label="Fornecedor" hide-details v-model="fornecedor.razao_social" />
          </v-col>

          <v-col cols="5" v-if="isInternacional">
            <CustomInput disabled :label="isInternacional ? 'Invoice' : 'Número NF'" hide-details v-model="pagamento.numero_nf" />
          </v-col>

          <v-col cols="12" v-if="pagamento.projeto">
            <CustomInput label="Projeto" hide-details v-model="pagamento.projeto.nome" disabled />
          </v-col>

          <v-divider class="mx-3 my-1" />

          <!-- Valores e Vigências -->

          <v-col v-if="isInternacional" cols="3">
            <CustomInput disabled label="Valor em Dólar" hide-details mask="money" currency="USD" v-model="pagamento.valor_total_dolar" />
          </v-col>

          <v-col cols="3">
            <CustomInput disabled label="Valor" hide-details mask="money" v-model="pagamento.valor_total" />
          </v-col>

          <v-col :cols="isInternacional ? '3' : '6'"> </v-col>

          <v-col cols="3">
            <CustomInput disabled type="date" label="Vencimento" hide-details v-model="pagamento.data_vencimento" />
          </v-col>

          <!-- Forma de Pagamento -->

          <v-col cols="3">
            <CustomInput disabled label="Forma de Pagamento" hide-details v-model="pagamento.tipo_pagamento.nome" />
          </v-col>

          <!-- Cartão -->

          <v-col cols="3" v-if="pagamento.tipo_id == 5 || pagamento.tipo_id == 6">
            <CustomInput disabled label="Conta" hide-details v-model="pagamento.conta_empresa.descricao" />
          </v-col>

          <!-- PIX -->

          <v-col v-if="pagamento.tipo_id == 1" cols="3">
            <CustomInput label="Tipo de Chave" hide-details v-model="pagamento.tipo_chave_pix.nome" disabled />
          </v-col>

          <v-col v-if="pagamento.tipo_id == 1 && pagamento.tipo_chave_pix_id" cols="6">
            <CustomInput disabled label="Chave Pix" hide-details v-model="pagamento.dados_bancarios.chave_pix" />
          </v-col>

          <!-- TED -->

          <v-col cols="3" v-if="pagamento.tipo_id == 2">
            <CustomInput disabled label="Banco" hide-details v-model="pagamento.dados_bancarios.banco" />
          </v-col>

          <v-col cols="2" v-if="pagamento.tipo_id == 2">
            <CustomInput disabled label="Agência" hide-details v-model="pagamento.dados_bancarios.agencia" />
          </v-col>

          <v-col cols="3" v-if="pagamento.tipo_id == 2">
            <CustomInput disabled label="Conta" hide-details v-model="pagamento.dados_bancarios.conta" />
          </v-col>

          <v-col cols="1" v-if="pagamento.tipo_id == 2">
            <CustomInput disabled label="Conta" hide-details v-model="pagamento.dados_bancarios.digito" />
          </v-col>

          <!-- Boleto -->

          <v-col v-if="pagamento.tipo_id == 3" cols="9">
            <CustomInput disabled label="Código de Barras" hide-details v-model="pagamento.dados_bancarios.outhers" />
          </v-col>

          <!-- Pagamento Online -->

          <v-col v-if="pagamento.tipo_id == 4" cols="9">
            <CustomInput disabled label="Link do pagamento online" hide-details v-model="pagamento.dados_bancarios.outhers" />
          </v-col>

          <!-- Dinheiro -->

          <v-col v-if="pagamento.tipo_id == 7" cols="9">
            <CustomInput disabled label="Descrição do Pagamento" hide-details v-model="pagamento.dados_bancarios.outhers" />
          </v-col>

          <v-divider class="mx-4 my-1" />

          <!-- Motivo -->

          <v-col cols="12">
            <CustomInput type="textarea" disabled label="Motivo do Pagamento" hide-details :rows="4" v-model="pagamento.motivo" />
          </v-col>

          <v-col cols="12" v-if="pagamento.dados_complementares">
            <CustomInput disabled label="Observações" hide-details v-model="pagamento.dados_complementares" />
          </v-col>

          <v-col v-if="pagamento.urgente">
            <CustomInput disabled label="Justificativa Urgência" hide-details v-model="pagamento.justificativa_urgente" />
          </v-col>
        </v-row>

        <v-divider class="mt-6 mb-2" />

        <LayoutTitle title="Arquivos" :margin="false" />

        <v-row align="start" justify="start" class="mb-2 d-flex flex-wrap mr-2" no-gutters style="height: 70px; overflow-y: auto">
          <v-card flat color="bgtertiary" @click="openBase64File(arquivoNF)" class="d-flex flex-row align-center ma-2" width="300px" height="52px" v-if="arquivoNF">
            <v-icon color="primary" class="mx-2">mdi-file-document</v-icon>
            <v-card-text>
              <h3>Nota Fiscal</h3>
            </v-card-text>

            <v-btn icon @click.stop="copyFilePath(arquivoNF.caminho)" flat color="transparent" class="ml-auto">
              <v-icon color="primary" class="cursor-pointer">mdi-content-copy</v-icon>
              <v-tooltip text="Copiar local do arquivo" activator="parent" location="top" />
            </v-btn>

            <v-tooltip :text="`Abrir arquivo ${arquivoNF.nome}`" activator="parent" location="bottom" />
          </v-card>

          <v-card flat color="bgtertiary" class="d-flex flex-row align-center ma-2" width="300px" height="52px" v-else >
            <v-icon color="red" class="mx-2">mdi-file-document-remove</v-icon>
            <v-card-text>
              <h3>Nenhuma nota fiscal anexada</h3>
            </v-card-text>
          </v-card>

          <v-card flat color="bgtertiary" @click="openBase64File(arquivoPagamento)" class="d-flex flex-row align-center ma-2" width="300px" height="52px" v-if="arquivoPagamento">
            <v-icon color="primary" class="mx-2">mdi-file-document</v-icon>
            <v-card-text>
              <h3>Arquivo anexo</h3>
            </v-card-text>

            <v-btn icon @click.stop="copyFilePath(arquivoPagamento.caminho)" flat color="transparent" class="ml-auto">
              <v-icon color="primary" class="cursor-pointer">mdi-content-copy</v-icon>
              <v-tooltip text="Copiar local do arquivo" activator="parent" location="top" />
            </v-btn>

            <v-tooltip :text="`Abrir arquivo ${arquivoPagamento.nome}`" activator="parent" location="bottom" />
          </v-card>

          <v-card flat color="bgtertiary" class="d-flex flex-row align-center ma-2" width="300px" height="52px" v-else >
            <v-icon color="red" class="mx-2">mdi-file-document-remove</v-icon>
            <v-card-text>
              <h3>Nenhum arquivo anexado</h3>
            </v-card-text>
          </v-card>
        </v-row>
      </div>
    </template>
  </Modal>
</template>

<script setup>
//* IMPORTS

import { getPagamentoById } from '~/api'
const { $toast } = useNuxtApp()
const { openBase64File, copyFilePath } = useOs()
const dayjs = useDayjs()

//* PROPS

const props = defineProps({
  id: { type: Number },
  enable: { type: Boolean, default: false },
  pagamento: { type: Object, default: null },
})

//* EMITS

const emit = defineEmits(['update:enable', 'getPagamento'])

//* DATA

const pagamento = ref(null)
const fornecedor = ref({
  id: null,
  razao_social: null,
  documento: null,
  tipo: null,
  internacional: false
})
const arquivoNF = ref(null)
const arquivoPagamento = ref(null)
const loading = ref(false)

//* COMPUTED

const enableValue = computed({
  get: () => props.enable,
  set: (value) => emit('update:enable', value)
})

const ultimaMovimentacao = computed(() => {
  if (!pagamento.value) return null
  return pagamento.value.movimentacoes_pagamento.find((mov) => !mov.data_fim)
})

const documentoFormatado = computed(() => {
  if (!fornecedor.value.documento || !fornecedor.value.documento) return null

  if (fornecedor.value.tipo === 'juridico' && fornecedor.value.documento) return maskCnpj(fornecedor.value.documento)
  return maskCpf(fornecedor.value.documento)
})

const isInternacional = computed(() => fornecedor.value.internacional)

//* METHODS

const actions = computed(() => [
  {
    title: 'Fechar',
    icon: 'mdi-close',
    tooltip: 'Fechar',
    type: 'cancel',
    loading: loading.value,
    click: () => (enableValue.value = false)
  }
])

//* GETTERS

const getPagamento = async () => {
  try {
    loading.value = true

    const { success, message, data } = await getPagamentoById(props.id)
    if (!success) throw new Error(message)

    pagamento.value = data
    fornecedor.value = data.fornecedor

    arquivoNF.value = data.anexos_pagamento.find((anexo) => anexo.tipo_anexo_id === 3)
    arquivoPagamento.value = data.anexos_pagamento.find((anexo) => anexo.tipo_anexo_id === 4)
    pagamento.value.data_solicitacao = dayjs(pagamento.value.created_at).format('DD/MM/YYYY HH:mm')

    loading.value = false
  } 
  catch (error) {
    $toast.error('Erro ao buscar pagamento')
    enableValue.value = false
  }
}

//* WATCHERS

watch(() => props.enable, (value) => {
  if (value) getPagamento()
})

</script>
