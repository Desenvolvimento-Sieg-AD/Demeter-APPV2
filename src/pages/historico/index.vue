<template>
	<div>
		<CustomHeader title="Histórico de Solicitações" />
		<LayoutForm>
			<CustomTableSelect
				:columns="colums"
				:items="itens"
				:actions="actions"
				:loading="false"
				scrolling="standard"
				allow-search
				:noDataText="'Não há registros de pagamentos'"
				allowColumnResizing
				choose-columns
				allow-column-reordering
				:allowed-page-sizes="[5, 10, 15, 25]"
				:page-size="15"
				pager
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
						<div v-if="existNF(item)">
							<v-icon
								@click="openFile(`${path}${item.anexos_pagamento[0].caminho}`)"
								color="success"
								class="cursor-pointer"
							>
								mdi-paperclip</v-icon
							>
							<v-tooltip text="Abrir anexo" activator="parent" location="top" />

						</div>

						<div v-else>
							<v-tooltip text="Sem anexo" activator="parent" location="top" /><v-icon disabled color="gray"
								>mdi-paperclip</v-icon
							>
						</div>

					</div>
				</template>
				
				<template #item-doc="{ data: { data: item } }">

					<div class="template">

						<div v-if="existDoc(item)">

							<v-icon color="success" class="cursor-pointer"
								@click="openFile(`${path}${item.anexos_pagamento[1].caminho}`)">
								mdi-paperclip</v-icon>
							<v-tooltip text="Abrir anexo" activator="parent" location="top" />

						</div>

						<div v-else>
							<v-icon disabled>mdi-paperclip</v-icon>
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

							{{defineNameSetor(set.sigla, item, index)}}

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

import { getPagamento } from '@api';

const access = useRuntimeConfig();
const path = access.public.PAGAMENTO_PATH;
const colums = getColumns('historico');
const enableModal = ref(false);

const itens = ref([]);
const itemView = ref({});

const openFile = (filePath) => {
	window.electronAPI.openFile(filePath).then((response) => {
		if (!response.success) {
			console.error('Erro ao abrir arquivo:', response.message);
		}
	});
};

const actions = computed(() => [
	{
		icon: 'mdi-eye',
		tooltip: 'Ver detalhes',
		click: (item) => {
			itemView.value = item;
			enableModal.value = true;
		},
		active: true,
		type: 'padrao',
		name: 'ver',
	},
]);

const smallerIndex = (index, item) => index < item.length - 1;

const existNF = (nf) => nf.anexos_pagamento.some((anexo) => anexo.tipo_anexo_id === 3);

const existDoc = (doc) => doc.anexos_pagamento.some((anexo) => anexo.tipo_anexo_id === 4);

const classSetor = (item, index) => smallerIndex(index, item.usuario.setores) ? 'mr-2' : '';

const defineDocument = (tipo, documento) => tipo === 'juridico' ? maskCnpj(documento) : maskCpf(documento); 

const defineNameSetor = (sigla, item, index) => smallerIndex(index, item.usuario.setores) ? `${sigla}, ` : sigla;

const pushData = async () => {
	try {
		const { success, message, data } = await getPagamento()

		if(!success) throw new Error(message)

		data.map((item) => {
			item.status = item.movimentacoes_pagamento.at().status_pagamento.nome;
			item.setor = item.usuario.setores[0].sigla;
			item.lote = item.movimentacoes_pagamento.at().lote;
		});

		itens.value = data;

	} catch (error) {
		console.log(error.message)
		$toast.error(error.message)
	}

};

onMounted(async () => await pushData())

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
