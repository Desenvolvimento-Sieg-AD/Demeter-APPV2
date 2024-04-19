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
						{{
							item.fornecedor.tipo === 'juridico'
								? maskCnpj(item.fornecedor.documento)
								: maskCpf(item.fornecedor.documento)
						}}
					</div>
				</template>
				<template #item-anexo="{ data: { data: item } }">
					<div class="d-flex align-center justify-center text-center">
						<div v-if="existNF(item)">
							<v-icon
								@click="openFile(`${caminho}${item.anexos_pagamento[0].caminho}`)"
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
					<div class="template">
						<div v-if="existDoc(item)">
							<v-icon
								@click="openFile(`${caminho}${item.anexos_pagamento[1].caminho}`)"
								color="success"
								class="cursor-pointer"
							>
								mdi-paperclip</v-icon
							>
							<v-tooltip text="Abrir anexo" activator="parent" location="top" />
						</div>
						<div v-else>
							<v-tooltip text="Anexo indisponivel" activator="parent" location="top" /><v-icon disabled
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
							v-for="(set, index) in item.usuario.setores"
							:key="index"
							:class="index < item.usuario.setores.length - 1 ? 'mr-1' : ''"
						>
							<v-tooltip :text="set.nome" activator="parent" location="top" />
							{{ set.sigla }}{{ index < item.usuario.setores.length - 1 ? ', ' : '' }}
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
const acess = useRuntimeConfig();
const caminho = acess.public.PAGAMENTO_PATH;
const colums = getColumns('historico');
const enableModal = ref(false);

const itens = ref([]);
const itemView = ref({});

const openFile = async (filePath) => {
	const { success, message } = await useOs().openFile(filePath);
	if (!success) $toast.error(message);
};

const actions = computed(() => [
	{
		icon: 'mdi-eye',
		tooltip: 'Ver detalhes',
		click: (ref) => ((itemView.value = ref), (enableModal.value = true)),
		active: true,
		type: 'padrao',
		name: 'ver',
	},
]);

const pushData = async () => {
	const { success, data } = await getPagamento();
	if (success) {
		data.map((item) => {
			item.status = item.movimentacoes_pagamento.at().status_pagamento.nome;
			item.setor = item.usuario.setores[0].sigla;
			item.lote = item.movimentacoes_pagamento.at().lote;
		});
		itens.value = data;
	}
};

onMounted(async () => {
	await pushData();
});

const existDoc = (doc) => {
	return doc.anexos_pagamento.some((anexo) => anexo.tipo_anexo_id === 4);
};

const existNF = (nf) => {
	return nf.anexos_pagamento.some((anexo) => anexo.tipo_anexo_id === 3);
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
