<template>
  <div>
    <CustomHeader title="Gerência - Aprovação de Pagamentos" />
    <LayoutForm>
      <CustomTableSelect
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
            <div v-if="isNF(item.anexos_pagamento)">
              <v-icon @click="openFiles(item.anexos_pagamento, item.privado)" color="success" class="cursor-pointer"> mdi-paperclip</v-icon>
              <v-tooltip text="Abrir anexo" activator="parent" location="top" />
            </div>
            <div v-else> <v-tooltip text="Sem anexo" activator="parent" location="top" /><v-icon disabled color="gray">mdi-paperclip</v-icon> </div>
          </div>
        </template>
        <template #item-doc="{ data: { data: item } }">
          <div class="d-flex align-center justify-center text-center">
            <div v-if="isDOC(item.anexos_pagamento)">
              <v-icon @click="openFiles(item.anexos_pagamento, item.privado)" color="success" class="cursor-pointer"> mdi-paperclip </v-icon>

              <v-tooltip text="Abrir anexo" activator="parent" location="top" />
            </div>
            <div v-else>
              <v-icon disabled color="gray"> mdi-paperclip </v-icon>

              <v-tooltip text="Sem anexo" activator="parent" location="top" />
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

import { getPagamentoByScope, postStatus } from '@api'
const paymentGerencia = await getPagamentoByScope('gerencia')
const { $toast } = useNuxtApp()
const access = useRuntimeConfig()
const colums = getColumns('gerencia')

const caminho_normal = access.public.PAGAMENTO_PATH
const caminho_privado = access.public.PAGAMENTO_PRIVADO_PATH

const enableModal = reactive({
  confirm: false,
  reprove: false,
  pagamento: false,
  allConfirm: false
})

const confirm = ref('delete')
const itens = ref([])
const itemView = ref({})
const idsSelect = ref([])
const ambos = ref(true)
const loadingModal = ref(false)
const permiteEditar = ref(false)

const justificativa = ref(null)

onMounted(async () => {
  await getPage()
})
const handleSelectionChange = (items) => {
  const ids = items.map((item) => item.id)
  idsSelect.value = ids
}

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
      const status_id = confirm.value === 'approve' ? 4 : 9
      sendStatus(status_id, idsSelect.value)
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

const isNF = (anexos) => anexos.find((anexo) => anexo.tipo_anexo_id === 3)

const isDOC = (anexos) => anexos.find((anexo) => anexo.tipo_anexo_id === 4)

const openFile = async (filePath) => {
  await useOs().openFile(filePath)
}

const openFiles = (anexos, privado) => {
  const statusAllowed = [3, 4]

  const anexo = anexos.find((anexo) => statusAllowed.includes(anexo.tipo_anexo_id))
  if (!anexo) return $toast.error('Anexo não encontrado')

  const caminho = privado ? caminho_privado : caminho_normal
  openFile(`${caminho}${anexo.caminho}`)
}

const smallerIndex = (index, item) => index < item.length - 1

const classSetor = (item, index) => (smallerIndex(index, item.usuario.setores) ? 'mr-2' : '')

const defineDocument = (tipo, documento) => (tipo === 'juridico' ? maskCnpj(documento) : maskCpf(documento))

const defineNameSetor = (sigla, item, index) => (smallerIndex(index, item.usuario.setores) ? `${sigla}, ` : sigla)

const messageConfirmStatus = () => {
  if (confirm.value === 'approve') return 'Deseja realmente aprovar esse pagamento?'
  return 'Deseja realmente reprovar esse pagamento?'
}

const messageConfirmStatusAll = () => {
  if (confirm.value === 'delete') return 'Deseja realmente reprovar todos os pagamentos selecionados?'
  return 'Deseja realmente aprovar todos os pagamentos selecionados?'
}

const sendStatus = async (status, id) => {
  try {
    if (status === 9 && !justificativa.value) throw new Error('Justificativa é obrigatória para prosseguir!')
    loadingModal.value = true

    const { success, message } = await postStatus({ id, status, justificativa: justificativa.value, permite_editar: permiteEditar.value })
    if (!success) throw new Error(message)
    loadingModal.value = false
    enableModal.confirm = false
    enableModal.allConfirm = false
    $toast.success('Status alterado com sucesso')
    await getPage()
  } catch (error) {
    console.log(error.message)
    $toast.error(error.message)
  }
}

const approvePayment = async (ids) => {
  if (ids.length === 0) {
    loadingModal.value = false
    return $toast.error('Selecione ao menos um pagamento')
  }

  try {
    const { success, message } = await postStatus({ id: ids, status: 3, justificativa: 'Aprovado', lote: ids.length > 1 })

    if (!success) throw new Error(message)

    loadingModal.value = false
    enableModal.confirm = false
    enableModal.allConfirm = false
    $toast.success('Pagamento aprovado com sucesso')
    itens.value = paymentGerencia.data
  } catch (error) {
    console.log(error.message)
    $toast.error(error.message)
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

const disapprovePayment = async (ids) => {
  valiDisapprovePayment()

  try {
    const payload = {
      id: ids,
      status: 4,
      justificativa: ambos.value ? justificativa.ambos : null,
      justificativaCliente: ambos.value ? null : justificativa.clientes,
      justificativaFinanceiro: ambos.value ? null : justificativa.financeiro,
      ambos: ambos.value,
      lote: ids.length > 1
    }

    const { success, message } = await postStatus(payload)
    if (!success) throw new Error(message)

    enableModal.reprove = false
    enableModal.allConfirm = false
    loadingModal.value = false
    $toast.success('Pagamento recusado com sucesso')
    itens.value = paymentGerencia.data
  } catch (error) {
    console.log(error.message)
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
				const { success, message, data } = await useApi(`/pagamento/scope/gerencia`, {
					query: {
						paging: true,
						limit: mergedObject.take,
						offset: mergedObject.skip,
						sort: mergedObject.sort,
						filter: JSON.stringify(mergedObject.filter),
					},
				});

				if (!success) throw new Error(message);

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
</style>
