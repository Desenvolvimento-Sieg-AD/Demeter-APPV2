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
					:loading="false"
					:columns="colums"
					:actions="actions"
					allowColumnResizing
					allow-column-reordering
					key-stored="pagamentos-table"
					:allowed-page-sizes="[5, 15, 10, 25]"
					@selectionChanged="handleSelectionChange"
					noDataText="Não há nenhuma solicitação de pagamento"
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
							{{ defineDocument(item.fornecedor.tipo, item.fornecedor.documento) }}
						</div>
					</template>

					<template #item-anexo="{ data: { data: item } }">
						<div class="d-flex align-center justify-center text-center">
							<div v-if="isNF(item.anexos_pagamento)">

								<v-icon @click="openFiles(item.anexos_pagamento)" color="success" class="cursor-pointer">
									mdi-paperclip
								</v-icon>

								<v-tooltip text="Abrir anexo" activator="parent" location="top" />

							</div>

							<div v-else>
								<v-icon disabled color="gray">
									mdi-paperclip
								</v-icon>
								<v-tooltip text="Sem anexo" activator="parent" location="top" />
							</div>

						</div>
					</template>

					<template #item-doc="{ data: { data: item } }">
						<div class="d-flex align-center justify-center text-center">

							<div v-if="isDOC(item.anexos_pagamento)">

								<v-icon @click="openFiles(item.anexos_pagamento)" color="success" class="cursor-pointer">
									mdi-paperclip
								</v-icon>
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

					<template #item-created_at="{data: { data: item } }">
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

				<v-row>
					<v-col class="btn-container ga-2" cols="12">
						<v-btn
							v-for="(action, index) in actionsButton"
							:key="`${action}-${index}`"
							:disabled="action.disabled"
							:color="action.color"
							@click="action.onClick()"
						>
							{{ action.title }}
							<v-icon small="small" :icon="action.icon"></v-icon>
						</v-btn>
					</v-col>
				</v-row>
			</LayoutForm>

			<LazyModalConfirmExport
				v-model:enable="enableModal.export"
				:loading="loadingModal"
				:actions="modalActionsExport"
				message="Existem pagamentos ja exportados nesta seleção, deseja inclui-los na importação?"
			/>

			<LazyModalConfirmExportToClient
				v-model:enable="enableModal.exportToClient"
				:clients="clients"
				@update:selectClient="exportClient"/>
			
			<LazyModalPagamento v-model:enable="enableModal.pagamento" :id="viewPayment.id" />

			<LazyModalLink v-model:enable="enableModal.link" v-model:link="link" />

			<LazyModalConfirmStatus
				v-model:enable="enableModal.confirm"
				:message="messageConfirmStatus()"
				:item="viewPayment"
				:actions="modalActions"
			/>

			<LazyModalEditCount
				v-if="enableModal.editCount"
				v-model:enable="enableModal.editCount"
				message="Editar pagamento"
				:id="viewPayment"
				@update-success="pushData"
			/>

			<LazyModalEditCountAll
				v-if="enableModal.allEdit"
				v-model:enable="enableModal.allEdit"
				message="Editar contas de pagamento:"
				:items="itemsSelects"
				@update-success="pushData"
			/>

			<LazyModalConfirmAllStatus
				v-if="enableModal.allConfirm"
				v-model:enable="enableModal.allConfirm"
				v-model:justificativa="justificativa"
				:confirm="confirm"
				:message="messageConfirmAllStatus"
				:actions="modalActionsAprovedAll"
			/>

		</div>
</template>

<script setup>
import CustomStore from 'devextreme/data/custom_store';
import { getPagamentoFinanceiro, postStatus, omie } from '@api';
const { $toast } = useNuxtApp();
const colums = getColumns('financeiro');
const access = useRuntimeConfig();
const path = access.public.PAGAMENTO_PATH;

const confirm = ref('exportar');
const itens = ref([]);
const viewPayment = ref({});
const itemsSelects = ref([]);
const justificativa = ref('');
const loadingModal = ref(false);
const clients = ref([]);
const link = ref('');

const enableModal = reactive({
	link: false,
	export: false,
	confirm: false,
	allEdit: false,
	editCount: false,
	pagamento: false,
	allConfirm: false,
	exportToClient: false,
});

const openFiles = (anexos) => {
	const statusAllowed = [3, 4]

	const anexo = anexos.find((anexo) => statusAllowed.includes(anexo.status_pagamento_id));
	if (!anexo) return $toast.error('Anexo não encontrado');
	openFile(`${path}${anexo.caminho}`);
};

const isNF = (anexos) => anexos.find((anexo) => anexo.tipo_anexo_id === 3);

const isDOC = (anexos) => anexos.find((anexo) => anexo.tipo_anexo_id === 4);

const defineDocument = (tipo) => tipo === 'juridico' ? maskCnpj(item.fornecedor.documento) : maskCpf(item.fornecedor.documento)

const smallerIndex = (index, item) => index < item.length - 1;

const classSetor = (item, index) => smallerIndex(index, item.usuario.setores) ? 'mr-2' : '';

const defineNameSetor = (sigla, item, index) => smallerIndex(index, item.usuario.setores) ? `${sigla}, ` : sigla;

const handleSelectionChange = (items) => itemsSelects.value = items;

const messageConfirmStatus = () => {
	if (confirm.value === 'exportar') return 'Deseja realmente exportar a solicitação de pagamento?';
	return 'Deseja realmente pagar a solicitação de pagamento?';
};

const messageConfirmAllStatus = () => {
	if(confirm.value === 'exportar') return 'Deseja realmente exportar todas as solicitações de pagamentos selecionadas?'
	return 'Deseja realmente pagar todas as solicitações de pagamentos selecionadas?'
}

const openFile = (filePath) => {
	window.electronAPI.openFile(filePath).then((response) => {
		if (!response.success) {
			console.error('Erro ao abrir arquivo:', response.message);
		}
	});
};

const validExport = async () => {
    confirm.value = 'exportar';
    const hasPaymentStatusExport = itemsSelects.value.some(item => item.movimentacoes_pagamento[0].status_pagamento.id === 5);

    if (hasPaymentStatusExport) {
        clients.value = itemsSelects.value.map(item => item?.empresa);
    } else {
        const clientsSelects = new Set(itemsSelects.value.map(item => JSON.stringify(item?.empresa)));
        clients.value = Array.from(clientsSelects).map(jsonItem => JSON.parse(jsonItem));
    }

    enableModal.exportToClient = true;
}

const validEdit = async () => {
	confirm.value = 'editar';

	const items = itemsSelects.value.filter((ref) => ref.movimentacoes_pagamento[0].status_pagamento.id === 3);

	if (items.length == 1) {
		enableModal.editCount = true;
		viewPayment.value = itemsSelects.value[0];
	}
};

// * MODALS ACTIONS

const actionsButton = computed(() => [
	{
		title: 'Exportar',
		color: '#118B9F',
		icon: 'mdi-file-excel',
		disabled: !itemsSelects.value.length,
		onClick: () => validExport(),
	},
	{
		title: 'Editar',
		color: 'blue',
		disabled: !itemsSelects.value.length,
		icon: 'mdi-pencil',
		onClick: () => validEdit(),
	},
	{
		title: 'Pagar',
		color: '#008000',
		icon: 'mdi-currency-usd',
		disabled: !itemsSelects.value.length,
		onClick: () => {
			confirm.value = 'pagar';
			enableModal.allConfirm = true;
		},
	},
]);

const actions = computed(() => [
	{
		icon: 'mdi-eye',
		tooltip: 'Ver detalhes',
		click: (item) => {
			viewPayment.value = item;
			enableModal.pagamento = true;
		},
		active: true,
		type: 'padrao',
		name: 'ver',
	},
	{
		icon: 'mdi-pencil',
		tooltip: 'Editar',
		click: (ref) => {
			viewPayment.value = ref?.id;
			enableModal.editCount = true;
		},
		active: true,
		type: 'padrao',
		name: 'editar',
	},
	{
		icon: 'mdi-currency-usd',
		tooltip: 'Pagar',
		click: async (item) => {
			confirm.value = 'pagar';
			viewPayment.value = item;
			enableModal.confirm = true;
		},
		active: true,
		type: 'success',
		name: 'pagar',
	},
	{
		icon: 'mdi-file-excel',
		tooltip: 'Exportar',
		click: async (item) => {
			confirm.value = 'exportar';
			viewPayment.value = item;
			enableModal.confirm = true;
		},
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
		click: () => enableModal.confirm = false,
	},
	{
		icon: 'mdi-check',
		title: confirm.value === 'exportar' ? 'Exportar' : 'Pagar',
		type: 'success',
		loading: loadingModal.value,
		click: async () => {
			if(confirm.value === 'exportar') await sendExport([viewPayment.value]);
			else await sendPayment([viewPayment.value]);
		}
	},
]);

const modalActionsExport = computed(() => [
	{
		icon: 'mdi-close',
		title: 'Nao incluir',
		type: 'grey',
		click: async () => {
			enableModal.export = false;
			const itemsApproved = itemsSelects.value.filter((item) => item.movimentacoes_pagamento[0].status_pagamento.id === 3);
			await sendExport(itemsApproved);
		},
	},
	{
		icon: 'mdi-check',
		title: 'Incluir',
		type: 'success',
		click: async () => {
			enableModal.export = false;
			await sendExport(itemsSelects.value);
		}
	},
]);

const modalActionsAprovedAll = computed(() => [
	{
		icon: 'mdi-close',
		title: 'Cancelar',
		type: 'grey',
		click: () => enableModal.allConfirm = false,
	},
	{
		icon: 'mdi-check',
		title: confirm.value === 'exportar' ? 'Exportar' : 'Pagar',
		type: 'success',
		loading: loadingModal.value,
		click: async () => {

			const status_id = confirm.value === 'exportar' ? 3 : 5;

			const lista = itemsSelects.value.filter((item) =>
				item.movimentacoes_pagamento.map((mov) => mov.status_pagamento.id === status_id)
			);

			if (status_id === 3) await sendExport(lista);
			else await sendPayment(lista);
		},
	},
]);

const exportClient = async (empresa) => {
	const payments = itemsSelects.value.filter((item) => item.empresa.id === empresa)
	await sendExport(payments);
};

const sendPayment = async (payments) => {
	
	if (payments.length === 0) return $toast.error('Selecione ao menos uma solicitação para pagamento!');
	
	loadingModal.value = true;

	try {

        const ids = payments.map(payment => payment.id);

        const { success, message } = await postStatus({ id: ids, status: 6, justificativa: 'Pago' });
        
		if (!success) throw new Error(message);

        $toast.success('Pagamento aprovado com sucesso');
		await pushData();
		loadingModal.value = false;
        enableModal.confirm = false;
        enableModal.allConfirm = false;
        
    } catch (error) {
		console.error(error.message);
        $toast.error(error.message);
    } 
};

const sendExport = async (payments) => {
	loadingModal.value = true;

	try {
		const paymentsToExport = payments.map((payment) => ({
			pagamento_id: payment.id,
			sigla: payment.usuario.setores[0].sigla,
		}));

		const { success, message, data } = await omie(paymentsToExport);

		console.log(success, message, data)
		
		if(!success) throw new Error('Erro ao exportar:', message);

		$toast.success('Exportação realizada com sucesso');


		enableModal.link = true;
		link.value = data;
        loadingModal.value = false;

		enableModal.confirm = false;
		enableModal.allConfirm = false;
		loadingModal.value = false;
		await pushData();

	} catch (error) {
		console.log(error.message);
		$toast.error(error.message);
	}
	
}
const pushData = async () => {
	try {
		const { success, message, data } = await getPagamentoFinanceiro();
		if(!success) throw new Error(message);

		data.map((item) => {
			item.setor = item.usuario.setores[0].sigla;
			item.status = item.movimentacoes_pagamento[0].status_pagamento.nome;
			item.lote = item.movimentacoes_pagamento.at().lote;
		});

		itens.value = data;

	} catch (error) {	
		console.error(error.message);
		$toast.error('Erro ao buscar dados');
	}
};

await pushData();

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
