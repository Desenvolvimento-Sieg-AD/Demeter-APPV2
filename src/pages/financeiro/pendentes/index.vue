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
        :loading="loadingTable"
        :columns="colums"
        :actions="actions"
        allowColumnResizing
        allow-column-reordering
        key-stored="pagamentos-table"
        :allowed-page-sizes="[5, 10, 15, 25]"
        @selectionChanged="handleSelectionChange"
        noDataText="Não há nenhuma solicitação de pagamento"
        :paymentsSelecteds="itemsSelects.length >= 1"
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

        <template #item-movimentacoes_pagamento.status_pagamento="{ data: { data: item } }">
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

const confirm = ref('exportar')
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

// * COMPUTED && MODALS ACTIONS

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
      enableModal.editCount = true
    }
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
    title: confirm.value === 'approve' ? 'Aprovar' : 'Reprovar',
    type: 'success',
    loading: loadingModal.value,
    click: async () => {
      if (confirm.value === 'approve') await sendStatus(3, [viewPayment.value.id])
      else await sendStatus(8, [viewPayment.value.id])
    }
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
    title: confirm.value === 'approve' ? 'Aprovar' : 'Recusar',
    type: 'success',
    loading: loadingModal.value,
    click: async () => await validBeforeSend()
  }
])

const messageConfirmStatus = computed(() => {
  if (confirm.value === 'approve') return 'Deseja realmente aprovar essa solicitação de pagamento?'
  return 'Deseja realmente reprovar essa solicitação de pagamento?'
})

const messageConfirmAllStatus = computed(() => {
  if (confirm.value === 'approve') return 'Deseja realmente aprovar todas as solicitações de pagamentos selecionadas?'
  return 'Deseja realmente reprovar todas as solicitações de pagamentos selecionadas?'
})

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

const handleSelectionChange = (items) => {
  itemsSelects.value = items
}
const validBeforeSend = async () => {
  const status_id = confirm.value === 'approve' ? 3 : 8

  const lista_id = itemsSelects.value.map((item) => item.id)

  await sendStatus(status_id, lista_id)
}

const sendStatus = async (status, id) => {
  try {
    if (status === 8 && !justificativa.value) throw new Error('Justificativa é obrigatória para prosseguir!')

    loadingModal.value = true

    const justificativaValue = confirm.value === 'disapprove' ? justificativa.value : 'Aprovado pelo Financeiro'

    const { success, message } = await postStatus({ id, status, justificativa: justificativaValue })

    if (!success) throw new Error(message)

    $toast.success('Status alterado com sucesso')
    loadingModal.value = false
    enableModal.confirm = false
    enableModal.allConfirm = false
    await getPage()
  } catch (error) {
    console.error(error.message)
    $toast.error(error.message)
  }
}

const isNotEmpty = (value) => value !== undefined && value !== null && value !== '';

function formatFilter(filterArray) {

	const formattedFilters = [];

	for (let i = 0; i < filterArray.length; i++) {

		if (filterArray[i] === 'or' || filterArray[i] === '=') continue;
    if (filterArray[i] === filterArray['filterValue']) continue;

		const fieldName = Array.isArray(filterArray[i]) ? filterArray[i][0] : filterArray[i];
		const value = Array.isArray(filterArray[i]) ? filterArray[i]['filterValue'] : filterArray['filterValue'];

		formattedFilters.push({ fieldName, value });
	}

	return formattedFilters;
}
const getPage = async () => {

	itens.value = new CustomStore({
		key: 'id',
		async load(loadOptions) {

			const paramsName = [ 'skip', 'take', 'requireTotalCount', 'requireGroupCount', 'sort', 'filter', 'totalSummary', 'group', 'groupSummary'];
      
			const queryString = paramsName
				.filter((paramName) => isNotEmpty(loadOptions[paramName]))
				.map((paramName) => {
					if (paramName == 'filter') return { [paramName]: formatFilter(loadOptions[paramName]) };
					return { [paramName]: loadOptions[paramName] };
				});

			const mergedObject = queryString.reduce((acc, obj) => {
				Object.keys(obj).forEach((key) => (acc[key] = obj[key]));
				return acc;
			}, {});

			try {
				const { success, message, data } = await useApi(`/pagamento/scope/financeiroPendentes`, {
					query: {
						paging: true,
						limit: mergedObject.take,
						offset: mergedObject.skip,
						sort: mergedObject.sort,
						filter: JSON.stringify(mergedObject.filter),
					},
				});

				if (!success) throw new Error(message);

        data.data.map((item) => {
          item.movimentacoes_pagamento.status_pagamento = item.movimentacoes_pagamento[0].status_pagamento.nome
          item.lote = item.movimentacoes_pagamento.at().lote
        })

				return {
					data: data.data,
					totalCount: data.count,
				};
			} catch (error) {
				console.log(error.message);
        $toast.error('Erro ao carregar os pagamentos');
			}
		},
	});
};

await getPage();

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
