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
				@selectionChanged="handleSelectionChange"
				selectionCheck
				:allowed-page-sizes="[5, 10, 15, 25]"
				:page-size="15"
				pager
			>
				<template #item-usuario.sigla="{ data: { data: item } }">
					<div>
						<v-tooltip :text="item.usuario.nome" activator="parent" location="top" />
						{{ item.usuario.sigla }}
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
						<div v-if="item.anexos_pagamento.find((ref) => ref.tipo_anexo_id == 3)">
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
						<div v-if="item.anexos_pagamento.find((ref) => ref.tipo_anexo_id == 4)">
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
				<template #item-valor_total="{ data: { data: item } }">
					<div class="d-flex align-center justify-center text-center">
						{{ formatCurrency(item.valor_total) }}
					</div>
				</template>
				<template #item-setor="{ data: { data: item } }">
					<div class="d-flex align-center justify-center text-center">
						<div
							v-for="(set, index) in item.usuario.setores"
							:key="index"
							:class="index < item.usuario.setores.length - 1 ? 'mr-1' : ''"
						>
							<v-tooltip :text="set.nome" activator="parent" location="top" />
							{{ set.sigla }}{{ index < item.usuario.setores.length - 1 ? ', ' : '' }}
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
				<v-col cols="12" class="ga-2 btn-container">
					<v-btn
						v-for="(action, index) of buttonsFooter"
						:key="`${action}-${index}`"
						:disabled="action.disabled"
						:color="action.color"
						@click="action.onClick()"
					>
						{{ action.title }}
					</v-btn>
				</v-col>
			</v-row>
		</LayoutForm>
		<LazyModalPagamento v-model:enable="enableModal" :id="itemView.id" />
		<ModalConfirmStatus
			v-model:enable="enableModalConfirm"
			message="Deseja realmente aprovar este pagamento?"
			:item="itemView"
			:actions="modalActions"
		/>
		<LazyModalReproveStatus
			v-if="enableModalReprove"
			v-model:enable="enableModalReprove"
			v-model:justificativaAmbos="justificativa"
			v-model:justificativaClientes="justificativaClientes"
			v-model:justificativaFinanceiro="justificativaFinanceiro"
			message="Deseja realmente reprovar este pagamento?"
			:item="itemView"
			:actions="modalReproveActions"
			:confirm="confirm"
			v-model:ambos="ambos"
		/>
		<LazyModalConfirmAllStatus
			v-if="enableModalAllConfirm"
			v-model:enable="enableModalAllConfirm"
			v-model:justificativaAmbos="justificativa"
			v-model:ambos="ambos"
			v-model:justificativaClientes="justificativaClientes"
			v-model:justificativaFinanceiro="justificativaFinanceiro"
			:confirm="confirm"
			:message="
				confirm === 'delete'
					? 'Deseja realmente reprovar todos os pagamentos?'
					: 'Deseja realmente aprovar todos os pagamentos selecionados?'
			"
			:actions="confirm === 'delete' ? modalActionsDesprovedAll : modalActionsAprovedAll"
		/>
	</div>
</template>

<script setup>
import { getPagamentoGerencia, postStatus } from '@api';
const acess = useRuntimeConfig();
const caminho = acess.public.PAGAMENTO_PATH;
const colums = getColumns('gerencia');
const enableModal = ref(false);
const enableModalConfirm = ref(false);
const enableModalReprove = ref(false);
const enableModalAllConfirm = ref(false);
const confirm = ref('delete');
const { $toast } = useNuxtApp();
const itens = ref([]);
const itemView = ref({});
const idsSelect = ref([]);
const justificativa = ref(null);
const justificativaAmbos = ref(null);
const justificativaClientes = ref(null);
const justificativaFinanceiro = ref(null);
const ambos = ref(true);
const loadingModal = ref(false);

onMounted(async () => {
	await pushData();
});
const handleSelectionChange = (items) => {
	const ids = items.map((item) => item.id);
	idsSelect.value = ids;
};

const openFile = async (filePath) => {
	const { success, message } = await useOs().openFile(filePath);
	if (!success) $toast.error(message);
};

const actions = ref([
	{
		icon: 'mdi-eye',
		tooltip: 'Ver detalhes',
		click: (ref) => ((itemView.value = ref), (enableModal.value = true)),
		visible: true,
		active: true,
		type: 'padrao',
	},
	{
		icon: 'mdi-check-bold',
		tooltip: 'Aprovar',
		click: (ref) => ((itemView.value = ref), (enableModalConfirm.value = true)),
		visible: true,
		active: true,
		type: 'success',
	},
	{
		icon: 'mdi-close-thick',
		tooltip: 'Recusar',
		click: (ref) => {
			itemView.value = ref;
			enableModalReprove.value = true;
		},
		visible: true,
		active: true,
		type: 'cancel',
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
		title: 'Aprovar',
		type: 'success',
		loading: loadingModal.value,
		click: async () => ((loadingModal.value = true), paymenteAproved([itemView.value.id])),
	},
]);

const modalReproveActions = computed(() => [
	{
		icon: 'mdi-close',
		title: 'Cancelar',
		type: 'grey',

		click: () => (enableModalReprove.value = false),
	},
	{
		icon: 'mdi-check',
		title: 'Reprovar',
		type: 'cancel',
		loading: loadingModal.value,
		click: () => ((loadingModal.value = true), paymentReprove([itemView.value.id])),
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
		title: 'Aprovar',
		type: 'success',
		loading: loadingModal.value,
		click: async () => ((loadingModal.value = true), paymenteAproved(idsSelect.value)),
	},
]);
const modalActionsDesprovedAll = computed(() => [
	{
		icon: 'mdi-close',
		title: 'Cancelar',
		type: 'grey',
		click: () => (enableModalAllConfirm.value = false),
	},
	{
		icon: 'mdi-check',
		title: 'Reprovar',
		type: 'cancel',
		loading: loadingModal.value,
		click: async () => ((loadingModal.value = true), paymentReprove(idsSelect.value)),
	},
]);

const buttonsFooter = computed(() => [
	{
		title: 'Reprovar',
		disabled: !idsSelect.value.length,
		onClick: () => {
			confirm.value = 'delete';
			enableModalAllConfirm.value = true;
		},
		color: 'red',
	},
	{
		title: 'Aprovar',
		disabled: !idsSelect.value.length,
		onClick: () => {
			confirm.value = 'aproved';
			enableModalAllConfirm.value = true;
		},
		color: 'success',
	},
]);

const paymenteAproved = async (ids) => {
	if (ids.length === 0) {
		$toast.error('Selecione ao menos um pagamento');
		loadingModal.value = false;
		return;
	}
	const { success } = await postStatus({ id: ids, status: 3, justificativa: 'Aprovado', lote: ids.length > 1 });
	if (success) {
		enableModalConfirm.value = false;
		enableModalAllConfirm.value = false;
		loadingModal.value = false;
		$toast.success('Pagamento aprovado com sucesso');
		itens.value = (await getPagamentoGerencia()).data;
	}
};
const paymentReprove = async (ids) => {
	if (ids.length === 0) {
		$toast.error('Selecione ao menos um pagamento');
		loadingModal.value = false;
		return;
	}

	if (ambos.value && !justificativa.value) {
		$toast.error('Informe a justificativa');
		loadingModal.value = false;
		return;
	}
	if (!ambos.value && (!justificativaClientes.value || !justificativaFinanceiro.value)) {
		$toast.error('Informe a justificativa');
		loadingModal.value = false;
		return;
	}

	const { success } = await postStatus({
		id: ids,
		status: 4,
		justificativa: justificativa.value,
		justificativaCliente: justificativaClientes.value,
		justificativaFinanceiro: justificativaFinanceiro.value,
		ambos: ambos.value,
		lote: ids.length > 1,
	});
	if (success) {
		enableModalReprove.value = false;
		enableModalAllConfirm.value = false;
		loadingModal.value = false;
		$toast.success('Pagamento recusado com sucesso');
		itens.value = (await getPagamentoGerencia()).data;
	}
};

const pushData = async () => {
	const { success, data } = await getPagamentoGerencia();
	if (success) {
		data.map((item) => {
			item.setor = item.usuario.setores[0].sigla;
		});

		itens.value = data;
	}
};
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
