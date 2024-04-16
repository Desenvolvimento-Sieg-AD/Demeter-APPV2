<template>
	<Modal v-model:enable="enableValue" :actions="actions" title="Detalhes do Pagamento" width="auto">
		<template #content>
			<LayoutLoading v-if="loading" />

			<v-row v-else-if="pagamento">
				<v-col cols="9">
					<v-row align="center">
						<v-col cols="12" class="pb-0">
							<h3 style="color: #118b9f">Dados do Pagamento</h3>
						</v-col>

						<v-col cols="6">
							<CustomInput disabled label="Solicitante" hide-details v-model="pagamento.usuario.nome" />
						</v-col>

						<v-col cols="2">
							<CustomInput disabled label="Setor" hide-details v-model="pagamento.usuario.setores[0].sigla" />
						</v-col>

						<v-col cols="4">
							<CustomInput
								disabled
								label="Data Solicitação"
								hide-details
								v-model="dataSolitacao"
								:value="dataSolitacao"
							/>
						</v-col>

						<v-divider class="mx-3" />

						<v-col cols="6">
							<CustomInput disabled label="Grupo" hide-details v-model="pagamento.categoria.grupo.nome" />
						</v-col>

						<v-col cols="6">
							<CustomInput disabled label="Categoria" hide-details v-model="pagamento.categoria.nome" />
						</v-col>

						<v-col cols="8">
							<CustomInput disabled label="Fornecedor" hide-details v-model="pagamento.fornecedor.razao_social" />
						</v-col>

						<v-col cols="4">
							<CustomInput
								disabled
								label="Documento"
								hide-details
								v-model="documentoFormatado"
								:value="documentoFormatado"
							/>
						</v-col>

						<v-col cols="4">
							<CustomInput disabled label="Empresa Pagadora" hide-details v-model="pagamento.empresa.apelido" />
						</v-col>

						<v-col cols="3">
							<CustomInput disabled label="Forma de Pagamento" hide-details v-model="pagamento.tipo_pagamento.nome" />
						</v-col>

						<v-col cols="5">
							<CustomInput disabled label="Dados do Pagamento" hide-details v-model="pagamento.descricao" />
						</v-col>

						<v-divider class="mx-3" />

						<v-col cols="12">
							<CustomInput
								type="textarea"
								disabled
								label="Motivo do Pagamento"
								hide-details
								:rows="2"
								v-model="pagamento.motivo"
							/>
						</v-col>

						<v-col cols="12">
							<CustomInput
								type="textarea"
								disabled
								label="Observações"
								hide-details
								:rows="1"
								v-model="pagamento.dados_complementares"
							/>
						</v-col>

						<v-divider class="mx-3" />

						<v-col cols="4">
							<CustomInput disabled label="Valor total" hide-details mask="money" v-model="pagamento.valor_total" />
						</v-col>

						<v-col cols="4">
							<CustomInput disabled label="Vencimento" hide-details v-model="dataVencimento" :value="dataVencimento" />
						</v-col>

						<v-col cols="2">
							<v-chip
								:color="ultimaMovimentacao.status_pagamento.color"
								:text="ultimaMovimentacao.status_pagamento.nome"
								hide-details
							/>
						</v-col>
					</v-row>
				</v-col>

				<v-divider vertical class="my-4" />

				<v-col cols="3">
					<v-row align="center">
						<v-col cols="12" class="pb-0">
							<h3 style="color: #118b9f">Arquivos</h3>
						</v-col>

						<v-col cols="12" style="max-height: 480px; overflow-y: auto">
							<div v-for="anexo in pagamento.anexos_pagamento" :key="anexo.id">
								<v-card flat color="#F7F5F5" class="mb-1" @click="openFile(anexo.caminho)">
									<v-card-title align="center">
										<v-icon color="grey" class="cursor-pointer" size="70">mdi-file</v-icon>
									</v-card-title>

									<v-card-text align="center">
										{{ anexo.nome }}
										<v-btn icon @click.prevent="copyFilePath(anexo)" flat color="transparent">
											<v-icon color="#118B9F" class="cursor-pointer" icon="mdi-content-copy" />
											<v-tooltip text="Copiar local do arquivo" activator="parent" location="bottom" />
										</v-btn>
									</v-card-text>
								</v-card>
							</div>
						</v-col>
					</v-row>
				</v-col>
			</v-row>
		</template>
	</Modal>
</template>

<script setup>
//* IMPORTS

import { getPagamentoById } from '@api/pagamento';
const { $toast } = useNuxtApp();
const dayjs = useDayjs();
const acess = useRuntimeConfig();

//* PROPS

const props = defineProps({
	enable: { type: Boolean, default: false },
	id: { type: Number, required: true },
});

//* EMITS

const emit = defineEmits(['update:enable']);

//* DATA

const caminho = acess.public.PAGAMENTO_PATH;
const pagamento = ref(null);
const loading = ref(false);

//* COMPUTED

const enableValue = computed({
	get: () => props.enable,
	set: (value) => emit('update:enable', value),
});

const ultimaMovimentacao = computed(() => {
	if (!pagamento.value) return null;
	return pagamento.value.movimentacoes_pagamento.find((mov) => !mov.data_fim);
});

const dataSolitacao = computed(() => {
	if (!pagamento.value) return null;
	return dayjs(pagamento.value.created_at).format('DD/MM/YYYY HH:mm');
});

const dataVencimento = computed(() => {
	if (!pagamento.value) return null;
	return dayjs(pagamento.value.data_vencimento).format('DD/MM/YYYY');
});

const documentoFormatado = computed(() => {
	if (!pagamento.value) return null;
	if (pagamento.value.fornecedor.tipo === 'juridico') return maskCnpj(pagamento.value.fornecedor.documento);
	return maskCpf(pagamento.value.fornecedor.documento);
});

const actions = computed(() => [
	{
		icon: 'mdi-close',
		title: 'Fechar',
		type: 'red',
		click: () => (enableValue.value = false),
	},
]);

//* METHODS

const getPagamento = async () => {
	try {
		if (!props.id) throw new Error('ID não informado');
		loading.value = true;

		const { data } = await getPagamentoById(props.id);
		pagamento.value = data;

		loading.value = false;
	} 
	catch (error) {
		$toast.error(error.message);
	}
};

const openFile = async (path) => {
	try {
		await useOs().openFile(`${caminho}/${path}`);
	} 
	catch (error) {
		console.error('Erro ao abrir arquivo:', error.message);
		$toast.error('Não foi possível abrir o arquivo');
	}
};

const copyFilePath = async (anexo) => {
	try {
		await useOs().copyFilePath(`${caminho}/${anexo.caminho}`);
		$toast.success('Caminho do arquivo copiado');
	} 
	catch (error) {
		console.error('Erro ao copiar caminho do arquivo:', error.message);
		$toast.error('Não foi possível copiar o caminho do arquivo');
	}
};

//* WATCHERS

watch(
	() => props.enable,
	(value) => {
		if (value) getPagamento();
	}
);
</script>