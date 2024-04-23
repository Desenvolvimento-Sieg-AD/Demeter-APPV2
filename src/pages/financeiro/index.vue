<template>
	<div>
		<CustomHeader title="Financeiro" />
		<LayoutForm>
			<CustomTableSelect
				:columns="colums"
				:items="itens"
				:actions="actions"
				:loading="false"
				scrolling="standard"
				allowColumnResizing
				choose-columns
				allow-column-reordering
				@selectionChanged="handleSelectionChange"
				selectionCheck
				:allowed-page-sizes="[5, 15, 10, 25]"
				:page-size="15"
				pager
				store-state
				key-stored="pagamentos-table"
			>
				<template #item-usuario.sigla="{ data: { data: item } }">
					<div>
						<v-tooltip :text="item.usuario?.nome" activator="parent" location="top" />
						{{ item.usuario?.sigla }}
					</div>
				</template>

				<template #item-categoria.nome="{ data: { data: item } }">
					<div class="d-flex align-center justify-center text-center">
						{{ item.categoria.nome }}
					</div>
				</template>

				<template #item-tipo="{ data: { data: item } }">
					<div class="d-flex align-center justify-center text-center">
						{{ item.fornecedor.tipo === 'juridico' ? 'Jurídico' : 'Físico' }}
					</div>
				</template>

				<template #item-status="{ data: { data: item } }">
					<div class="d-flex align-center justify-center text-center">
						<CustomText
							:title="item.movimentacoes_pagamento[0].status_pagamento.nome"
							class="ml-2"
							:color="item.movimentacoes_pagamento[0].status_pagamento.cor"
							size="14"
							:bold="true"
						/>
					</div>
				</template>

				<template #item-documento="{ data: { data: item } }">
					<div class="d-flex align-center justify-center text-center">
						{{
							item.fornecedor.tipo === 'juridico'
								? maskCnpj(item.fornecedor.documento)
								: maskCpf(item.fornecedor.documento)
						}}
					</div>
				</template>

				<template #item-anexo="{ data: { data: item } }">
					<div class="d-flex align-center justify-center text-center">
						<div v-if="item.anexos_pagamento?.find((ref) => ref.tipo_anexo_id == 3)">
							<v-icon
								@click="openFile(`${caminho}${item.anexos_pagamento.find((ref) => ref.tipo_anexo_id == 3).caminho}`)"
								color="success"
								class="cursor-pointer"
							>
								mdi-paperclip</v-icon
							>
							<v-tooltip text="Abrir anexo" activator="parent" location="top" />
						</div>
						<div v-else>
							<v-tooltip text="Anexo indísponivel" activator="parent" location="top" /><v-icon disabled color="gray"
								>mdi-paperclip</v-icon
							>
						</div>
					</div>
				</template>

				<template #item-doc="{ data: { data: item } }">
					<div class="d-flex align-center justify-center text-center">
						<div v-if="item.anexos_pagamento?.find((ref) => ref.tipo_anexo_id == 4)">
							<v-icon
								@click="openFile(`${caminho}${item.anexos_pagamento.find((ref) => ref.tipo_anexo_id == 4).caminho}`)"
								color="success"
								class="cursor-pointer"
							>
								mdi-paperclip</v-icon
							>
							<v-tooltip text="Abrir anexo" activator="parent" location="top" />
						</div>
						<div v-else>
							<v-tooltip text="Anexo indísponivel" activator="parent" location="top" /><v-icon disabled color="gray"
								>mdi-paperclip</v-icon
							>
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

				<template #item-valor_total="{ data: { data: item } }">
					<div class="d-flex align-center justify-center text-center">
						{{ formatCurrency(item.valor_total) }}
					</div>
				</template>

				<template #item-setor="{ data: { data: item } }">
					<div class="d-flex align-center justify-center text-center">
						<div
							v-for="(set, index) in item.usuario?.setores"
							:key="index"
							:class="index < item.usuario?.setores.length - 1 ? 'mr-1' : ''"
						>
							<v-tooltip :text="set.nome" activator="parent" location="top" />
							{{ set.sigla }}{{ index < item.usuario?.setores.length - 1 ? ', ' : '' }}
						</div>
					</div>
				</template>

				<template #item-empresa.apelido="{ data: { data: item } }">
					<div class="d-flex align-center justify-center text-center">
						<v-tooltip :text="item.empresa.nome" activator="parent" location="top" />
						{{ item.empresa.apelido }}
					</div>
				</template>

			</CustomTableSelect>

			<v-row>
				<v-col class="btn-container ga-2" cols="12">
					<v-btn
						v-for="(action, index) in actionsButton"
						:key="`${action}-${index}`"
						:disabled="action.disabled"
						:color="action.color"
						class="btn-container"
						@click="action.onClick()"
					>
						{{ action.title }}
						<v-icon small="small" :icon="action.icon"></v-icon>
					</v-btn>
				</v-col>
			</v-row>
		</LayoutForm>

		<!-- <LazyModalConfirmExport
			v-if="enableModalExport"
			v-model:enable="enableModalExport"
			message="Existem pagamentos ja exportados nesta seleção, deseja inclui-los na importação?"
			:actions="modalActionsExport"
		/> -->
		
		<LazyModalPagamento v-model:enable="enableModal" :id="itemView.id" />

		<LazyModalLink v-model:enable="enableModalLink" v-model:link="link" />

		<ModalConfirmStatus
			v-model:enable="enableModalConfirm"
			:message="
				confim === 'exportar'
					? 'Deseja realmente exportar essa solicitação de pagamento?'
					: 'Deseja realmente pagar essa solicitação de pagamento ?'
			"
			:item="itemView"
			:actions="modalActions"
		/>

		<LazyModalEditCount
			v-if="editcount"
			v-model:enable="editcount"
			message="Editar pagamento"
			:id="itemView"
			@update-success="pushData"
		/>

		<LazyModalEditCountAll
			v-if="enableModalAllEdit"
			v-model:enable="enableModalAllEdit"
			message="Editar contas de pagamento:"
			:items="itemsSelects"
			@update-success="pushData"
		/>

		<LazyModalConfirmAllStatus
			v-if="enableModalAllConfirm"
			v-model:enable="enableModalAllConfirm"
			v-model:justificativa="justificativa"
			:confirm="confim"
			:message="
				confim === 'exportar'
					? 'Deseja realmente exportar todas as solicitações de pagamentos selecionadas?'
					: 'Deseja realmente pagar todas as solicitações de pagamentos selecionadas?'
			"
			:actions="modalActionsAprovedAll"
		/>
	</div>
</template>

<script setup>
import { getPagamentoFinanceiro, postStatus, omie } from '@api';
const acess = useRuntimeConfig();
const caminho = acess.public.PAGAMENTO_PATH;
const colums = getColumns('financeiro');
const enableModal = ref(false);
const enableModalConfirm = ref(false);
const editcount = ref(false);
const enableModalAllConfirm = ref(false);
const confim = ref('exportar');
const { $toast } = useNuxtApp();
const itens = ref([]);
const itemView = ref({});
const itemsSelects = ref([]);
const justificativa = ref('');
const loadingModal = ref(false);
const enableModalLink = ref(false);
const enableModalExport = ref(false);
const enableModalAllEdit = ref(false);

const link = ref('');

const handleSelectionChange = (items) => {
	itemsSelects.value = items;
};

const openFile = async (filePath) => {
	const { success, message } = await useOs().openFile(filePath);
	if (!success) $toast.error(message);
};

const verify = async () => {
	confim.value = 'exportar';
	if (itemsSelects.value.filter((ref) => ref.movimentacoes_pagamento[0].status_pagamento.id === 5).length > 0) {
		enableModalExport.value = true;
	} 
	else {
		enableModalAllConfirm.value = true;
	}
};

const verifyEdit = async () => {
	confim.value = 'editar';
	const items = itemsSelects.value.filter((ref) => ref.movimentacoes_pagamento[0].status_pagamento.id === 3);

	if (items.length > 1) {
		itemsSelects.value = items;
		enableModalAllEdit.value = true;
	} 
	else if (itemsSelects.value.filter((ref) => ref.movimentacoes_pagamento[0].status_pagamento.id === 3).length == 1) {
		editcount.value = true;
		itemView.value = itemsSelects.value[0];
	}
};

const actionsButton = computed(() => [
	{
		title: 'Exportar',
		color: '#118B9F',
		icon: 'mdi-file-excel',
		disabled: !itemsSelects.value.length,
		onClick: () => verify(),
	},
	{
		title: 'Editar',
		color: 'blue',
		disabled: !itemsSelects.value.length,
		icon: 'mdi-pencil',
		onClick: () => verifyEdit(),
	},
	{
		title: 'Pagar',
		color: '#008000',
		icon: 'mdi-currency-usd',
		disabled: !itemsSelects.value.length,
		onClick: () => {
			(confim.value = 'pagar'), (enableModalAllConfirm.value = true);
		},
	},
]);

const actions = computed(() => [
	{
		icon: 'mdi-eye',
		tooltip: 'Ver detalhes',
		click: (ref) => ((itemView.value = ref), (enableModal.value = true)),
		active: true,
		type: 'padrao',
		name: 'ver',
	},
	{
		icon: 'mdi-pencil',
		tooltip: 'Editar',
		click: (ref) => {
			itemView.value = ref?.id;
			editcount.value = true;
		},
		visible: true,
		active: true,
		type: 'padrao',
		name: 'editar',
	},
	{
		icon: 'mdi-currency-usd',
		tooltip: 'Pagar',
		click: async (ref) => ((confim.value = 'pagar'), (itemView.value = ref), (enableModalConfirm.value = true)),
		active: true,
		type: 'success',
		name: 'pagar',
	},
	{
		icon: 'mdi-file-excel',
		tooltip: 'Exportar',
		click: async (ref) => ((confim.value = 'exportar'), (itemView.value = ref), (enableModalConfirm.value = true)),
		visible: true,
		active: true,
		type: 'excel',
		name: 'exportar',
	},
]);

const modalActions = computed(() => [
	{
		icon: 'mdi-close',
		title: 'Cancelar',
		type: 'grey',
		click: () => (enableModalConfirm.value = false),
	},
	{
		icon: 'mdi-check',
		title: confim.value === 'exportar' ? 'Exportar' : 'Pagar',
		type: 'success',
		loading: loadingModal.value,
		click: async () =>
			confim.value === 'exportar' ? await sendExport([itemView.value]) : await sendPayment([itemView.value]),
	},
]);

const modalActionsExport = computed(() => [
	{
		icon: 'mdi-close',
		title: 'Nao incluir',
		type: 'grey',
		click: async () => {
			enableModalExport.value = false;
			await sendExport(itemsSelects.value.filter((ref) => ref.movimentacoes_pagamento[0].status_pagamento.id === 3));
		},
	},
	{
		icon: 'mdi-check',
		title: 'Incluir',
		type: 'success',
		click: async () => ((enableModalExport.value = false), await sendExport(itemsSelects.value)),
	},
]);

const modalActionsAprovedAll = computed(() => [
	{
		icon: 'mdi-close',
		title: 'Cancelar',
		type: 'grey',
		click: () => (enableModalAllConfirm.value = false),
	},
	{
		icon: 'mdi-check',
		title: confim.value === 'exportar' ? 'Exportar' : 'Pagar',
		type: 'success',
		loading: loadingModal.value,
		click: async () => {
			const statusId = confim.value === 'exportar' ? 3 : 5;
			const lista = itemsSelects.value.filter((item) =>
				item.movimentacoes_pagamento.map((mov) => mov.status_pagamento.id === statusId)
			);

			if (statusId === 3) await sendExport(lista);
			else await sendPayment(lista);
		},
	},
]);

const sendPayment = async (payments) => {
	try {
		if (payments.length === 0) throw new Error('Selecione ao menos uma solicitação para pagamento!');

		const ids = payments.map((payment) => payment.id);
		loadingModal.value = true;

		const { success, message } = await postStatus({ id: ids, status: 6, justificativa: 'Pago' });
		if (!success) throw new Error(message);

		$toast.success('Pagamento aprovado com sucesso');

		await pushData()
	} 
	catch (error) {
		$toast.error(error.message);
	}

	enableModalConfirm.value = false;
	enableModalAllConfirm.value = false;
	loadingModal.value = false;
};

const sendExport = async (ref) => {
	if (ref.length === 0) {
		$toast.error('Selecione ao menos um pagamento para exportação!');
		enableModalConfirm.value = false;
		enableModalAllConfirm.value = false;
		return;
	}
	loadingModal.value = true;
	const send = ref.map((pagamento) => ({
		pagamento_id: pagamento.id,
		sigla: pagamento.usuario.setores[0].sigla,
	}));

	const { success, data } = await omie(send);
	if (success) {
		enableModalConfirm.value = false;
		enableModalAllConfirm.value = false;
		loadingModal.value = false;
		$toast.success('Exportação realizada com sucesso');
		await pushData();
		enableModalLink.value = true;
		link.value = data;
	} else {
		enableModalConfirm.value = false;
		enableModalAllConfirm.value = false;
		loadingModal.value = false;
		$toast.error('Erro ao exportar');
	}
};
const pushData = async () => {
	const { success, data } = await getPagamentoFinanceiro();
	if (success) {
		data.map((item) => {
			item.setor = item.usuario.setores[0].sigla;
			item.status = item.movimentacoes_pagamento[0].status_pagamento.nome;
			item.lote = item.movimentacoes_pagamento.at().lote;
		});
		itens.value = data;
	}
};

const isNotEmpty = (value) => value !== undefined && value !== null && value !== '';

function formatFilter(filterArray) {
	const formattedFilter = {};

	for (let i = 0; i < filterArray.length; i++) {
		if (typeof filterArray[i] !== 'string' && filterArray[i][1] === 'contains') {
			const fieldName = filterArray[i][0];
			const value = filterArray[i].filterValue;
			formattedFilter[fieldName] = value;
		}
	}

	return formattedFilter;
}

// const getPage = async () => {
// 	itens.value = new CustomStore({
// 		key: 'id',
// 		async load(loadOptions) {
// 			console.log(loadOptions);
// 			const paramsName = [
// 				'skip',
// 				'take',
// 				'requireTotalCount',
// 				'requireGroupCount',
// 				'sort',
// 				'filter',
// 				'totalSummary',
// 				'group',
// 				'groupSummary',
// 			];
// 			const queryString = paramsName
// 				.filter((paramName) => isNotEmpty(loadOptions[paramName]))
// 				.map((paramName) => {
// 					if (paramName == 'filter') return { [paramName]: formatFilter(loadOptions[paramName]) };
// 					return { [paramName]: loadOptions[paramName] };
// 				});

// 			const mergedObject = queryString.reduce((acc, obj) => {
// 				Object.keys(obj).forEach((key) => (acc[key] = obj[key]));
// 				return acc;
// 			}, {});
// 			try {
// 				const { success, message, data } = await useApi(`/pagamento/scope/financeiroScope`, {
// 					query: {
// 						limit: mergedObject.take,
// 						offset: mergedObject.skip,
// 						sort: mergedObject.sort,
// 						filter: mergedObject.filter,
// 					},
// 				});

// 				console.log('🚀 ~ load ~ data:', data);

// 				if (!success) throw new Error(message);

// 				return {
// 					data: data.data,
// 					totalCount: data.count,
// 				};
// 			} catch (error) {
// 				console.log(error.message);
// 				$toast.error(error.message);
// 			}
// 		},
// 	});
// };

onMounted(async () => {
	// await getPage();
	await pushData();
});
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
