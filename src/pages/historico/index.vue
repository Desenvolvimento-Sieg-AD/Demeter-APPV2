<template>
  <div>
    <LayoutForm>
      <PaymentsValue :year="valueYear" :month="valueActualMonth" :lastMonth="valueLastMonth" :today="valueToday" />

      <v-divider class="my-2" />
      
      <CustomTableSelect
        :columns="colums"
        :items="itens"
        :actions="actions"
        :loading="false"
        store-state
        key-stored="pagamentos-historico-table"
        scrolling="standard"
        allow-search
        :noDataText="'Não há registros de pagamentos'"
        allowColumnResizing
        choose-columns
        allow-column-reordering
        :allowed-page-sizes="[5, 10, 15, 25]"
        :page-size="15"
        companiesFilter
        pager
        height="calc(100vh - 220px)"
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
        <template #item-movimentacoes_pagamento.status_pagamento="{ data: { data: item } }">
          <div class="d-flex align-center justify-center text-center">
            <v-chip :color="item.movimentacoes_pagamento[0]?.status_pagamento?.cor">
              <p class="font-weight-bold">
                {{ item.movimentacoes_pagamento[0]?.status_pagamento?.nome }}
              </p>
            </v-chip>
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

        <template #item-data_pagamento="{ data: { data: item } }">
          <div class="d-flex align-center justify-center text-center">
            {{ item.data_pagamento ?? 'Não pago' }}
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
      </CustomTableSelect>
    </LayoutForm>
    <LazyModalPagamento v-model:enable="enableModal" :id="itemView.id" />
  </div>
</template>

<script setup>
import CustomStore from 'devextreme/data/custom_store'
const { $toast } = useNuxtApp()
const { openBase64File } = useOs()

const colums = getColumns('historico')
const itens = ref([])
const enableModal = ref(false)

const itemView = ref({})
const valueYear = ref(0)
const valueLastMonth = ref(0)
const valueActualMonth = ref(0)
const valueToday = ref(0)

const actions = computed(() => [
  {
    icon: 'mdi-eye',
    tooltip: 'Ver detalhes',
    click: (item) => {
      itemView.value = item
      enableModal.value = true
    },
    active: true,
    type: 'padrao',
    name: 'ver'
  }
])

const smallerIndex = (index, item) => index < item.length - 1

const notaFiscal = (anexos) => anexos.find((anexo) => anexo.tipo_anexo_id === 3)

const documentoAnexo = (anexos) => anexos.find((anexo) => anexo.tipo_anexo_id === 4)

const classSetor = (item, index) => (smallerIndex(index, item.usuario.setores) ? 'mr-2' : '')

const defineDocument = (tipo, documento) => (tipo === 'juridico' ? maskCnpj(documento) : maskCpf(documento))

const defineNameSetor = (sigla, item, index) => (smallerIndex(index, item.usuario.setores) ? `${sigla}, ` : sigla)

const isNotEmpty = (value) => value !== undefined && value !== null && value !== ''

function formatFilter(filterArray) {
  const formattedFilters = []

  for (let i = 0; i < filterArray.length; i++) {
    if (filterArray[i] === 'or' || filterArray[i] === '=' || filterArray[i] === 'and') continue
    if (filterArray[i] === filterArray['filterValue']) continue

    const fieldName = Array.isArray(filterArray[i]) ? filterArray[i][0] : filterArray[i]
    const value = Array.isArray(filterArray[i]) ? filterArray[i]['filterValue'] : filterArray['filterValue']

    formattedFilters.push({ fieldName, value })
  }

  return formattedFilters
}

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
        const { success, message, data } = await useApi(`/pagamento/scope/geral`, {
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

        data.data.forEach((item) => {
          item.movimentacoes_pagamento.status_pagamento = item.movimentacoes_pagamento[0]?.status_pagamento?.nome

          if (item.movimentacoes_pagamento[0]?.status_pagamento?.nome === 'Pago') {
            item.data_pagamento = formatDate(item.movimentacoes_pagamento[0].data_inicio)
          }

          item.lote = item.movimentacoes_pagamento.at()?.lote
        })

        return { data: data.data, totalCount: data.count }
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
