<template>
  <div>
    <LayoutForm>
      <CustomTableSelect
        :columns="columns"
        :items="pagamentos"
        :actions="actions"
        :loading="false"
        store-state
        key-stored="pagamentos-usuario-table"
        scrolling="standard"
        allow-search
        noDataText="Você não tem nenhuma solicitação de pagamento"
        allowColumnResizing
        choose-columns
        allow-column-reordering
        :allowed-page-sizes="[5, 10, 15, 25, 30]"
        :page-size="15"
        enableAddButton
        companiesFilter
        createTitle="NOVO PAGAMENTO"
        createText="Ir para página de solicitação"
        @add="router.push(`/pagamento/novo`)"
        pager
      >
        <template #item-categoria="{ data: { data: item } }">
          <div class="template">
            {{ item.categoria.nome }}
          </div>
        </template>

        <template #[`item-projeto.nome`]="{ data: { data: item } }">
          <div class="template">
            {{ item?.projeto?.nome ?? 'Sem projeto' }}
          </div>
        </template>

        <template #[`item-fornecedor.tipo`]="{ data: { data: item } }">
          <div class="template">
            {{ item.fornecedor.tipo === 'juridico' ? 'Jurídico' : 'Físico' }}
          </div>
        </template>

        <template #[`item-movimentacoes_pagamento.status_pagamento`]="{ data: { data: item } }">
          <div class="template">
            <v-chip :color="item.movimentacoes_pagamento[0].status_pagamento.cor">
              <p class="font-weight-bold">
                {{ item.movimentacoes_pagamento[0].status_pagamento.label }}
              </p>
            </v-chip>
          </div>
        </template>

        <template #[`item-fornecedor.documento`]="{ data: { data: item } }">
          <div class="d-flex align-center justify-center text-center">
            {{ documentByType(item.fornecedor.tipo, item.fornecedor.documento) }}
          </div>
        </template>

        // * Anexo de NF

        <template #item-anexo="{ data: { data: item } }">
          <div class="template" v-if="isNotStatusAllowed(item.status)">
            <v-btn v-if="isNF(item.anexos_pagamento)" flat icon variant="plain" @click="openFile(item, 3)">
              <v-icon color="success" class="cursor-pointer" icon="mdi-paperclip" />

              <v-tooltip text="Abrir anexo" activator="parent" location="top" />
            </v-btn>

            <v-btn flat icon variant="plain" v-else :disabled="lastStatus(item) !== 'Pendente'">
              <v-icon color="primary" class="cursor-pointer" @click="uploadFile(item, 3)" icon="mdi-paperclip-plus" />

              <v-tooltip text="Anexar arquivo" activator="parent" location="top" />
            </v-btn>
          </div>
        </template>

        //* Anexo de DOC

        <template #item-doc="{ data: { data: item } }">
          <div class="template" v-if="isNotStatusAllowed(item.status)">
            <v-btn v-if="isDOC(item.anexos_pagamento)" flat icon variant="plain">
              <div v-if="item.anexos_pagamento?.length > 0">
                <v-icon :color="colorDoc(item.anexos_pagamento)" class="cursor-pointer" icon="mdi-paperclip" @click="openFile(item, 4)" />
                <v-tooltip :text="item.anexos_pagamento.length === 1 ? 'Abrir anexo' : nameFiles(item.anexos_pagamento)" activator="parent" location="top" />
              </div>
            </v-btn>

            <v-btn flat icon variant="plain" v-else :disabled="lastStatus(item) !== 'Pendente'">
              <div>
                <v-icon class="cursor-pointer" color="primary" @click="uploadFile(item, 4)" icon="mdi-paperclip-plus" />

                <v-tooltip text="Anexar arquivo" activator="parent" location="top" />
              </div>
            </v-btn>
          </div>
        </template>

        <template #item-data="{ data: { data: item } }">
          <div class="template">
            {{ formatDate(item?.data_vencimento) }}
          </div>
        </template>
        <template #item-created_at="{ data: { data: item } }">
          <div class="template">
            {{ formatDateTime(item.created_at) }}
          </div>
        </template>

        <template #item-data_aprovacao="{ data: { data: item } }">
          <div class="template">
            {{ movimentacaoAprovado(item) }}
          </div>
        </template>

        <template #item-valor_total="{ data: { data: item } }">
          <div class="template">
            {{ formatCurrency(item.valor_total) }}
          </div>
        </template>

        <template #item-empresa="{ data: { data: item } }">
          <div class="template">
            {{ item.empresa.apelido }}
            <v-tooltip :text="item.empresa.nome" activator="parent" location="bottom" />
          </div>
        </template>
      </CustomTableSelect>
    </LayoutForm>

    <LazyModalPagamento v-model:enable="enableModal.pagamento" :id="pagamento.id" @getPagamento="getPage()" />

    <LazyModalConfirmCancel v-model:enable="enableModal.cancel" v-model:justificativa="justificativa" :item="pagamento" :actions="modalActions" />
    <LazyModalUpload v-model:enable="enableModal.upload" :item="pagamento" @update="getPage" :tipo_anexo_id="tipo_anexo_id" />
  </div>
</template>

<script setup>
//* IMPORTS
import CustomStore from 'devextreme/data/custom_store'
import { getPagamentoByScope, postStatus } from '@api'
const { $toast } = useNuxtApp()
const router = useRouter()
const access = useRuntimeConfig()
const columns = getColumns('usuario')

//* DATA

const caminho_normal = access.public.PAGAMENTO_PATH
const caminho_privado = access.public.PAGAMENTO_PRIVADO_PATH

const title = ref('Pagamentos')
const loading = ref(false)
const pagamento = ref({})
const pagamentos = ref([])
const tipo_anexo_id = ref(null)
const loadingTable = ref(false)
const justificativa = ref(null)
const customRef = ref(null)

const enableModal = reactive({
  cancel: false,
  upload: false,
  pagamento: false
})

// * ACTIONS

const statusDisabled = ref([1, 2])

const actions = computed(() => [
  {
    icon: 'mdi-eye',
    tooltip: 'Ver detalhes',
    click: handleViewDetails,
    visible: true,
    active: true,
    type: 'padrao'
  },
  {
    icon: 'mdi-cancel',
    tooltip: 'Cancelar',
    click: handleCancel,
    disabled: isDisabled,
    type: 'cancel'
  },
  {
    icon: 'mdi-pencil',
    tooltip: 'Editar',
    click: handleEdit,
    disabled: isEditable,
    type: 'edit'
  }
])

const lastStatus = ref((item) => item.movimentacoes_pagamento[0].status_pagamento.label)

const handleViewDetails = (item) => {
  pagamento.value = item
  enableModal.pagamento = true
}

const handleCancel = (item) => {
  pagamento.value = item
  enableModal.cancel = true
}

const handleEdit = (item) => {
  const status_id = item.movimentacoes_pagamento[0].status_pagamento.id
  const path = `../pagamento/${item.id}`
  router.push({ path, query: { edit: true, revision: status_id === 2 } })
}

const isDisabled = (item) => !statusDisabled.value.includes(item.movimentacoes_pagamento[0].status_pagamento.id)

const isEditable = (item) => {
  const statusEditable = [1, 2, 3, 8, 9]
  return !statusEditable.includes(item.movimentacoes_pagamento[0].status_pagamento.id)
}

const modalActions = [
  {
    icon: 'mdi-close',
    title: 'Cancelar',
    type: 'cancel',
    click: () => {
      enableModal.cancel = false
    }
  },
  {
    icon: 'mdi-check',
    title: 'Confirmar',
    type: 'success',
    loading: loading.value,
    click: () => {
      loading.value = true
      cancelPayment([pagamento.value.id])
    }
  }
]

//* METHODS

const colorDoc = (anexos) => {
  const docs = anexos.filter((anexo) => anexo.tipo_anexo_id === 4)
  if (docs.length > 1) return 'purple'
  return 'success'
}

const openDoc = (anexos, tipo_anexo, privado) => {
  const filterDoc = anexos.filter((anexo) => anexo.tipo_anexo_id === tipo_anexo)
  if (filterDoc && filterDoc.length !== 0) return openFile(filterDoc, tipo_anexo, privado)
}

const openFile = async (pagamento, tipo_anexo_id) => {
  await useOs().openBase64File(pagamento, tipo_anexo_id)
}

const movimentacaoAprovado = (item) => {
  const findAprovado = item.movimentacoes_pagamento.find((mov) => mov.status_pagamento.id >= 4) // ? APROVADO
  return findAprovado ? formatDate(findAprovado.data_inicio) : 'Em análise'
}

const isNF = (anexos) => anexos.find((anexo) => anexo.tipo_anexo_id === 3)

const isDOC = (anexos) => anexos.find((anexo) => anexo.tipo_anexo_id === 4)

const nameFiles = (anexos) => anexos.map((anexo) => `${anexo.nome}`).join('; ')

const documentByType = (tipo, documento) => {
  if (!documento) return ''
  return tipo === 'juridico' ? maskCnpj(documento) : maskCpf(documento)
}

const isNotStatusAllowed = (status) => status !== 'Recusado' && status !== 'Cancelado'

const uploadFile = (item, id) => {
  pagamento.value = item
  tipo_anexo_id.value = id
  enableModal.upload = true
}

const cancelPayment = async (ids) => {
  if (!justificativa.value) return $toast.error('Informe a justificativa')

  loading.value = true

  try {
    const { success, message } = await postStatus({ id: ids, status: 7, justificativa: justificativa.value })
    if (!success) throw new Error(message)

    loading.value = false
    enableModal.cancel = false
    $toast.success('Pagamento cancelado com sucesso')
    await getPage()
  } catch (error) {
    console.error(error)
    $toast.error('Erro ao cancelar pagamento')
  }
  justificativa.value = null
}

const isNotEmpty = (value) => value !== undefined && value !== null && value !== ''

function formatFilter(filterArray) {
  const formattedFilters = []

  for (let i = 0; i < filterArray.length; i++) {
    if (filterArray[i] === 'or' || filterArray[i] === '=') continue
    if (filterArray[i] === filterArray['filterValue']) continue

    const fieldName = Array.isArray(filterArray[i]) ? filterArray[i][0] : filterArray[i]
    const value = Array.isArray(filterArray[i]) ? filterArray[i]['filterValue'] : filterArray['filterValue']

    formattedFilters.push({ fieldName, value })
  }

  return formattedFilters
}

const getPage = async () => {
  pagamentos.value = new CustomStore({
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
        const { success, message, data } = await useApi(`/pagamento/scope/usuario`, {
          query: {
            paging: true,
            limit: mergedObject.take,
            offset: mergedObject.skip,
            sort: mergedObject.sort,
            filter: JSON.stringify(mergedObject.filter)
          }
        })

        if (!success) throw new Error(message)

        data.data.forEach((item) => {
          item.movimentacoes_pagamento.status_pagamento = item.movimentacoes_pagamento[0]?.status_pagamento?.nome
          item.lote = item.movimentacoes_pagamento.at()?.lote
        })

        return { data: data.data ?? [], totalCount: data.count ?? 0 }
      } catch (error) {
        console.error(error)
        $toast.error('Erro ao carregar os pagamentos')
        await customRef.value.refresh()
      }
    }
  })
}

await getPage()
</script>

<style scoped>
.custom-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 10px;
}
</style>
