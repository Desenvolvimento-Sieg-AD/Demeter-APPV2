<template>
  <!-- Root Container -->

  <div class="h-100 no-smooth-behavior" v-if="render">
    <LayoutLoading v-if="loading" />
    <!-- Data Grid Component -->
    <DxDataGrid
      v-else
      ref="customTable"
      height="calc(100vh - 180px)"
      render-async
      :key-expr="keyExpr"
      auto-navigate-to-focused-row
      show-row-lines
      v-model:focused-row-key="focusedRowIndex"
      :key="toolbarKey"
      :data-source="items"
      :filter-value="filterValue"
      :show-borders="outlined"
      :no-data-text="noDataText"
      :word-wrap-enabled="lineBreak"
      :remote-operations="{ filtering: true, sorting: true, paging: true, visible: true }"
      :hover-state-enabled="hoverRows"
      :column-auto-width="columnAutoWidth"
      :focused-row-enabled="selectableRows"
      :allow-column-resizing="allowColumnResizing"
      :row-alternation-enabled="rowAlternationEnabled"
      :allow-column-reordering="allowColumnReordering"
      @focused-row-changing="onFocusedRowChanging"
      @focused-row-changed="onFocusedRowChanged"
      @cell-prepared="onCellPrepared"
      @row-prepared="onRowPrepared"
      @row-click="onRowClick"
      @option-changed="onOptionChanged"
      @selection-changed="onSelectionChanged"
    >
      <!-- Dx Components Configuration -->
      <DxLoadPanel :visible="loading" :shading="false" text="Carregando dados..." />

      <DxStateStoring :enabled="storeState" type="localStorage" :storage-key="storageKey" />

      <DxScrolling :mode="tablePageSize == 0 ? scrolling : 'standard'" :row-rendering-mode="scrolling" />

      <DxGroupPanel empty-panel-text="Arraste uma coluna aqui para agrupar por essa coluna" :visible="allowGroupingColumns" />

      <DxGrouping :auto-expand-all="allowGroupingColumns" :context-menu-enabled="allowGroupingColumns" />

      <DxFilterRow :visible="true" />

      <DxSearchPanel :visible="searchable" width="500px" />

      <DxSelection mode="multiple" :show-check-boxed-mode="checkBoxesMode" v-if="selectionCheck"  />

      <DxSorting :mode="columns.some((el) => el.sortable) ? 'multiple' : 'none'" />

      <DxHeaderFilter :visible="columns.some((el) => el.filterable)" />

      <DxFilterPanel :visible="createFilter" />

      <DxToolbar :visible="enableAddButton || filterOn || props.enableAddButton || allowGroupingColumns || searchable || columns.some((el) => el.searchable) || chooseColumns">
        <DxItem name="create" v-if="props.enableAddButton" locate-in-menu="auto" location="before" template="create" />

        <DxItem name="resetTable" locate-in-menu="auto" location="before" template="resetTable" />

        <DxItem name="removingFilter" v-if="filterOn" locate-in-menu="auto" location="before" template="removingFilter" />

        <DxItem name="editPayment" locate-in-menu="auto" location="after" template="editPayment" v-if="paymentsSelecteds && page == 'financeiro'"/>

        <DxItem name="disapprovePayment" locate-in-menu="auto" location="after" template="disapprovePayment" v-if="paymentsSelecteds"/>

        <DxItem name="approvePayment" locate-in-menu="auto" location="after" template="approvePayment" v-if="paymentsSelecteds"/>

        <DxItem name="groupPanel" v-if="allowGroupingColumns" locate-in-menu="auto" location="before" />

        <DxItem name="searchPanel" v-if="searchable" locate-in-menu="auto" location="after" />

        <DxItem name="applyFilterButton" v-if="columns.some((el) => el.searchable)" locate-in-menu="auto" location="after" />

        <DxItem name="columnChooserButton" v-if="chooseColumns" locate-in-menu="auto" location="after" />
      </DxToolbar>

      <template #create>
        <v-btn @click="emit('add')" class="dx-button dx-button-mode-contained" color="primary" flat>
          <v-icon size="small" :icon="`mdi mdi-plus`" start />
          <v-tooltip activator="parent" location="bottom" :text="createText" />
          {{ createTitle }}
        </v-btn>
      </template>

      <template #resetTable>
        <v-btn @click="resetTable" class="dx-button dx-button-mode-contained" color="red" flat variant="plain">
          <v-icon size="small" :icon="`mdi mdi-filter-remove-outline`" start />
          <v-tooltip activator="parent" location="bottom" :text="`Remover filtro`" />
          Resetar
        </v-btn>
      </template>

      <template #removingFilter>
        <v-btn @click="clearFiltersAndRefreshToolbar" class="dx-button dx-button-mode-contained" color="orange" flat variant="plain">
          <v-icon size="small" :icon="`mdi mdi-filter-remove-outline`" start />
          <v-tooltip activator="parent" location="bottom" :text="`Remover filtro`" />
          Remover filtro
        </v-btn>
      </template>

      <template #editPayment>
        <v-btn class="dx-button dx-button-mode-contained" color="primary" flat @click="editPayment" variant="plain">
          <v-icon size="small" :icon="`mdi mdi-pencil`" start />
          <v-tooltip activator="parent" location="bottom" :text="`Editar pagamentos`" />
          Editar pagamentos
        </v-btn>
      </template>

      <template #disapprovePayment>
        <v-btn class="dx-button dx-button-mode-contained" color="red" flat @click="disapprovePayment" variant="plain">
          <v-icon size="small" :icon="`mdi mdi-close`" start />
          <v-tooltip activator="parent" location="bottom" :text="`Reprovar pagamentos`" />
          Reprovar pagamentos
        </v-btn>
      </template>

      <template #approvePayment>
        <v-btn class="dx-button dx-button-mode-contained" color="success" flat @click="approvePayment" variant="plain">
          <v-icon size="small" :icon="`mdi mdi-check`" start />
          <v-tooltip activator="parent" location="bottom" :text="`Aprovar pagamentos`" />
          Aprovar pagamentos
        </v-btn>
      </template>

      <!-- Columns Configuration -->
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
        :cell-template="column.value == 'actions' ? 'actions' : column.value == 'tarefas' ? 'agenda' : `item-${column.value}`"
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

      <!-- Custom Templates for Columns -->
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
        :allowed-page-sizes="props.allowedPageSizes"
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
import config from 'devextreme/core/config'
import themes from 'devextreme/ui/themes'

config({
  defaultCurrency: 'BRL'
})

const props = defineProps({
  // Data props
  keyStored: { type: String, default: () => 'CustomTable' },
  keyExpr: { type: String, default: () => null },
  columns: { type: Array, default: () => [{}] },
  items: { type: Object, required: true, default: () => [{}] },
  actions: { type: Array, default: () => [{}] },
  // Configuration props
  noDataText: { type: String, default: () => 'Nenhum registro encontrado.' },
  storeState: { type: Boolean, default: () => false },
  outlined: { type: Boolean, default: () => true },
  searchable: { type: Boolean, default: false },
  createFilter: { type: Boolean, default: false },
  filterValue: { type: Array, default: () => [{}] },
  filterType: { type: String, default: () => 'exclude' },
  allowColumnReordering: { type: Boolean, default: true },
  allowColumnResizing: { type: Boolean, default: false },
  columnAutoWidth: { type: Boolean, default: true },
  allowColumnFixing: { type: Boolean, default: false },
  allowGroupingColumns: { type: Boolean, default: false },
  allowRowsReordering: { type: Boolean, default: false },
  chooseColumns: { type: Boolean, default: false },
  selectableRows: { type: Boolean, default: false },
  rowAlternationEnabled: { type: Boolean, default: true },
  pager: { type: String },
  scrolling: { type: String, default: 'virtual' },
  lineBreak: { type: Boolean, default: true },
  allowedPageSizes: { type: Array, default: () => [5, 10, 25] },
  pageSize: { type: Number, default: () => 10 },
  hoverRows: { type: Boolean, default: false },
  loading: { type: Boolean, default: true },
  enableAddButton: { type: Boolean, default: false },
  selection: { type: Boolean, default: false },
  selectionCheck: { type: Boolean, default: false },
  onReorderShow: { type: Boolean, default: false },
  columnSummary: { type: Array, default: () => [] },
  detail: { type: Boolean, default: false },
  editing: { type: Boolean, default: false },
  createTitle: { type: String, default: 'Adicionar' },
  createText: { type: String, default: 'Adicionar' },
  paymentsSelecteds: { type: Boolean, default: false },
  page: { type: String, default: ''}
})

// Initialization

const emit = defineEmits(['focusRow', 'add', 'selectionChanged', 'editPayment', 'disapprovePayment', 'approvePayment'])

let tablePageSize = ref(
  !props.pageSize ? (props.allowedPageSizes[props.allowedPageSizes.length - 1] == 'all' ? 0 : props.allowedPageSizes[props.allowedPageSizes.length - 1]) : props.pageSize
)
const focusedRowIndex = ref(0)

const customTable = ref(null)
const filterOn = ref(false)
const render = ref(true)
const toolbarKey = ref(0)

const checkBoxesMode = ref(themes.current().startsWith('material') ? 'always' : 'onClick')

const editPayment = () => {
  emit('editPayment')
}

const disapprovePayment = () => {
  emit('disapprovePayment')
}

const approvePayment = () => {
  emit('approvePayment')
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
  },
  clearSelection: () => {
    if (customTable.value) customTable.value.instance?.clearSelection()
  },
  clearFilters: () => {
    clearFiltersAndRefreshToolbar()
  },
})

const slotColumns = computed(() => props.columns.filter((el) => el.value != 'actions'))

const onSelectionChanged = (e) => {
  emit('selectionChanged', e.selectedRowsData)
}

onMounted(() => {
  toolbarKey.value++
})

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

const colors = {
  confirm: '#118B9F',
  cancel: '#F44336',
  info: 'info',
  success: 'success',
  excel: '#008000'
}

const getActionColor = (type) => colors[type] || '#118B9F'

const getActionDisabled = (action, item) => (action.disabled ? action.disabled(item.data, item.rowIndex, props.items) : false)

const getActionShow = (action, item) => {
  if (action.name === 'pagar') {
    if (!(item.data.movimentacoes_pagamento[0].status_pagamento.nome == 'Exportado')) return false
  }
  if (action.name === 'editar') {
    if (!(item.data.movimentacoes_pagamento[0].status_pagamento.nome == 'Aprovado')) return false
  }
  if (action.name === 'exportar') {
    if (!(item.data.movimentacoes_pagamento[0].status_pagamento.nome == 'Aprovado')) return false
  }
  return true
}

const onCellPrepared = (e) => {
  if (e.rowType === 'data' && e.column.command === 'select') {
    if (e.row.data.situacao === 'enviado') {
      e.column.visible = false
      e.cellElement.querySelector('.dx-select-checkbox').style.display = 'none'
    }
  }
  if (e.rowType === 'header') {
    e.cellElement.style.backgroundColor = '#f1f1f1'
  }

  if (e.row?.data?.situacao == 'enviado') {
    e.cellElement.style.backgroundColor = 'lightgray'
  }
}

const getValue = (data) => data.text

const onFocusedRowChanged = (e) => emit('focusRow', { index: e.rowIndex, data: e.row.data })

// Logic for storing config in local storage
const storageKey = ref(`${props.keyStored}-config`)

// Logic for re-rendering component when loading changes
const forceRender = async () => {
  render.value = false

  await nextTick()

  render.value = true
}

watch(() => props.loading,() => {
    forceRender()
    storageKey.value = `${props.keyStored}-config`
  }
)

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

const onOptionChanged = () => {
  let filterStorage = localStorage.getItem(storageKey.value)
  let verify = false

  if (filterStorage && filterOn.value == false) {
    filterStorage = JSON.parse(filterStorage)
    verify = filterStorage.columns?.some((ref) => ref.filterValues) || filterStorage.searchText?.length > 0 ? true : false
  }

  const filters = customTable?.value?.instance?.getCombinedFilter()

  if ((filters && filterOn.value == false) || verify) {
    filterOn.value = true
  }

  if (!filters && filterOn.value == true) {
    filterOn.value = false
  }
}

const onRowPrepared = (e) => {
  if (e.rowType == 'data' && e.rowElement) {
    // e.rowElement.style.maxHeight = "60px"
  }
}

const onRowClick = (e) => {
  if (e.rowType === 'data' && e.handled !== true && props.selection) {
    var key = e.component.getKeyByRowIndex(e.rowIndex)
    var expanded = e.component.isRowExpanded(key)
    if (expanded) {
      e.component.collapseRow(key)
    } else {
      e.component.expandRow(key)
    }
  }
}

const itemList = ref(props.items)

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

const getClosestTaskForItem = (item) => {
  const tasks = item.value || []

  const sortedTasks = tasks.sort((a, b) => {
    const deadlineA = dayjs(a.data_prazo)
    const deadlineB = dayjs(b.data_prazo)
    if (deadlineA.isBefore(deadlineB)) return -1
    if (deadlineA.isAfter(deadlineB)) return 1
    return 0
  })

  return sortedTasks[0] || null
}

watch(
  () => props.items,
  (items) => (itemList.value = items),
  { deep: true, immediate: true }
)
</script>

<style>
.dx-datagrid .dx-row-alt > td,
.dx-datagrid .dx-row-alt > tr > td {
  background-color: #118c9f17 !important;
}
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
