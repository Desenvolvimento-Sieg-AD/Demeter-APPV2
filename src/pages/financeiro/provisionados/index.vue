<template>
  <div>
    <CustomHeader title="Financeiro" />
    <LayoutForm>
      <CustomTableSelect
        pager
        store-state
        :items="itens"
        choose-columns
        selectionCheck
        :page-size="15"
        :loading="loadingTable"
        :columns="colums"
        :actions="actions"
        allowColumnResizing
        allow-column-reordering
        key-stored="pagamentos-table"
        :allowed-page-sizes="[5, 15, 10, 25]"
        @selectionChanged="handleSelectionChange"
        noDataText="Não há nenhuma solicitação de pagamento"
        :paymentsSelecteds="itemsSelects.length > 0"
        page="financeiro"
        @editPayment="openEditPayment"
        @disapprovePayment="openDisapprovePayment"
        @approvePayment="openApprovePayment"
      >
        <template #item-usuario="{ data: { data: item } }">
          <div>
            <v-tooltip :text="item.usuario?.nome" activator="parent" location="top" />
            {{ item.usuario?.sigla }}
          </div>
        </template>

        <template #item-categoria="{ data: { data: item } }">
          <div class="d-flex align-center justify-center text-center">
            {{ item?.categoria?.nome }}
          </div>
        </template>

        <template #item-tipo="{ data: { data: item } }">
          <div class="d-flex align-center justify-center text-center">
            {{ item.fornecedor.tipo === 'juridico' ? 'Jurídico' : 'Físico' }}
          </div>
        </template>

        <template #item-status="{ data: { data: item } }">
          <div class="d-flex align-center justify-center text-center">
            <v-chip :color="item.movimentacoes_pagamento[0].status_pagamento.cor">
              <p class="font-weight-bold">
                {{ item.movimentacoes_pagamento[0].status_pagamento.nome }}
              </p>
            </v-chip>
          </div>
        </template>

        <template #item-urgente="{ data: { data: item } }">
          <v-chip :color="item.urgente ? 'red' : 'gray'">
            <p class="font-weight-bold">
              {{ item.urgente ? 'Sim' : 'Não' }}
            </p>
          </v-chip>
        </template>

        <template #item-documento="{ data: { data: item } }">
          <div class="d-flex align-center justify-center text-center">
            {{ defineDocument(item.fornecedor.tipo, item.fornecedor.documento) }}
          </div>
        </template>

        <template #item-anexo="{ data: { data: item } }">
          <div class="d-flex align-center justify-center text-center">
            <div v-if="isNF(item.anexos_pagamento)">
              <v-icon @click="openFiles(item.anexos_pagamento)" color="success" class="cursor-pointer"> mdi-paperclip </v-icon>

              <v-tooltip text="Abrir anexo" activator="parent" location="top" />
            </div>

            <div v-else>
              <v-icon disabled color="gray"> mdi-paperclip </v-icon>
              <v-tooltip text="Sem anexo" activator="parent" location="top" />
            </div>
          </div>
        </template>

        <template #item-doc="{ data: { data: item } }">
          <div class="d-flex align-center justify-center text-center">
            <div v-if="isDOC(item.anexos_pagamento)">
              <v-icon @click="openFiles(item.anexos_pagamento)" color="success" class="cursor-pointer"> mdi-paperclip </v-icon>
              <v-tooltip text="Abrir anexo" activator="parent" location="top" />
            </div>

            <div v-else>
              <v-icon disabled color="gray">mdi-paperclip</v-icon>
              <v-tooltip text="Sem anexo" activator="parent" location="top" />
            </div>
          </div>
        </template>

        <template #item-data="{ data: { data: item } }">
          <div class="d-flex align-center justify-center text-center">
            {{ formatDate(item.data_vencimento) }}
          </div>
        </template>

        <template #item-data_aprovacao="{ data: { data: item } }">
          <div class="d-flex align-center justify-center text-center">
            {{ formatDate(item.movimentacoes_pagamento[0].data_inicio) }}
          </div>
        </template>

        <template #item-created_at="{ data: { data: item } }">
          <div class="template">
            {{ formatDate(item.created_at) }}
          </div>
        </template>

        <template #item-valor_total="{ data: { data: item } }">
          <div class="d-flex align-center justify-center text-center">
            {{ formatCurrency(item.valor_total) }}
          </div>
        </template>

        <template #item-setor="{ data: { data: item } }">
          <div class="d-flex align-center justify-center text-center">
            <div v-for="(set, index) in item.usuario.setores" :key="index" :class="classSetor(item, index)">
              <v-tooltip :text="set.nome" activator="parent" location="top" />

              {{ defineNameSetor(set.sigla, item, index) }}
            </div>
          </div>
        </template>

        <template #item-empresa="{ data: { data: item } }">
          <div class="d-flex align-center justify-center text-center">
            <v-tooltip :text="item.empresa.nome" activator="parent" location="top" />
            {{ item?.empresa?.apelido }}
          </div>
        </template>
      </CustomTableSelect>

    </LayoutForm>

    <LazyModalPagamento v-model:enable="enableModal.pagamento" :id="viewPayment.id" />

  </div>
</template>

<script setup>
// * IMPORT

import CustomStore from 'devextreme/data/custom_store'
import { getPagamentoByScope, postStatus, omie } from '@api'
const { $toast } = useNuxtApp()
const colums = getColumns('financeiro')
const access = useRuntimeConfig()
const path = access.public.PAGAMENTO_PATH

// * DATA

const itens = ref([])
const viewPayment = ref({})
const itemsSelects = ref([])
const justificativa = ref(null)
const loadingModal = ref(false)
const loadingTable = ref(false)
const clients = ref([])
const link = ref('')

const enableModal = reactive({
  link: false,
  export: false,
  confirm: false,
  allEdit: false,
  editCount: false,
  pagamento: false,
  allConfirm: false,
  exportToClient: false
})

const actions = computed(() => [
  {
    icon: 'mdi-eye',
    tooltip: 'Ver detalhes',
    click: (item) => {
      viewPayment.value = item
      enableModal.pagamento = true
    },
    active: true,
    type: 'info'
  },
])

// * METHODS

const openFile = (filePath) => {
  try {
      // window.electronAPI.openFile(filePath).then((response) => {
      // 	if (!response.success) {
      // 		console.error('Erro ao abrir arquivo:', response.message);
      // 	}
      // }); //? APP

      useOs().openFile(filePath) //? Template

  } catch (error) {
    console.log(error)
    $toast.error('Erro ao abrir arquivo')
  }

}

const openFiles = (anexos) => {
  const statusAllowed = [3, 4]

  const anexo = anexos.find((anexo) => statusAllowed.includes(anexo.tipo_anexo_id))
  if (!anexo) return $toast.error('Anexo não encontrado')
  openFile(`${path}${anexo.caminho}`)
}

const isNF = (anexos) => anexos.find((anexo) => anexo.tipo_anexo_id === 3)

const isDOC = (anexos) => anexos.find((anexo) => anexo.tipo_anexo_id === 4)

const defineDocument = (tipo) => (tipo === 'juridico' ? maskCnpj(item.fornecedor.documento) : maskCpf(item.fornecedor.documento))

const smallerIndex = (index, item) => index < item.length - 1

const classSetor = (item, index) => (smallerIndex(index, item.usuario.setores) ? 'mr-2' : '')

const defineNameSetor = (sigla, item, index) => (smallerIndex(index, item.usuario.setores) ? `${sigla}, ` : sigla)

const handleSelectionChange = (items) => (itemsSelects.value = items)

const validBeforeSend = async () => {
  const status_id = confirm.value === 'approve' ? 3 : 8

  const lista_id = itemsSelects.value.map((item) => item.id)

  await sendStatus(status_id, lista_id)
}

const pushData = async () => {
  loadingTable.value = true
  try {
    const { success, message, data } = await getPagamentoByScope('financeiroProvisionados')
    if (!success) throw new Error(message)

    data.map((item) => {
      // item.setor = item.usuario.setores[0].sigla
      item.status = item.movimentacoes_pagamento[0].status_pagamento.nome
      item.lote = item.movimentacoes_pagamento.at().lote
    })

    itens.value = data

    loadingTable.value = false
  } catch (error) {
    console.error(error.message)
    $toast.error('Erro ao buscar dados')
    loadingTable.value = false
  }
}

await pushData()
</script>

<style scoped>
.btn-container {
  display: flex;
  justify-content: flex-end;
  margin: 10px 0;
}

.custom-btn {
  margin-right: 10px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
