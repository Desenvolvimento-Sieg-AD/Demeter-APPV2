<template>
  <div class="h-100 no-smooth-behavior" v-if="render">
    <LayoutLoading v-if="loading" />
    <DxDataGrid
      v-else
      ref="customTable"
      height="calc(100vh - 180px)"
      render-async
      auto-navigate-to-focused-row
      v-model:focused-row-key="focusedRowIndex"
      :data-source="items"
      :key-expr="keyExpr"
      :columns="columns"
      :key="toolbarKey"
      :filter-value="filterValue"
      :show-borders="outlined"
      :no-data-text="noDataText"
      :column-auto-width="columnAutoWidth"
      :allow-column-resizing="allowColumnResizing"
      :allow-column-reordering="allowColumnReordering"
      @focused-row-changing="onFocusedRowChanging"
      @focused-row-changed="onFocusedRowChanged"
      @cell-prepared="onCellPrepared"
      @row-click="onRowClick"
      @selection-changed="onSelectionChanged"
      @option-changed="onOptionChanged"
    >
      <DxLoadPanel :visible="loading" :shading="false" text="Carregando dados..." />

      <DxStateStoring :enabled="storeState" type="localStorage" :storage-key="storageKey" />

      <DxScrolling :mode="tablePageSize == 0 ? scrolling : 'standard'" :row-rendering-mode="scrolling" />

      <DxGroupPanel empty-panel-text="Arraste uma coluna aqui para agrupar por essa coluna" :visible="allowGroupingColumns" />

      <DxGrouping :auto-expand-all="allowGroupingColumns" :context-menu-enabled="allowGroupingColumns" />

      <DxFilterRow :visible="columns.some((el) => el.filterable)" />

      <DxSearchPanel :visible="searchable" width="500px" />

      <DxSelection mode="multiple" :show-check-boxed-mode="checkBoxesMode" v-if="selectionCheck" :allow-select-all="true" />

      <DxSorting :mode="columns.some((el) => el.sortable) ? 'multiple' : 'none'" />

      <DxHeaderFilter :visible="columns.some((el) => el.filterable)" />

      <DxToolbar :visible="filtered || enableAddButton || allowGroupingColumns || searchable || columns.some((el) => el.searchable) || chooseColumns">
        <DxItem name="create" v-if="enableAddButton" locate-in-menu="auto" location="before" template="create" />

        <DxItem name="resetColumns" locate-in-menu="auto" location="before" template="resetTable" />

        <DxItem name="removingFilter" v-if="filtered" locate-in-menu="auto" location="before" template="removingFilter" />

        <DxItem name="groupPanel" v-if="allowGroupingColumns" locate-in-menu="auto" location="before" />

        <DxItem name="searchPanel" v-if="searchable" locate-in-menu="auto" location="after" />

        <DxItem name="applyFilterButton" v-if="columns.some((el) => el.searchable)" locate-in-menu="auto" location="after" />

        <DxItem name="columnChooserButton" v-if="chooseColumns" locate-in-menu="auto" location="after" />
      </DxToolbar>

      <template #create>
        <button @click="emit('add')" style="padding: 4px" class="dx-button dx-button-mode-contained">
          <v-icon size="large" icon="mdi-plus" />
          <v-tooltip activator="parent" location="start" text="Adicionar" />
        </button>
      </template>

      <template #removingFilter>
        <button @click="clearFiltersAndRefreshToolbar" style="padding: 8px 18px !important" class="dx-button dx-button-mode-contained">
          <v-icon size="small" icon="mdi-filter-remove-outline" />
          <v-tooltip activator="parent" location="start" text="Remover filtros" />
          <p class="ml-2">Remover filtro</p>
        </button>
      </template>

      <template #resetTable>
        <button @click="resetTable" style="padding: 8px 18px !important" class="dx-button dx-button-mode-contained">
          <v-icon size="small" icon="mdi-filter-check-outline" />
          <v-tooltip activator="parent" location="start" text="Limpar" />
          <p class="ml-2">Limpar</p>
        </button>
      </template>

      <DxColumn
        v-for="(column, index) in columns"
        header-cell-template="titleheader"
        :key="index"
        :alignment="column.align ?? 'center'"
        :allow-search="column.wholeSearch ?? true"
        :allow-sorting="column.sortable ?? false"
        :allow-hiding="column.hidable ?? true"
        :allow-reordering="column.fixed ? false : column.reorderable ?? false"
        :allow-grouping="column.groupable ?? false"
        :allow-filtering="column.searchable ?? false"
        :allow-header-filtering="column.filterable ?? false"
        :caption="column.title"
        :cell-template="defineCellTemplates(column.value)"
        :data-field="column.value"
        :data-type="column.type ?? undefined"
        :disabled="column.disabled ?? false"
        :false-text="column.falseText ?? 'Não'"
        :fixed="column.fixed ?? false"
        :fixedPosition="column.fixedPosition ?? 'right'"
        :format="column.format"
        :show-editor-always="false"
        :sort-order="column.sortOrder"
        :true-text="column.trueText ?? 'Sim'"
        :visible="column.visible ?? true"
        :width="column.width"
      >
        <DxHeaderFilter :data-source="column.customFilter" :allow-select-all="column.allowFilterSelectAll ?? true" :group-interval="column.dateFilter ?? null">
          <DxSearch :enabled="column.searchFilter ?? false" :search-expr="column.searchFilterExpr" :editor-options="column.searchFilterOptions" />
        </DxHeaderFilter>
      </DxColumn>

      <template #titleheader="{ data }">
        <th class="cff">
          {{ data.column.caption }}
        </th>
      </template>

      <template #detail="{ data: item }">
        <slot name="detail" v-bind:item="item.data" />
      </template>

      <template #actions="{ data: item }">
        <div>
          <v-btn
            v-for="(action, index) in actions"
            :key="index"
            icon
            size="x-small"
            variant="text"
            v-show="getActionShow(action, item)"
            @click="action.click(item.data, item.rowIndex, items)"
            :disabled="getActionDisabled(action, item)"
          >
            <v-icon size="large" :color="getActionColor(action.type)" :icon="action.icon" />
            <v-tooltip activator="parent" location="start" :text="action.tooltip" />

            <v-menu activator="parent" :close-on-content-click="false" location="bottom" location-strategy="connected" v-if="action.id">
              <slot :name="`action-${action.id}`" v-bind:action="action" v-bind:item="item.data" />
            </v-menu>
          </v-btn>
        </div>
      </template>

      <template #hasNFE="{ data: item }">
        <div>
          <v-icon v-if="item.data.anexos_pagamento.length > 0" v-on="on" color="green">mdi-check</v-icon>
          <v-btn v-else icon size="small" variant="text" @click="emit('cellClick', item.data, item.rowIndex, items)">
            <v-icon color="red" icon="mdi-close" />
            <v-tooltip activator="parent" location="start" text="Realizar upload da Nota Fiscal" />
          </v-btn>
        </div>
      </template>

      <template #date="{ data: item }">
        <div>
          {{ formatDate(item.data.created_at) }}
        </div>
      </template>

      <template #currency="{ data: item }">
        <div>
          {{ formatCurrency(item.data.valor_total) }}
        </div>
      </template>

      <template #lastStatus="{ data: item }">
        <div>
          {{
            item.data.movimentacoes_pagamento.length > 1 ? item.data.movimentacoes_pagamento[1].status_pagamento.nome : item.data.movimentacoes_pagamento[0].status_pagamento.nome
          }}
        </div>
      </template>

      <template v-for="col in slotColumns" :key="col.value" #[`item-${col.value}`]="{ data: data }">
        <slot :name="`item-${col.value}`" v-bind:data="data">
          {{ getValue(data) }}
        </slot>
      </template>

      <DxColumnFixing :enabled="allowColumnFixing" />

      <DxColumnChooser :enabled="chooseColumns" mode="select">
        <DxPosition my="right top" at="right bottom" of=".dx-datagrid-column-chooser-button" />
        <DxColumnChooserSearch :enabled="true" editor-options />
        <DxColumnChooserSelection :allow-select-all="true" :select-by-click="true" />
      </DxColumnChooser>

      <DxPaging :enabled="pager != null" :page-size="tablePageSize" />
      <DxPager
        :visible="pager != null"
        :allowed-page-sizes="allowedPageSizes"
        :display-mode="pager"
        :show-page-size-selector="true"
        :show-info="true"
        :show-navigation-buttons="true"
      />
      <DxMasterDetail :enabled="selection" template="detail" />
      <DxRowDragging :allow-reordering="allowRowsReordering" :on-reorder="onReorder" :show-drag-icons="allowRowsReordering" />
      <DxLookup :data-source="itemList" value-expr="ID" display-expr="FullName" />

      <DxSummary recalculate-while-editing>
        <DxGroupItem
          v-for="(column, index) in columnSummary"
          :key="index"
          :column="column.column"
          :summary-type="column.summaryType"
          :value-format="column.valueFormat"
          :display-format="column.displayFormat"
          :align-by-column="true"
        />
      </DxSummary>
    </DxDataGrid>
  </div>
</template>

<script setup>
//* IMPORTS

import config from 'devextreme/core/config'
import themes from 'devextreme/ui/themes'

config({
  defaultCurrency: 'BRL'
})

//* PROPS

const props = defineProps({
  keyStored: { type: String, default: 'CustomTable' },
  columns: { type: Array, default: [{}] },
  items: { type: Object, default: [{}] },
  actions: { type: Array, default: [{}] },
  keyExpr: { type: String, default: 'id' },
  filterValue: { type: Array, default: [{}] },
  outlined: { type: Boolean, default: true },
  noDataText: { type: String, default: 'Nenhum registro encontrado.' },
  columnAutoWidth: { type: Boolean, default: true },
  allowColumnResizing: { type: Boolean, default: false },
  allowColumnReordering: { type: Boolean, default: true },
  loading: { type: Boolean, default: true },
  storeState: { type: Boolean, default: false },
  pageSize: { type: Number, default: 10 },
  allowedPageSizes: { type: Array, default: [5, 10, 25] },
  scrolling: { type: String, default: 'virtual' },
  allowGroupingColumns: { type: Boolean, default: false },
  searchable: { type: Boolean, default: false },
  selectionCheck: { type: Boolean, default: false },
  enableAddButton: { type: Boolean, default: false },
  chooseColumns: { type: Boolean, default: false },
  allowColumnFixing: { type: Boolean, default: false },
  pager: { type: String },
  selection: { type: Boolean, default: false },
  allowRowsReordering: { type: Boolean, default: false },
  columnSummary: { type: Array, default: [] }
})

//* REFERENCE

const itemList = ref(props.items)
const toolbarKey = ref(0)
const focusedRowIndex = ref(0)
const filtered = ref(false)
const render = ref(true)
const customTable = ref(null)

const storageKey = ref(`${props.keyStored}-config`)
const tablePageSize = ref(
  !props.pageSize ? (props.allowedPageSizes[props.allowedPageSizes.length - 1] == 'all' ? 0 : props.allowedPageSizes[props.allowedPageSizes.length - 1]) : props.pageSize
)
const checkBoxesMode = ref(themes.current().startsWith('material') ? 'always' : 'onClick')

const colors = {
  confirm: '#118B9F',
  cancel: '#F44336',
  info: 'info',
  success: 'success'
}

//* COMPUTED

const slotColumns = computed(() => props.columns.filter((el) => el.value != 'actions'))

//* EMITS

const emit = defineEmits(['focusRow', 'add', 'selectionChanged', 'cellClick', 'handleChange'])

//* LIFECYCLE HOOKS

const onFocusedRowChanging = (e) => {
  const pageSize = e.component.pageSize()
  const pageIndex = e.component.pageIndex()
  const isLoading = e.component.getController('data').isLoading()
  const key = e.event && e.event.key

  if (isLoading || (key && e.prevRowIndex === e.newRowIndex)) return

  if (e.newRowIndex === pageSize - 1) {
    e.component.pageIndex(pageIndex + 1).done(() => e.component.option('focusedRowIndex', 0))
  } else if (e.newRowIndex === 0) {
    e.component.pageIndex(pageIndex - 1).done(() => e.component.option('focusedRowIndex', pageSize - 1))
  }
}

//* FUNCTIONS

const defineCellTemplates = (column) => {
  switch (column) {
    case 'actions':
      return 'actions'
    case 'tarefas':
      return 'agenda'
    case 'anexos_pagamento':
      return 'hasNFE'
    case 'created_at':
      return 'date'
    case 'valor_total':
      return 'currency'
    case 'movimentacoes_pagamento':
      return 'lastStatus'
    default:
      return `item-${column}`
  }
}

const forceRender = async () => {
  render.value = false
  await nextTick()
  render.value = true
}

const onReorder = (e) => {
  const visibleRows = e.component.getVisibleRows()
  const fromIndex = visibleRows[e.fromIndex].dataIndex
  const toIndex = visibleRows[e.toIndex].dataIndex

  const newItems = [...itemList.value]
  const item = newItems.splice(fromIndex, 1)[0]

  const correctedToIndex = fromIndex > toIndex ? toIndex : toIndex + 1

  newItems.splice(correctedToIndex, 0, item)

  itemList.value = newItems
}

const getValue = (data) => data.text

const getActionColor = (type) => colors[type] || '#118B9F'

const getActionShow = (action, item) => (action.show ? action.show(item.data, item.rowIndex, props.items) : true)

const getActionDisabled = (action, item) => (action.disabled ? action.disabled(item.data, item.rowIndex, props.items) : false)

const verifyFilters = () => {
  const stored = localStorage.getItem(storageKey.value)
  const searchToolbar = stored ? JSON.parse(stored).searchText : null

  if (searchToolbar) return true

  const columns = customTable.value.instance.getVisibleColumns()

  for (let column of columns) {
    if (column.filterValue || column.sortOrder || column.filterValues) return true
  }

  return false
}

const clearFiltersAndRefreshToolbar = () => {
  let stored = localStorage.getItem(storageKey.value)
  if (!stored) return

  stored = JSON.parse(stored)
  const columns = stored.columns

  for (const column of columns) {
    column.filterValue = null
    column.sortOrder = null
    column.filterValues = null
  }

  stored.searchText = null
  stored.columns = columns
  localStorage.setItem(storageKey.value, JSON.stringify(stored))

  toolbarKey.value++
}

const resetTable = async () => {
  localStorage.removeItem(storageKey.value)
  toolbarKey.value++
}

//* METHODS

const onFocusedRowChanged = (e) => emit('focusRow', { index: e.rowIndex, data: e.row.data })

const onSelectionChanged = (e) => {
  e.selectedRowsData.forEach((el) => {
    if (el.descartado) {
      e.component.deselectRows([el])
      e.currentSelectedRowKeys = e.currentSelectedRowKeys.filter((el) => !el.descartado)
      e.selectedRowKeys = e.selectedRowKeys.filter((el) => !el.descartado)
      e.selectedRowsData = e.selectedRowsData.filter((el) => !el.descartado)
    } else {
      e.component.selectRows([el])
    }
    if (el.situacao === 'enviado') {
      e.component.deselectRows([el.titulo])
      e.currentSelectedRowKeys = e.currentSelectedRowKeys.filter((ex) => ex !== el.titulo)
      e.selectedRowKeys = e.selectedRowKeys.filter((ex) => ex !== el.titulo)
      e.selectedRowsData = e.selectedRowsData.filter((ex) => ex !== el.titulo)
    }
  })
  emit('selectionChanged', e.selectedRowsData)
}

const onRowClick = (e) => {
  if (e.rowType === 'data' && e.handled !== true && props.selection) {
    const key = e.component.getKeyByRowIndex(e.rowIndex)
    const expanded = e.component.isRowExpanded(key)
    if (expanded) {
      e.component.collapseRow(key)
    } else {
      e.component.expandRow(key)
    }
  }
}

const onOptionChanged = () => {
  filtered.value = verifyFilters()
}

const onCellPrepared = (e) => {
  if (e.rowType === 'header') {
    e.cellElement.style.backgroundColor = '#f1f1f1'
  }
  if (e.row?.data?.descartado) {
    e.cellElement.style.backgroundColor = 'lightgray'
  }
}

defineExpose({
  updateDimentions: () => {
    if (customTable.value) customTable.value.instance?.updateDimensions()
  },
  refresh: () => {
    if (customTable.value) customTable.value.instance?.refresh()
  },
  getFilteredList: () => {
    if (customTable.value) return customTable.value.instance?.getVisibleRows()
  },
  getApliedFilters: () => {
    if (customTable.value) return customTable.value.instance?.getCombinedFilter()
  },
  updated: () => {
    toolbarKey.value++
  }
})

//* WATCHERS

watch(
  () => props.loading,
  () => {
    forceRender()
    storageKey.value = `${props.keyStored}-config`
  }
)
</script>

<style>
.dx-header-filter-empty {
  color: rgba(149, 149, 149, 0.5) !important;
}
.dx-datagrid .dx-header-filter {
  color: #118b9f;
}
.dx-datagrid-content .dx-datagrid-table .dx-row > td,
.dx-datagrid-content .dx-datagrid-table .dx-row > tr > td {
  vertical-align: middle !important;
}

.no-smooth-behavior * {
  scroll-behavior: unset !important;
}

.disabled-row {
  background-color: lightgray;
  pointer-events: none;
}
</style>

<style scoped>
.cff {
  font-size: 14px;
  color: #118b9f;
  font-weight: 700;
}
.dx-data-row {
  background-color: #ff0000 !important;
}

.dx-datagrid-content .dx-datagrid-table .dx-row > td,
.dx-datagrid-content .dx-datagrid-table .dx-row > tr > td {
  vertical-align: center !important;
}
</style>

<style>
.no-smooth-behavior * {
  scroll-behavior: unset !important;
}
</style>
