<template>
  <div>
    <LayoutForm>
      <PaymentsValue :year="year" :month="month" :lastMonth="lastMonth" :today="today" />

      <v-divider class="my-2" />
      <CustomTableSelect
        ref="tableRef"
        height="calc(100vh - 220px)"
        :columns="colums"
        :items="itens"
        :actions="actions"
        :loading="false"
        scrolling="standard"
        allow-search
        allowColumnResizing
        choose-columns
        allow-column-reordering
        :noDataText="'Nenhuma solicitação de pagamento para aprovação'"
        @selectionChanged="handleSelectionChange"
        selectionCheck
        :allowed-page-sizes="[5, 10, 15, 25]"
        :page-size="15"
        pager
        store-state
        key-stored="pagamentos-gerencia-table"
        page="gerencia"
        companiesFilter
        :paymentsSelecteds="idsSelect.length > 0"
        @disapprovePayment="openDisapprovePayment"
        @approvePayment="openApprovePayment"
      >
        <template #item-usuario="{ data: { data: item } }">
          <div>
            <v-tooltip :text="item.usuario.nome" activator="parent" location="top" />
            {{ item.usuario.sigla }}
          </div>
        </template>

        <template #item-categoria="{ data: { data: item } }">
          <div class="d-flex align-center justify-center text-center">
            {{ item.categoria.nome }}
          </div>
        </template>

        <template #item-tipo="{ data: { data: item } }">
          <div class="d-flex align-center justify-center text-center">
            {{ item.fornecedor.tipo === 'juridico' ? 'Jurídico' : 'Físico' }}
          </div>
        </template>

        <template #item-documento="{ data: { data: item } }">
          <div class="d-flex align-center justify-center text-center">
            {{ defineDocument(item.fornecedor.tipo, item.fornecedor.documento) }}
          </div>
        </template>

        <template #item-anexo="{ data: { data: item } }">
          <div class="d-flex align-center justify-center text-center">
            <div v-if="notaFiscal(item.anexos_pagamento)">
              <v-icon @click="openBase64File(notaFiscal(item.anexos_pagamento))" color="blue" class="cursor-pointer"> mdi-paperclip </v-icon>
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
              <v-icon @click="openBase64File(documentoAnexo(item.anexos_pagamento))" color="blue" class="cursor-pointer"> mdi-paperclip </v-icon>
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
            {{ item.empresa.apelido }}
          </div>
        </template>
        <template #item-created_at="{ data: { data: item } }">
          <div class="template">
            {{ formatDate(item.created_at) }}
          </div>
        </template>
      </CustomTableSelect>
    </LayoutForm>

    <LazyModalPagamento v-model:enable="enableModal.pagamento" :id="itemView.id" @update="getPage()" />
    <LazyModalPagamentoEdit v-model:enable="enableModal.edit" :id="itemView.id" @getPagamento="getPage()" />


    <LazyModalConfirmStatus
      v-model:enable="enableModal.confirm"
      v-model:permiteEditar="permiteEditar"
      v-model:justificativa="justificativa"
      :item="itemView"
      :actions="modalActionsConfirm"
      :message="messageConfirmStatus()"
      :confirm="confirm"
      :page="'gerencia'"
    />

    <LazyModalConfirmAllStatus
      v-model:enable="enableModal.allConfirm"
      v-model:justificativa="justificativa"
      :confirm="confirm"
      :message="messageConfirmStatusAll()"
      :actions="modalActionsConfirmAll"
    />
  </div>
</template>

<script setup>
import CustomStore from 'devextreme/data/custom_store'

import { postStatus } from '@api'
const { $toast } = useNuxtApp()
const colums = getColumns('gerencia')
const { openBase64File } = useOs()

const enableModal = reactive({
  confirm: false,
  reprove: false,
  pagamento: false,
  allConfirm: false,
  edit: false
})

const confirm = ref('delete')
const itens = ref([])
const itemView = ref({})
const idsSelect = ref([])
const ambos = ref(true)
const loadingModal = ref(false)
const permiteEditar = ref(false)
const tableRef = ref(null)
const selections = ref([])
const justificativa = ref(null)
const valueYear = ref(0)
const valueLastMonth = ref(0)
const valueActualMonth = ref(0)
const valueToday = ref(0)

onMounted(async () => {
  await getPage()
})
const handleSelectionChange = (items) => {
  selections.value = items
  const ids = items.map((item) => item.id)
  idsSelect.value = ids
}

const sumSelect = computed(() => {
  let selec = 0
  if (selections.value.length > 0) {
    selec = selections.value.reduce((sum, item) => sum + parseFloat(item.valor_total), 0)
  }

  return selec
})

const year = computed(() => {
  let value = sumSelect.value + valueYear.value
  return value
})

const month = computed(() => {
  let value = sumSelect.value + valueActualMonth.value
  return value
})

const lastMonth = computed(() => {
  let value = valueLastMonth.value
  return value
})

const today = computed(() => {
  let value = sumSelect.value + valueToday.value
  return value
})
const actions = ref([
  {
    icon: 'mdi-eye',
    tooltip: 'Ver detalhes',
    click: (item) => {
      itemView.value = item
      enableModal.pagamento = true
    },
    visible: true,
    active: true,
    type: 'padrao'
  },
  {
    icon: 'mdi-close-thick',
    tooltip: 'Recusar',
    click: (item) => {
      itemView.value = item
      confirm.value = 'disapprove'
      enableModal.confirm = true
    },
    visible: true,
    active: true,
    type: 'cancel'
  },
  {
    tooltip: 'Revisão',
    icon: 'mdi-refresh',
    click: (item) => {
      itemView.value = item
      enableModal.confirm = true
      confirm.value = 'revision'
    },
    active: true,
    type: 'revision'
  },
  {
    icon: 'mdi-check-bold',
    tooltip: 'Aprovar',
    click: (item) => {
      itemView.value = item
      confirm.value = 'approve'
      enableModal.confirm = true
    },
    visible: true,
    active: true,
    type: 'success'
  }
])

const modalActionsConfirm = computed(() => [
  {
    icon: 'mdi-close',
    title: 'Cancelar',
    type: 'grey',
    click: () => (enableModal.confirm = false)
  },
  {
    icon: 'mdi-check',
    title: confirm.value === 'approve' ? 'Aprovar' : 'Reprovar',
    type: 'success',
    loading: loadingModal.value,
    click: async () => {
      if (confirm.value === 'approve') await sendStatus(4, [itemView.value.id])
      if (confirm.value === 'revision') await sendStatus(2, [itemView.value.id])
      else await sendStatus(9, [itemView.value.id])
    }
  }
])

const modalActionsConfirmAll = computed(() => [
  {
    icon: 'mdi-close',
    title: 'Cancelar',
    type: 'grey',
    click: () => (enableModal.allConfirm = false)
  },
  {
    icon: 'mdi-check',
    title: confirm.value === 'approve' ? 'Aprovar' : 'Reprovar',
    type: 'success',
    loading: loadingModal.value,
    click: async () => {
      if (confirm.value === 'approve') await sendStatus(4, idsSelect.value)
      if (confirm.value === 'revision') await sendStatus(2, idsSelect.value)
      else await sendStatus(9, idsSelect.value)
    }
  }
])

const openApprovePayment = () => {
  confirm.value = 'approve'
  enableModal.allConfirm = true
}

const openDisapprovePayment = () => {
  confirm.value = 'disapprove'
  enableModal.allConfirm = true
}

const notaFiscal = (anexos) => anexos.find((anexo) => anexo.tipo_anexo_id === 3)

const documentoAnexo = (anexos) => anexos.find((anexo) => anexo.tipo_anexo_id === 4)

const smallerIndex = (index, item) => index < item.length - 1

const classSetor = (item, index) => (smallerIndex(index, item.usuario.setores) ? 'mr-2' : '')

const defineDocument = (tipo, documento) => (tipo === 'juridico' ? maskCnpj(documento) : maskCpf(documento))

const defineNameSetor = (sigla, item, index) => (smallerIndex(index, item.usuario.setores) ? `${sigla}, ` : sigla)

const messageConfirmStatus = () => {
  if (confirm.value === 'approve') return 'Deseja realmente aprovar esse pagamento?'
  if (confirm.value === 'revision') return 'Deseja realmente enviar para revisão esse pagamento?'
  return 'Deseja realmente reprovar esse pagamento?'
}

const messageConfirmStatusAll = () => {
  if (confirm.value === 'approve') return 'Deseja realmente aprovar todos os pagamentos selecionados?'
  if (confirm.value === 'revision') return 'Deseja realmente enviar para revisão todos os pagamentos selecionados?'
  return 'Deseja realmente reprovar todos os pagamentos selecionados?'
}

const sendStatus = async (status, id) => {

  console.log(status, id)
  try {
    if (status === 9 && !justificativa.value) throw new Error('Justificativa é obrigatória para prosseguir!')
    loadingModal.value = true

    const { success, message } = await postStatus({ id, status, justificativa: justificativa.value, permite_editar: permiteEditar.value })
    if (!success) throw new Error(message)
    loadingModal.value = false
    enableModal.confirm = false
    enableModal.allConfirm = false
    $toast.success('Status alterado com sucesso')
    
    await tableRef.value.clearFilters()
    
    await getPage()

  } 
	catch (error) {
    console.error(error)
    $toast.error('Erro ao alterar status')
  }
}

const valiDisapprovePayment = () => {
  if (idsSelect.value.length === 0) {
    loadingModal.value = false
    return $toast.error('Selecione ao menos um pagamento')
  }

  if (ambos.value && !justificativa.ambos) {
    loadingModal.value = false
    return $toast.error('Informe a justificativa')
  }
  if (!ambos.value && (!justificativa.clientes || !justificativa.financeiro)) {
    loadingModal.value = false
    return $toast.error('Informe a justificativa')
  }
}

const isNotEmpty = (value) => value !== undefined && value !== null && value !== ''



const getPage = async () => {
  itens.value = new CustomStore({
    key: 'id',
    async load(loadOptions) {
      const paramsName = ['skip', 'take', 'requireTotalCount', 'requireGroupCount', 'sort', 'filter', 'totalSummary', 'group', 'groupSummary']

      const queryString = paramsName
        .filter((paramName) => isNotEmpty(loadOptions[paramName]))
        .map((paramName) => {
          if (paramName == 'filter') return { [paramName]: formatFilter(loadOptions[paramName]) }
          return { [paramName]: loadOptions[paramName] }
        })

      const mergedObject = queryString.reduce((acc, obj) => {
        Object.keys(obj).forEach((key) => (acc[key] = obj[key]))
        return acc
      }, {})

      try {
        const { success, message, data } = await useApi(`/pagamento/scope/gerencia`, {
          query: {
            paging: true,
            limit: mergedObject.take,
            offset: mergedObject.skip,
            sort: mergedObject.sort,
            filter: JSON.stringify(mergedObject.filter)
          }
        })

        if (!success) throw new Error(message)
        const { valores } = data
        valueYear.value = valores.ano ?? 0
        valueLastMonth.value = valores.ultimo_mes ?? 0
        valueActualMonth.value = valores.mes ?? 0
        valueToday.value = valores.hj ?? 0

        return {
          data: data.data,
          totalCount: data.count
        }
      } 
      catch (error) {
        console.error(error)
        $toast.error('Erro ao carregar os pagamentos')
      }
    }
  })
}

await getPage()
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
</style>
