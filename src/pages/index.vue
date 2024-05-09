<template>

	<div>
		<CustomHeader :title="title" />
			<LayoutForm>
				<CustomTableSelect
					:columns="columns"
					:items="pagamentos"
					:actions="actions"
					:loading="loadingTable"
					scrolling="standard"
					noDataText="Você não tem nenhuma solicitação de pagamento"
					allow-search
					allowColumnResizing
					choose-columns
					allow-column-reordering
					:allowed-page-sizes="[5, 15, 10, 25]"
					:page-size="15"
					enableAddButton
					createTitle="NOVO PAGAMENTO"
					createText="Ir para página de solicitação"
					@add="router.push(`/pagamento/novo`);"
					pager
				>
					<template #item-categoria="{ data: { data: item } }">
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

							<v-chip :color="item.movimentacoes_pagamento[0].status_pagamento.cor">
								<p class="font-weight-bold">
									{{ item.movimentacoes_pagamento[0].status_pagamento.label }}
								</p>
							</v-chip>
							
						</div>
					</template>

					<template #item-documento="{ data: { data: item } }">
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

							<v-btn flat icon variant="plain" v-else>
								
								<v-icon color="#118B9F" class="cursor-pointer" @click="uploadFile(item, 3)" icon="mdi-paperclip-plus" />

								<v-tooltip text="Anexar arquivo" activator="parent" location="top" />

							</v-btn>

						</div>

					</template>

					//* Anexo de DOC

					<template #item-doc="{ data: { data: item } }">

						<div class="template" v-if="isNotStatusAllowed(item.status)">
		
							<v-btn v-if="isDOC(item.anexos_pagamento)" flat icon variant="plain" >

								<div v-if="item.anexos_pagamento?.length > 0">

									<v-icon
										:color="item.anexos_pagamento.length === 1 ? 'success' : 'purple'"
										class="cursor-pointer"
										icon="mdi-paperclip"
										@click="item.anexos_pagamento.length === 1 ? openFile(item, 4) : null"
									/>
									<v-tooltip
										:text="item.anexos_pagamento.length === 1 ? 'Abrir anexo' : nameFiles(item.anexos_pagamento)"
										activator="parent"
										location="top"
									/>

								</div>
								
							</v-btn>

							<v-btn flat icon variant="plain" v-else>

								<div>

									<v-icon class="cursor-pointer" color="#118B9F" @click="uploadFile(item, 4)" icon="mdi-paperclip-plus" />

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
					<template #item-created_at="{data: { data: item } }">
						<div class="template">
							{{ formatDate(item.created_at) }}
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

			<LazyModalPagamento 
				v-model:enable="enableModal.pagamento"
				:id="pagamento.id"
				:allowEdit="allowEdit" 
				@getPagamento="pushData()"
			/>

			<LazyModalConfirmCancel
				v-model:enable="enableModal.cancel"
				v-model:justificativa="justificativa"
				:item="pagamento"
				:actions="modalActions"
			/>
			<LazyModalUpload 
				v-model:enable="enableModal.upload" 
				:item="pagamento" 
				@update="pushData" 
				:tipo_anexo_id="tipo_anexo_id" />
	</div>
</template>

<script setup>

//* IMPORTS

import { getPagamentoByScope, postStatus } from '@api';
const { $toast } = useNuxtApp();
const router = useRouter();
const access = useRuntimeConfig();
const columns = getColumns('usuario');

//* DATA

const path = access.public.PAGAMENTO_PATH;
const title = ref('Pagamentos')
const loading = ref(false);
const allowEdit = ref(true);
const pagamento = ref({});
const pagamentos = ref([]);
const tipo_anexo_id = ref(null);
const loadingTable = ref(false);
const justificativa = ref(null);

const enableModal = reactive({
	cancel: false,
	upload: false,
	pagamento: false,
});

// * ACTIONS

const actions = computed(() => [
	{
		icon: 'mdi-eye',
		tooltip: 'Ver detalhes',
		click: (item) => {
			pagamento.value = item;
			enableModal.pagamento = true;
		},
		visible: true,
		active: true,
		type: 'padrao',
	},
	{
		icon: 'mdi-cancel',
		tooltip: 'Cancelar',
		click: (item) => {
			pagamento.value = item;
			enableModal.cancel = true;
		},
		disabled: (item) => !(item.movimentacoes_pagamento[0].status_pagamento.label === 'Pendente'),
		type: 'cancel',
	},
	{
		icon: 'mdi-pencil',
		tooltip: 'Editar',
		disabled: () => true,
		click: (item) => {
			pagamento.value = item;
			enableModal.pagamento = true;
		}
	}
])

const modalActions = [
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
		loading: loading.value,
		click: () => {
			loading.value = true;
			cancelPayment([pagamento.value.id]);
		},
	},
]

//* METHODS

const openFile = (item, tipo_anexo) => {
	try {
		const itemFind = item.anexos_pagamento.find((ref) => ref.tipo_anexo_id == tipo_anexo);
		if (!itemFind) throw new Error('Anexo não encontrado');

		window.electronAPI.openFile(`${path}${itemFind.path}`);
	} 
	catch (error) {
		$toast.error(error.message);
		console.error(error);
	}
};

const movimentacaoAprovado = (item) => {
	const findAprovado = item.movimentacoes_pagamento.find((mov) => mov.status_pagamento.id >= 4 ); // ? APROVADO
	return findAprovado ? formatDate(findAprovado.data_inicio) : 'Em análise';
};

const isNF = (anexos) => anexos.find((anexo) => anexo.tipo_anexo_id === 3);

const isDOC = (anexos) => anexos.find((anexo) => anexo.tipo_anexo_id === 4);

const nameFiles = (anexos) => anexos.map((anexo) => `${anexo.nome}  -  `)

const documentByType = (tipo, documento) => tipo === 'juridico' ? maskCnpj(documento) : maskCpf(documento);

const isNotStatusAllowed = (status) => status !== 'Recusado' && status !== 'Cancelado';

const uploadFile = (item, id) => {
	pagamento.value = item;
	tipo_anexo_id.value = id;
	enableModal.upload = true;
};

const cancelPayment = async (ids) => {

	if (!justificativa.value) return $toast.error('Informe a justificativa');

	loading.value = true;

	try {

		const { success, message  } = await postStatus({ id: ids, status: 7, justificativa: justificativa.value });
		if(!success) throw new Error(message);

		loading.value = false;
		enableModal.cancel = false;
		$toast.success('Pagamento cancelado com sucesso');
		await pushData();

	} catch (error) {
		console.log(error.message)
		$toast.error(error.message);
	}
	justificativa.value = null;

};

const pushData = async () => {
	loadingTable.value = true;

	try {
		const { success, message, data } = await getPagamentoByScope('usuario');

		if (!success) throw new Error(message);
		
		data.map((item) => {
			item.status = item.movimentacoes_pagamento[0].status_pagamento.label;
			item.lote = item.movimentacoes_pagamento.at().lote;
		});

		pagamentos.value = data;
		loadingTable.value = false;

	} catch (error) {
		console.log(error.message)
		$toast.error(error.message);		
	}
	
};

onMounted( pushData );

</script>

<style scoped>
.custom-btn {
	position: absolute;
	top: 10px;
	right: 10px;
	padding: 10px;
}

</style>