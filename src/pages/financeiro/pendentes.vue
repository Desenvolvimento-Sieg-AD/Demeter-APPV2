<template>
  <LayoutForm>
    <CustomTableMain
      ref="tableRef"
      pager
      store-state
      :items="pagamentos"
      choose-columns
      selectionCheck
      :loading="loading"
      :columns="colums"
      :actions="actions"
      allowColumnResizing
      allow-column-reordering
      key-stored="pagamentos-pendentes-table"
      :allowed-page-sizes="[5, 10, 15, 25, 30]"
      :page-size="15"
      @selectionChanged="handleSelectionChange"
      noDataText="Não há nenhuma solicitação de pagamento"
      :paymentsSelecteds="itemsSelects.length >= 1"
      page="financeiro"
      companiesFilter
      @editPayment="openEditPayment"
      @disapprovePayment="openDisapprovePayment"
      @approvePayment="openApprovePayment"
      height="calc(100vh - 170px)"
    >
      <template #[`item-usuario.sigla`]="{ data: { data: item } }">
        <div>
          <v-tooltip :text="item.usuario.nome" activator="parent" location="bottom" />
          {{ item.usuario.sigla }}
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

      <template #item-movimentacoes_pagamento[0].status_pagamento.nome="{ data: { data: item } }">
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
          <div v-if="notaFiscal(item.anexos_pagamento)">
            <v-icon @click="openBase64File(notaFiscal(item.anexos_pagamento).id)" color="blue" class="cursor-pointer"> mdi-paperclip </v-icon>
            <v-tooltip text="Abrir Nota Fiscal" activator="parent" location="top" />
          </div>

          <div v-else>
            <v-icon disabled color="gray"> mdi-paperclip </v-icon>
            <v-tooltip text="Sem Nota Fiscal" activator="parent" location="top" />
          </div>
        </div>
      </template>

      <template #item-doc="{ data: { data: item } }">
        <div class="d-flex align-center justify-center text-center">
          <div v-if="documentoAnexo(item.anexos_pagamento)">
            <v-icon @click="openBase64File(documentoAnexo(item.anexos_pagamento).id)" color="blue" class="cursor-pointer"> mdi-paperclip </v-icon>
            <v-tooltip text="Abrir Anexo" activator="parent" location="top" />
          </div>

          <div v-else>
            <v-icon disabled color="gray">mdi-paperclip</v-icon>
            <v-tooltip text="Sem Anexo" activator="parent" location="top" />
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

      <template #[`item-setor_referencia.nome`]="{ data: { data: item } }">
        <div class="d-flex align-center justify-center text-center">
          <v-tooltip :text="item.setor_referencia.nome" activator="parent" location="bottom" />
          {{ item.setor_referencia.sigla }}
        </div>
      </template>

      <template #[`#item-empresa.apelido`]="{ data: { data: item } }">
        <div class="d-flex align-center justify-center text-center">
          <v-tooltip :text="item.empresa.nome" activator="parent" location="bottom" />
          {{ item.empresa.apelido }}
        </div>
      </template>
    </CustomTableMain>

    <LazyModalPagamento v-model:enable="enableModal.pagamento" :id="viewPayment.id" />
    <LazyModalPagamentoEdit v-model:enable="enableModal.edit" :id="viewPayment.id" @getPagamento="getPage()" />
    <LazyModalConfirmStatus
      v-model:enable="enableModal.confirm"
      v-model:justificativa="justificativa"
      :confirm="confirm"
      :message="messageConfirmStatus"
      :item="viewPayment"
      :actions="actionsModalConfirm"
    />

    <LazyModalEditCount v-if="enableModal.editCount" v-model:enable="enableModal.editCount" :id="viewPayment.id" @update-success="getPage" />

    <LazyModalEditCountAll v-if="enableModal.allEdit" v-model:enable="enableModal.allEdit" :items="itemsSelects" @update-success="getPage" />

    <LazyModalConfirmAllStatus
      v-if="enableModal.allConfirm"
      v-model:enable="enableModal.allConfirm"
      v-model:justificativa="justificativa"
      :message="messageConfirmAllStatus"
      :actions="modalActionsAprovedAll"
    />
  </LayoutForm>
</template>

<script setup>
// * IMPORT

import CustomStore from 'devextreme/data/custom_store'
import { postStatus } from '@api'
import { getPagamentoByScope } from '~/api'
const { $toast } = useNuxtApp()
const colums = getColumns('financeiro')
const { openBase64File } = useOs()

// * DATA

const confirm = ref('exportar')
const pagamentos = ref([])
const viewPayment = ref({})
const itemsSelects = ref([])
const justificativa = ref(null)
const loadingModal = ref(false)
const loading = ref(false)
const tableRef = ref(null)

const enableModal = reactive({
  link: false,
  export: false,
  confirm: false,
  allEdit: false,
  editCount: false,
  pagamento: false,
  allConfirm: false,
  exportToClient: false,
  edit: false
})

// * COMPUTED && MODALS ACTIONS

const status = {
  approve: 3,
  disapprove: 8,
  revision: 2
}

const title = {
  approve: 'Aprovar',
  disapprove: 'Reprovar',
  revision: 'Solicitar revisão'
}

const openApprovePayment = () => {
  confirm.value = 'approve'
  enableModal.allConfirm = true
}

const openDisapprovePayment = () => {
  confirm.value = 'disapprove'
  enableModal.allConfirm = true
}

const openEditPayment = () => {
  viewPayment.value = itemsSelects.value
  enableModal.allEdit = true
}

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
  {
    icon: 'mdi-pencil',
    tooltip: 'Editar',
    click: (item) => {
      viewPayment.value = item
      enableModal.edit = true
    }
  },
  {
    tooltip: 'Revisão',
    icon: 'mdi-refresh',
    click: (item) => {
      viewPayment.value = item
      enableModal.confirm = true
      confirm.value = 'revision'
    },
    active: true,
    disabled: (item) => item.movimentacoes_pagamento[0].status_pagamento.id === 3,
    type: 'revision'
  },
  {
    icon: 'mdi-close',
    tooltip: 'Reprovar',
    click: async (item) => {
      viewPayment.value = item
      enableModal.confirm = true
      confirm.value = 'disapprove'
    },
    active: true,
    disabled: (item) => item.movimentacoes_pagamento[0].status_pagamento.id === 3,
    type: 'cancel'
  },
  {
    icon: 'mdi-check',
    tooltip: 'Aprovar',
    disabled: (item) => item.movimentacoes_pagamento[0].status_pagamento.id === 3,
    click: (item) => {
      viewPayment.value = item
      enableModal.confirm = true
      confirm.value = 'approve'
    },
    active: true,
    type: 'success'
  }
])

const actionsModalConfirm = computed(() => [
  {
    icon: 'mdi-close',
    title: 'Cancelar',
    type: 'grey',
    click: () => (enableModal.confirm = false)
  },
  {
    icon: 'mdi-check',
    title: title[confirm.value],
    type: 'success',
    loading: loadingModal.value,
    click: async () => {
      const status_id = status[confirm.value]
      await sendStatus(status_id, [viewPayment.value.id])
    },
    width: '200px'
  }
])

const modalActionsAprovedAll = computed(() => [
  {
    icon: 'mdi-close',
    title: 'Cancelar',
    type: 'grey',
    click: () => (enableModal.allConfirm = false)
  },
  {
    icon: 'mdi-check',
    title: title[confirm.value],
    type: 'success',
    loading: loadingModal.value,
    click: async () => await validBeforeSend()
  }
])

const messageConfirmStatus = computed(() => {
  if (confirm.value === 'approve') return 'Deseja realmente aprovar essa solicitação de pagamento?'
  else if (confirm.value === 'revision') return 'Deseja realmente solicitar revisão dessa solicitação de pagamento?'
  return 'Deseja realmente reprovar essa solicitação de pagamento?'
})

const messageConfirmAllStatus = computed(() => {
  if (confirm.value === 'approve') return 'Deseja realmente aprovar todas as solicitações de pagamentos selecionadas?'
  else if (confirm.value === 'revision') return 'Deseja realmente solicitar revisão todas as solicitações de pagamentos selecionadas?'
  return 'Deseja realmente reprovar todas as solicitações de pagamentos selecionadas?'
})

// * METHODS

const notaFiscal = (anexos) => anexos.find((anexo) => anexo.tipo_anexo_id === 3)

const documentoAnexo = (anexos) => anexos.find((anexo) => anexo.tipo_anexo_id === 4)

const defineDocument = (tipo) => (tipo === 'juridico' ? maskCnpj(item.fornecedor.documento) : maskCpf(item.fornecedor.documento))

const handleSelectionChange = (items) => {
  itemsSelects.value = items
}
const validBeforeSend = async () => {
  const status_id = status[confirm.value]

  const lista_id = itemsSelects.value.map((item) => item.id)

  await sendStatus(status_id, lista_id)
}

const sendStatus = async (status, id) => {
  loadingModal.value = true

  try {
    const requireJustificativa = [2, 8, 9]
    if (requireJustificativa.includes(status)) {
      if (!justificativa.value || justificativa.value.length < 10) throw new Error('A justificativa deve ter no mínimo 10 caracteres')
    }

    const justificativas = {
      disapprove: justificativa.value,
      approve: 'Aprovado pelo Financeiro',
      revision: justificativa.value
    }

    const justificativaValue = justificativas[confirm.value]

    const { success, message } = await postStatus({ id, status, justificativa: justificativaValue })

    if (!success) throw new Error(message)

    $toast.success('Status alterado com sucesso')

    enableModal.confirm = false
    enableModal.allConfirm = false

    await tableRef.value.clearFilters()

    await getPage()
  } catch (error) {
    console.error(error)
    $toast.error(error.message)
  }
  loadingModal.value = false
}

const getPagamentos = async () => {
  loading.value = true

  try {
    const { success, message, data } = await getPagamentoByScope('usuario')
    if (!success) throw new Error(message)

    pagamentos.value = data
  } catch (error) {
    console.error(error)
    $toast.error('Erro ao buscar pagamentos')
  }

  loading.value = false
}

getPagamentos()
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
