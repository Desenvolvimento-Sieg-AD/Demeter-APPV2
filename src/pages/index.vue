<template>
	<CustomHeader title="Solicitações de Pagamentos" />

	<v-btn class="custom-btn" @click="router.push(`/novo/pagamento`)" color="#118B9F" flat >
		<v-icon icon="mdi-plus" start />
		<b>Novo Pagamento</b>
	</v-btn>

	<LayoutForm>
		<CustomTableSelect
			:columns="columns"
			:items="pagamentos"
			:actions="actions"
			:loading="false"
			scrolling="standard"
			allow-search
			allowColumnResizing
			choose-columns
			allow-column-reordering
			:allowed-page-sizes="[5, 15, 10, 25]"
			:page-size="15"
			pager
		>
			<template #item-categoria.nome="{ data: { data: item } }">
				<div class="template">
					{{ item.categoria.nome }}
				</div>
			</template>

			<template #item-tipo="{ data: { data: item } }">
				<div class="template">
					{{ item.fornecedor.tipo === 'juridico' ? 'Jurídico' : 'Físico' }}
				</div>
			</template>

			<template #item-status="{ data: { data: item } }">
				<div class="template">
					<CustomText
						:title="item.movimentacoes_pagamento[0].status_pagamento.nome"
						class="ml-2"
						:color="item.movimentacoes_pagamento[0].status_pagamento.cor"
						size="14"
						bold
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
				<div class="template" v-if="item.status !== 'Recusado' && item.status !== 'Cancelado'">
					<v-btn
						flat
						icon
						v-if="item.anexos_pagamento?.find((ref) => ref.tipo_anexo_id == 3)"
						@click="openFile(item, 3)"
					>
						<v-icon
							color="success"
							class="cursor-pointer"
							icon="mdi-paperclip"
							:disabled="item.status !== 'Recusado'"
						/>
						<v-tooltip text="Abrir anexo" activator="parent" location="top" />
					</v-btn>
					<v-btn flat icon v-else>
						<v-icon
							disabled
							color="#118B9F"
							class="cursor-pointer"
							@click="(enableModal.upload = true), (itemView = item), (type = 'NF')"
							icon="mdi-paperclip-plus"
						/>
						<v-tooltip text="Anexar arquivo" activator="parent" location="top" />
					</v-btn>
				</div>
			</template>

			<template #item-doc="{ data: { data: item } }">
				<div class="template" v-if="item.status !== 'Recusado' && item.status !== 'Cancelado'">
					<v-btn
						flat
						icon
						v-if="item.anexos_pagamento?.find((anexo) => anexo.tipo_anexo_id == 4)"
						@click="openFile(item, 4)"
					>
						<v-icon color="success" class="cursor-pointer" icon="mdi-paperclip" />
						<v-tooltip text="Abrir anexo" activator="parent" location="top" />
					</v-btn>
					<v-btn flat icon v-else>
						<v-icon
							disabled
							class="cursor-pointer"
							color="#118B9F"
							@click="(enableModal.upload = true), (itemView = item), (type = 'DOC')"
							icon="mdi-paperclip-plus"
						/>
						<v-tooltip text="Anexar arquivo" activator="parent" location="top" />
					</v-btn>
				</div>
			</template>

			<template #item-data="{ data: { data: item } }">
				<div class="template">
					{{ formatDate(item.data_vencimento) }}
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

			<template #item-empresa.apelido="{ data: { data: item } }">
				<div class="template">
					{{ item.empresa.apelido }}
					<v-tooltip :text="item.empresa.nome" activator="parent" location="bottom" />
				</div>
			</template>
		</CustomTableSelect>
	</LayoutForm>

	<LazyModalPagamento v-model:enable="enableModal.view" :id="itemView.id" />

	<LazyModalConfirmCancel
		v-model:enable="enableModal.cancel"
		v-model:message="justificativaCancelamento"
		:item="itemView"
		:actions="modalActions"
	/>

	<LazyModalUpload v-model:enable="enableModal.upload" :item="itemView" @update="pushData" :type="type" />
</template>

<script setup>
//* IMPORTS
import { getPagamentoPorUsuario, postStatus } from '@api';
const { $toast } = useNuxtApp();
const router = useRouter();
const acess = useRuntimeConfig();

//* DATA

const pagamentos = ref([]);
const type = ref(null);
const itemView = ref({});
const columns = getColumns('usuario');
const justificativa = ref(null);
const justificativaCancelamento = ref(null);
const loadingModal = ref(false);
const caminho = acess.public.PAGAMENTO_PATH;

const enableModal = reactive({
	view: false,
	cancel: false,
	upload: false,
});

//* METHODS
const colors = {
	Pendente: 'orange',
	Aprovado: 'green',
	Pago: 'green',
	Recusado: 'red',
	Cancelado: 'gray',
};

// Abrir arquivo do anexo
const openFile = (item, tipo_anexo) => {
	try {
		const itemFind = item.anexos_pagamento.find((ref) => ref.tipo_anexo_id == tipo_anexo);
		if (!itemFind) throw new Error('Anexo não encontrado');

		useOs().openFile(`${caminho}${itemFind.caminho}`);
	} 
	catch (error) {
		$toast.error(error.message);
		console.error(error);
	}
};
// Actions da tabela e modal
const actions = computed(() => [
	{
		icon: 'mdi-eye',
		tooltip: 'Ver detalhes',
		click: (item) => {
			itemView.value = item;
			enableModal.view = true;
		},
		visible: true,
		active: true,
		type: 'padrao',
	},
	{
		icon: 'mdi-cancel',
		tooltip: 'Cancelar',
		click: (item) => {
			itemView.value = item;
			enableModal.cancel = true;
		},
		disabled: (item) => !(item.movimentacoes_pagamento[0].status_pagamento.nome === 'Pendente'),
		type: 'cancel',
	},
]);

const modalActions = computed(() => [
	{
		icon: 'mdi-close',
		title: 'Cancelar',
		type: 'cancel',
		click: () => {
			enableModal.cancel = false;
		},
	},
	{
		icon: 'mdi-check',
		title: 'Confirmar',
		type: 'success',
		loading: loadingModal.value,
		click: () => {
			loadingModal.value = true;
			paymentCancel([itemView.value.id]);
		},
	},
]);

const movimentacaoAprovado = (item) => {
	const findAprovado = item.movimentacoes_pagamento.find((mov) => mov.status_pagamento.nome === 'Aprovado');
	return findAprovado ? formatDate(findAprovado.data_inicio) : 'Em análise';
};

// Funções de Cancelamento de pagamento
const paymentCancel = async (ids) => {
	if (ids.length === 0) {
		$toast.error('Selecione ao menos um pagamento');
		loadingModal.value = false;
		return;
	}
	if (!justificativaCancelamento.value) {
		$toast.error('Informe a justificativa');
		loadingModal.value = false;
		return;
	}
	const { success } = await postStatus({ id: ids, status: 7, justificativa: justificativa.value });
	if (success) {
		enableModal.value = false;
		loadingModal.value = false;
		$toast.success('Pagamento cancelado com sucesso');
		await pushData();
		justificativa.value = null;
	}
	enableModal.cancel = false;

};

// Função para buscar pagamentos
const pushData = async () => {
	const { success, data } = await getPagamentoPorUsuario();
	if (success) {
		data.map((item) => {
			item.status = item.movimentacoes_pagamento[0].status_pagamento.nome;
			item.lote = item.movimentacoes_pagamento.at().lote;
		});
		pagamentos.value = data;
	}
};

onMounted(async () => {
	await pushData();
});
</script>

<style scoped>
.custom-btn {
	position: absolute;
	top: 10px;
	right: 10px;
}
</style>