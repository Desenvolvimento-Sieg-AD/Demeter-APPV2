<template>

    <v-row class="pa-3">

		<v-col cols="12" md="3">
			<CustomInput
				required
				type="text"
				hide-details
				:change="validDocument()"
				:label="documentFornecedor"
				v-model="formValue.fornecedor.documento"
				append-inner-icon="mdi-content-copy"
				@click:append-inner="pasteFromClipboard"
				:mask="form.fornecedor.tipo === 'fisico' ? 'cpf' : 'cnpj'"
			/>
		</v-col>

		<v-col cols="12" md="3">
			<CustomInput
				required
				hide-details
				type="select"
				itemTitle="nome"
				itemValue="value"
				label="Tipo fornecedor"
				:items="tiposFornecedor"
				v-model="formValue.fornecedor.tipo"
				:disabled="fornecedorExistente"
				append-inner-icon="mdi-card-account-details-outline"
			/>
		</v-col>

		<v-col cols="12" md="6">
			<CustomInput
				required
				hideDetails
				type="combobox"
				label="Fornecedor"
				:items="fornecedores"
				itemValue="razao_social"
				itemTitle="razao_social"
				:onchange="verifyFornecedor()"
				v-model="formValue.fornecedor.nome"
				append-inner-icon="mdi-shopping-outline"
			/>
		</v-col>

		<v-col cols="12" md="3">
			<CustomInput
				type="text"
				label="Número NF/Cupom"
				v-model="form.numero_nf"
				mask="numero-nf"
			/>
		</v-col>

		<v-col cols="12" md="9">
			<CustomInput
				type="text"
				label="Chave de Acesso"
				v-model="form.chave_nf"
				:max="48"
				mask="number"
			/>
		</v-col>

	</v-row>

</template>
<script setup>

import { getFornecedor } from "@api"

const { data: fornecedores } = await getFornecedor();

const props = defineProps({
    form: { type: Object, required: true },
})

const formValue = computed({
    get: () => props.form,
    set: (value) => emit('update:form', value)
})

const fornecedorExistente = ref(false);

const validDocument = () => {
	if (!formValue.value.fornecedor.documento) return formValue.value.fornecedor.tipo = null;

	const documento = formValue.value.fornecedor.documento.replace(/\D/g, '');
	const fornecedor = fornecedores.find((fornecedor) => fornecedor.documento === documento);

	if (fornecedor) getDataFornecedor(fornecedor);

	if(validaCNPJ(formValue.value.fornecedor.documento)) formValue.value.fornecedor.tipo = 'juridico'

	else if (validaCPF(formValue.value.fornecedor.documento)) formValue.value.fornecedor.tipo = 'fisico'

	else formValue.value.fornecedor.tipo = null

};

const verifyFornecedor = () => {

	fornecedorExistente.value = false;
	const existFornecedor = fornecedores.some((fornecedor) => fornecedor.razao_social === formValue.value.fornecedor.nome) 

	if (existFornecedor) {
		fornecedorExistente.value = true;

		const fornecedor = fornecedores.find((fornecedor) => fornecedor.razao_social === formValue.value.fornecedor.nome);

		getDataFornecedor(fornecedor);
	} 
};

const getDataFornecedor = (fornecedor) => {
	formValue.value.fornecedor.id = fornecedor.id;
	formValue.value.fornecedor.nome = fornecedor.razao_social;
	formValue.value.fornecedor.apelido = fornecedor.nome_fantasia;
	formValue.value.fornecedor.tipo = fornecedor.tipo;

	if (fornecedor.tipo === 'fisico') formValue.value.fornecedor.documento = maskCpf(fornecedor.documento);
	else formValue.value.fornecedor.documento = maskCnpj(fornecedor.documento);
};

const documentFornecedor = computed(() => {
	const tipo = formValue.value.fornecedor?.tipo;

	if (!tipo || tipo == 'juridico') return 'CNPJ';
	else if (tipo == 'fisico') return 'CPF';
	else return 'CNPJ';
})

function getTiposFornecedor () {
	return [
		{ nome: 'Pessoa Jurídica', value: 'juridico' },
		{ nome: 'Pessoa Física', value: 'fisico' },
	];
}

const tiposFornecedor = getTiposFornecedor();

const pasteFromClipboard = async () => {
	try {
		const text = await navigator.clipboard.readText();
		formValue.fornecedor.documento = text;
	} catch (error) {
		console.error('Erro ao acessar a área de transferência:', error);
	}
};

</script>
