<template>

    <v-row class="pa-3">

		<v-col cols="2" md="3">
			<CustomInput
				required
				hide-details
				itemValue="id"
				v-model="formValue.grupo_id"
				:items="grupos"
				itemTitle="nome"
				type="autocomplete"
				label="Grupo do pedido"
			/>
		</v-col>

		<v-col cols="4" md="3">
			<CustomInput
				required
				hide-details
				itemValue="id"
				itemTitle="nome"
				label="Categoria"
				:disabled="!formValue.grupo_id"
				ref="categoriaRef"
				type="autocomplete"
				v-model="formValue.categoria_id"
				:items="selectedCategories"
			/>
		</v-col>

		<v-col cols="12" md="6">
			<CustomInput
				type="file"
				hide-details
				v-model="form.nf"
				:loading="loadingProcessFile"
				:disabled="!form.categoria_id"
				label="Nota fiscal/Cupom fiscal"
				accept="image/*,application/pdf"
				append-inner-icon="mdi-file-upload-outline"
			>
				<template #selection="{ fileNames }">
					<span class="text-truncate">{{ defineFileTitle(fileNames[0]) }}</span>
				</template>
	        </CustomInput>
		</v-col>

	</v-row>

</template>
<script setup>

import { getFileContent } from '@api/conversor';
import { getGrupos, getCategorias, getFornecedor, getCategoriasByGrupo } from "@api"

const { $toast } = useNuxtApp();
const { data: fornecedores } = await getFornecedor();

const [ { grupos }, { data: categorias } ] = await Promise.all([getGrupos(), getCategorias()]);

const emit = defineEmits(['update:form'])

const props = defineProps({ form: { type: Object, required: true } })

const categoriaRef = ref(null);
const selectedCategories = ref([]);
const loadingProcessFile = ref(false);

const formValue = computed({
    get: () => props.form,
    set: (value) => emit('update:form', value)
})

const validGroup = async () => {
	if (formValue.value.grupo_id){ 
		try {
			const { success, message, data } = await getCategoriasByGrupo(formValue.value.grupo_id);
			if(!success) throw new Error(message)

			selectedCategories.value = data;
		} catch (error) {
			console.error('Erro ao buscar categorias por grupo:', error.message);
			$toast.error(error.message);
		}
	}
};

watch(() => formValue.value.grupo_id, async (newValue, oldValue) => {
	validGroup();	
	if(oldValue && newValue !== oldValue) {
		formValue.value.categoria_id = null;
		await categoriaRef?.value?.click();
	}
}, { immediate: true });

function setFornecedorDocumentData(cpf_emitente, cnpj_emitente) {
    if (cpf_emitente) {
        formValue.value.fornecedor.documento = cpf_emitente;
        formValue.value.fornecedor.tipo = 'fisico';
    } else if (cnpj_emitente) {
        formValue.value.fornecedor.documento = cnpj_emitente;
        formValue.value.fornecedor.tipo = 'juridico';
    } else {
        formValue.value.fornecedor.documento = null;
        formValue.value.fornecedor.tipo = null;
    }
}

const processNfFile = async (file) => {
    loadingProcessFile.value = true;
    clearFornecedor();
    try {
        const { nf, cpf_emitente, chave_acesso, cnpj_emitente, allIsNull, valor_total } = await getFileContent(file);

        if (allIsNull)  return $toast.error('Não foi possível ler o arquivo', { autoClose: 2500 });

		setFornecedorDocumentData(cpf_emitente, cnpj_emitente);

        formValue.value.chave_nf = chave_acesso ?? null;
        formValue.value.numero_nf = nf ?? null;
        formValue.value.valor_total = parseFloat(valor_total);

        validDocument();

    } catch (error) {
        console.error('Erro ao processar arquivo NF:', error.message);
        $toast.error(error.message);
    } finally {
        loadingProcessFile.value = false;
    }
};

const determineDocumentType = (documento) => {
    if (validaCNPJ(documento)) return 'juridico';
    if (validaCPF(documento)) return 'fisico';
    return null;
};

const findFornecedorByDocumento = (documento) => {
    return fornecedores.find(fornecedor => fornecedor.documento === documento);
};

const clearFornecedorFields = () => {
    formValue.value.fornecedor.id = null;
    formValue.value.fornecedor.nome = null;
    formValue.value.fornecedor.apelido = null;
};

const validDocument = () => {
    if (!formValue.value.fornecedor.documento) {
        formValue.value.fornecedor.tipo = null;
        return;
    }

    const documento = formValue.value.fornecedor.documento.replace(/\D/g, '');
    const find = findFornecedorByDocumento(documento);

    clearFornecedorFields();

    if (find) {
        formValue.value.fornecedor.id = find.id;
        formValue.value.fornecedor.nome = find.razao_social;
        formValue.value.fornecedor.apelido = find.nome_fantasia;
    }

    formValue.value.fornecedor.tipo = determineDocumentType(documento);
};

const clearFornecedor = () => {
	formValue.value.fornecedor.tipo = null;
	formValue.value.fornecedor.nome = null;
	formValue.value.fornecedor.chave_nf = null;
	formValue.value.fornecedor.numero_nf = null;
	formValue.value.fornecedor.documento = null;
};

const defineFileTitle = (fileName) => {
	if (fileName.length > 20) return fileName.replace(/.\w+$/g, '');
	return fileName;
};

watch(() => formValue.value.nf, async (value) => {
	if (value && value.length > 0) processNfFile(value[0]);
}, { deep: true, immediate: false });

</script>
