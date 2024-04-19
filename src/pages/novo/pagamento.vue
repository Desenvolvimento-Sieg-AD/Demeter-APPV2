<template>
	<div>
		<CustomHeader title="Solicitação de Pagamento" />
		<LayoutForm class="mb-12">
			<v-form ref="formValidate">
				<v-card class="card-pagamento " flat>
					<CustomText title="Categoria" class="ml-2" color="#118B9F" size="18" :bold="true" />
					<v-row class="pa-3">
						<v-col cols="2" md="3">
							<CustomInput
								type="autocomplete"
								:required="true"
								label="Grupo do pedido"
								:items="grupos"
								v-model="grupo"
								itemValue="id"
								itemTitle="nome"
								hide-details
							/>
						</v-col>
						<v-col cols="4" md="3">
							<CustomInput
								:disabled="!grupo"
								ref="categoriaRef"
								type="autocomplete"
								required
								label="Categoria"
								:items="categoriasSelecionadas"
								v-model="form.categoria_id"
								itemValue="id"
								itemTitle="nome"
								hide-details
							/>
						</v-col>
						<v-col cols="12" md="6">
							<CustomInput
								append-inner-icon="mdi-file-upload-outline"
								type="file"
								label="Nota fiscal"
								v-model="form.nf"
								hide-details
								:loading="loadingImport"
								accept="image/*,application/pdf"
								:disabled="!form.categoria_id"
							>
								<template #selection="{ fileNames }">
									<span class="text-truncate">{{ defineFileTitle(fileNames[0]) }}</span>
								</template>
							</CustomInput>
						</v-col>
					</v-row>
				</v-card>
				<v-divider class="mt-2 mb-2" />
				<v-card class="pt-2 card-pagamento" flat>
					<CustomText title="Fornecedor" class="ml-2" color="#118B9F" size="18" :bold="true" />
					<v-row class="pa-3">
						<v-col cols="12" md="3">
							<CustomInput
								append-inner-icon="mdi-content-copy"
								@click:append-inner="pasteFromClipboard"
								type="text"
								:mask="form.fornecedor.tipo === 'fisico' ? 'cpf' : 'cnpj'"
								required
								:label="docFornecedor"
								v-model="form.fornecedor.documento"
								hide-details
								:change="verifyDocumento()"
							/>
						</v-col>
						<v-col cols="12" md="3">
							<CustomInput
								append-inner-icon="mdi-card-account-details-outline"
								:disabled="fornecedorExistente"
								type="select"
								:required="true"
								label="Tipo fornecedor"
								:items="tiposFornecedor"
								v-model="form.fornecedor.tipo"
								itemValue="value"
								itemTitle="nome"
								hide-details
							/>
						</v-col>
						<v-col cols="12" md="6">
							<CustomInput
								type="combobox"
								append-inner-icon="mdi-shopping-outline"
								:required="true"
								label="Fornecedor"
								:items="fornecedores"
								v-model="form.fornecedor.nome"
								itemValue="razao_social"
								itemTitle="razao_social"
								hideDetails
								:onchange="verifyFornecedor()"
							/>
						</v-col>
						<v-col cols="12" md="3">
							<CustomInput type="text" label="Número NF" v-model="form.numero_nf" />
						</v-col>
						<v-col cols="12" md="9">
							<CustomInput type="text" label="Chave de Acesso" v-model="form.chave_nf" :maxLength="50" />
						</v-col>
					</v-row>
				</v-card>
				<v-divider class="mt-2 mb-2" />
				<v-card class="pt-2 card-pagamento" flat>
					<CustomText title="Empresa" class="ml-2" color="#118B9F" size="18" :bold="true" />
					<v-row class="pa-3">
						<v-col cols="12" md="6">
							<CustomInput
								append-inner-icon="mdi-domain"
								type="select"
								required
								label="Empresa pagadora"
								:items="empresas"
								v-model="form.empresa_id"
								itemValue="id"
								itemTitle="nome"
								hide-details
							/>
						</v-col>
						<v-col cols="12" md="6">
							<CustomInput
								append-inner-icon="mdi-file-upload-outline"
								type="file"
								label="Documento"
								v-model="form.doc"
								:required="documentRequired"
								accept="image/*,application/pdf"
								hint="Ex: Boleto, Comprovante, Certidão"
								persistent-hint
							>
								<template #selection="{ fileNames }">
									<span class="text-truncate">
										{{ defineFileTitle(fileNames[0]) }}
									</span>
								</template>
							</CustomInput>
						</v-col>
					</v-row>
				</v-card>
				<v-divider class="mt-2 mb-2" />
				<v-card class="pt-2 card-pagamento" flat>
					<CustomText title="Observações" class="ml-2" color="#118B9F" size="18" :bold="true" />
					<v-row class="pa-2">
						<v-col cols="12" md="4">
							<CustomInput
								append-inner-icon="mdi-chat-question-outline"
								type="textarea"
								:required="true"
								:no-resize="false"
								label="Motivo"
								v-model="form.motivo"
								hide-details
							/>
						</v-col>
						<v-col cols="8">
							<CustomInput
								type="textarea"
								:no-resize="false"
								label="Observações"
								v-model="form.dados_complementares"
								hide-details
							/>
						</v-col>
						<v-col cols="12">
							<CustomInput
								v-if="user.setor.exibir_projetos"
								append-inner-icon="mdi-briefcase-plus-outline"
								type="autocomplete"
								:required="true"
								label="Projetos"
								:items="projetos"
								v-model="projeto_id"
								itemValue="id"
								itemTitle="name"
								hide-details
							/>
						</v-col>
					</v-row>
				</v-card>
				<v-divider class="mt-2 mb-2" />
				<v-card class="pt-2 card-pagamento" flat>
					<CustomText title="Pagamento" class="ml-2" color="#118B9F" size="18" :bold="true" />
					<v-row class="pa-3">
						<v-col>
							<CustomInput
								append-inner-icon="mdi-cash-clock"
								type="select"
								required
								label="Forma de pagamento"
								:items="pagamento_tipo"
								v-model="form.tipo_id"
								itemValue="id"
								itemTitle="nome"
								hide-details
								:change="verifyPaymenteType()"
							/>
						</v-col>
						<v-col v-if="form.tipo_id === 1">
							<CustomInput
								v-model="tipoChavePix"
								append-inner-icon="mdi-key"
								type="select"
								required
								:items="chavesPix"
								itemTitle="nome"
								itemValue="id"
								label="Tipo de Chave"
								/>
						</v-col>
						<v-col v-else>
							<div class="mt-5">
								<v-divider color="#118B9F"></v-divider>
							</div>
						</v-col>
						<v-col>
							<CustomInput
								type="date"
								:required="true"
								label="Data de vencimento"
								v-model="form.data_vencimento"
								:messages="isExpired ? 'Esse prazo já expirou' : ''"
								:min="minDate"
							/>
						</v-col>
						<v-col>
							<CustomInput
								type="text"
								mask="money"
								required
								label="Valor total"
								v-model="form.valor_total"
								hide-details
							/>
						</v-col>
		
					</v-row>
					<v-row class="pa-3 mt-n12">
						<v-col>
							<CustomInput
								:disabled="!tipos.descricao"
								type="text"
								:label="!tipos.descriTcao ? 'Descrição' : tipos.descricao"
								v-model="form.descricao"
								:mask="maskDescription"
								:required="tipos.obrigatorio"
							/>
						</v-col>
					</v-row>
				</v-card>
				<div class="pt-2 mt-6 mb-2 w-full d-flex justify-end align-center ga-2">
					<v-btn color="red" class="ml-2" @click="reset">
						Limpar
						<v-icon size="small" icon="mdi-trash-can-outline" class="ml-1" />
					</v-btn>
					<v-btn color="green" class="custom-btn approve-btn" @click="sendForm"
						>Solicitar <v-icon size="small" icon="mdi-currency-usd" class="ml-1" />
					</v-btn>
				</div>
			</v-form>
		</LayoutForm>
	</div>

</template>

<script setup>
// Importações e Configurações
const dayjs = useDayjs();
import { getFileContent } from '@api/conversor';

import {
	getFornecedor,
	getEmpresa,
	getPagamentoTipo,
	getCategorias,
	getGrupos,
	postPagamento,
	getProjects,
	getTiposChavePix,
	existNFEqual
} from '@api';
const { $toast } = useNuxtApp();

// Dados reativos e estado inicial
const registerAddress = ref(false);

const form = ref(initFormState());
const {
	fornecedores,
	empresas,
	grupos,
	categorias,
	fornecedorExistente,
	grupo,
	categoriasSelecionadas,
	projetos,
	projeto,
} = useInitRefs();

const formValidate = ref(null)

const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

const tiposFornecedor = getTiposFornecedor();

const categoriaRef = ref(null);

const tipos = ref(null);

const tipoChavePix = ref(null)
const chavesPix = ref([])

const importar = ref(false);

const loading = ref(false);

const loadingImport = ref(false);

const pagamento_tipo = ref([]);

const projeto_id = ref(null);

const modalConfirm = ref(null)

const disabledChave = computed(() => {
	const chave = form.value.chave_nf?.toString() || '';
	return chave.length > 44;
});

const defineFileTitle = (fileName) => {
	if (fileName.length > 20) {
		return fileName.replace(/.\w+$/g, '');
	}
	return fileName;
};

const isExpired = computed(() => {
	return dayjs(form.value.data_vencimento).isBefore(dayjs().subtract(1, 'day'));
});

const processNfFile = async (file) => {
	loadingImport.value = true;
	clearFornecedor();
	try {
		const { nf, cpf_emitente, chave_acesso, cnpj_emitente, cnpj_tomador, nome_emitente, allIsNull } =
			await getFileContent(file);

		if (allIsNull) {
			loadingImport.value = false;
			return $toast.error('Não foi possível ler o arquivo', { autoClose: 2500 });
		}

		if (cpf_emitente) {
			form.value.fornecedor.documento = cpf_emitente;
			form.value.fornecedor.tipo = 'fisico';
		}

		form.value.chave_nf = chave_acesso ?? null;
		form.value.numero_nf = nf ?? null;
		form.value.fornecedor.documento = cnpj_emitente ?? null;
		form.value.fornecedor.tipo = cnpj_emitente ? 'juridico' : null;

		verifyDocumento();
	} catch (error) {
		console.log(error.message);
		$toast.error(error.message);
	}

	loadingImport.value = false;
};

const clearFornecedor = () => {
	form.value.fornecedor.nome = null;
	form.value.fornecedor.chave_nf = null;
	form.value.fornecedor.numero_nf = null;
	form.value.fornecedor.documento = null;
	form.value.fornecedor.tipo = null;
};

watch(() => form.value.nf, async (value) => {
	if (value && value.length > 0) {
		processNfFile(value[0]);
	}
}, { deep: true, immediate: false });

watch(() => grupo.value, (value) => {
	if (value) {
		verifyGrupo();
	}
}, { deep: true, immediate: true });

const minDate = computed(() => {
    if (form.value.tipo_id === 5) return dayjs().subtract(30, 'day').format('YYYY-MM-DD');
    return dayjs().format('YYYY-MM-DD');
});

const verifyFornecedor = () => {
	if (fornecedores.value.some((obj) => obj.razao_social === form.value.fornecedor.nome)) {
		fornecedorExistente.value = true;
		const forn = fornecedores.value.find((obj) => obj.razao_social === form.value.fornecedor.nome);
		form.value.fornecedor.tipo = forn.tipo;
		form.value.fornecedor.apelido = forn.nome_fantasia;
		form.value.fornecedor.id = forn.id;
		if (forn.tipo === 'fisico') {
			form.value.fornecedor.documento = maskCpf(forn.documento);
		} else {
			form.value.fornecedor.documento = maskCnpj(forn.documento);
		}
	} else {
		fornecedorExistente.value = false;
	}
};

const pasteFromClipboard = async () => {
	try {
		const text = await navigator.clipboard.readText();
		form.value.fornecedor.documento = text;
	} catch (error) {
		console.error('Erro ao acessar a área de transferência:', error);
	}
};

const verifyPaymenteType = () => {
	if (pagamento_tipo.value.some((obj) => obj.id === form.value.tipo_id)) {
		tipos.value = pagamento_tipo.value.find((obj) => obj.id === form.value.tipo_id);
	} else {
		tipos.value = false;
	}
};

const documentRequired = computed(() => {
	const type = pagamento_tipo.value.find((tipo) => tipos.value?.id === tipo.id)
	return type?.requer_documento
})

const maskDescription = computed(() => {
	const tipo = chavesPix?.value.find((chave) => chave?.id === tipoChavePix.value)
	return tipo?.mask
})

const docFornecedor = computed(() => {
	const tipo = form.value.fornecedor?.tipo;

	if (!tipo || tipo == 'juridico') return 'CNPJ';
	else if (tipo == 'fisico') return 'CPF';
	else return 'CNPJ';
})

const verifyGrupo = async () => {
	if (grupo.value) {
		categoriasSelecionadas.value = categorias.value.filter((obj) => obj.grupo_id === grupo.value);
		form.value.categoria_id = '';

	}
};

const verifyDocumento = () => {
	if (!form.value.fornecedor.documento) {
		form.value.fornecedor.tipo = null;
		return;
	}
	const doc = form.value.fornecedor.documento.replace(/\D/g, '');

	const search = fornecedores.value.find((obj) => obj.documento === doc);
	if (search) {
		form.value.fornecedor.nome = search.razao_social;
		form.value.fornecedor.apelido = search.nome_fantasia;
		form.value.fornecedor.id = search.id;
	} else {
		form.value.fornecedor.nome = null;
		form.value.fornecedor.apelido = null;
		form.value.fornecedor.id = null;
	}

	if(validaCNPJ(form.value.fornecedor.documento)){
		form.value.fornecedor.tipo = 'juridico'
	} else if(validaCPF(form.value.fornecedor.documento)){
		form.value.fornecedor.tipo = 'fisico'
	} else {
		form.value.fornecedor.tipo = null
	}

};

const sendForm = async () => {
	loading.value = true;

	try {

		const { valid } = await formValidate.value.validate()
		if(!valid) throw new Error('Preencha os campos obrigatórios')

		if (isExpired.value) {
			$toast.error('Data de vencimento inválida');
			loading.value = false;
			return;
		}

		const formData = buildFormData();
		const { success, message } = await postPagamento(formData);

		if (!success) throw new Error(message);

		$toast.success(message);
		reset();
		await pushData();
	} catch (error) {
		console.error(error.message);
		$toast.error(error.message);
	}
	loading.value = false;
};

async function validateForm() {
	const { valid } = await layoutFormRef.value.validateForm();
	if (!valid) {
		return false;
	}

	const {
		fornecedor: { tipo, documento },
	} = form.value;

	if (tipo === 'fisico' && !validaCPF(documento)) {
		$toast.error('CPF inválido.');
		return false;
	}
	if (tipo === 'juridico' && !validaCNPJ(documento)) {
		$toast.error('CNPJ inválido.');
		return false;
	}
	return true;
}

 function buildFormData() {
	const formData = new FormData();
	const {
		fornecedor,
		empresa_id,
		tipo_id,
		descricao,
		motivo,
		categoria_id,
		dados_complementares,
		valor_total,
		data_vencimento,
		nf,
		doc,
		projeto,
		numero_nf,
		chave_nf,
	} = form.value;

	formData.append('fornecedor_id', fornecedor.id);
	formData.append('fornecedor_nome', fornecedor.nome);
	formData.append('fornecedor_apelido', fornecedor.apelido);
	formData.append('fornecedor_documento', fornecedor.documento);
	formData.append('fornecedor_tipo', fornecedor.tipo);
	formData.append('empresa_id', empresa_id);
	formData.append('tipo_id', tipo_id);
	formData.append('descricao', descricao);
	formData.append('motivo', motivo);
	formData.append('categoria_id', categoria_id);
	formData.append('dados_complementares', dados_complementares);
	formData.append('valor_total', valor_total);
	formData.append('data_vencimento', data_vencimento);
	formData.append('projeto_id', projeto_id.value);
	formData.append('numero_nf', numero_nf);
	formData.append('chave_nf', chave_nf);
	formData.append('tipo_chave_pix', tipoChavePix.value )

	if (nf && nf.length > 0) {
		formData.append('nf', nf[0]);
	}
	if (doc && doc.length > 0) {
		for (let i = 0; i < doc.length; i++) {
        	formData.append('doc', doc[i]);
    	}
	}

	return formData;
}

const pushData = async () => {
	try {
		const resultados = await Promise.all([
			getFornecedor(),
			getGrupos(),
			getCategorias(),
			getEmpresa(),
			getPagamentoTipo(),
			getProjects(),
		]);

		const [fornecedor, grupo, categoria, empresa, pagamento, projeto] = resultados;

		if (fornecedor.success) fornecedores.value = fornecedor.data;
		if (grupo.success) grupos.value = grupo.data;
		if (categoria.success) categorias.value = categoria.data;
		if (empresa.success) empresas.value = empresa.data;
		if (projeto.success) projetos.value = projeto.data;
		if (pagamento.success) {
			const pagamentos = pagamento.data;
			const priorizados = pagamentos.filter((p) => p.nome === 'PIX' || p.nome === 'Boleto');
			const restantes = pagamentos
				.filter((p) => p.nome !== 'PIX' && p.nome !== 'Boleto')
				.sort((a, b) => a.nome.localeCompare(b.nome));
			pagamento_tipo.value = [...priorizados, ...restantes];
		}
	} catch (error) {
		console.error('Erro ao buscar dados:', error);
	}
};

const getTiposChave = async () => {
	try {
		const { success, message, data } = await getTiposChavePix()

		if(!success) throw new Error(message)

		chavesPix.value = data

	} catch (error) {
		console.log(error.message)
		$toast.error(error.message)
	}
}

function getTiposFornecedor() {
	return [
		{ nome: 'Pessoa Jurídica', value: 'juridico' },
		{ nome: 'Pessoa Física', value: 'fisico' },
	];
}


await getTiposChave()

await pushData();

watch(() => categoriasSelecionadas.value, async () => {
	await categoriaRef.value.click();
	},{ immediate: true}
);

const reset = () => {
	form.value = initFormState();
    grupo.value = null;
	form.value.valor_total = 0
	form.value.doc = []
	tipoChavePix.value = null
};

function initFormState() {
	return {
		fornecedor: { id: null, nome: null, apelido: null, documento: null, tipo: null },
		empresa_id: null,
		nf: [],
		doc: [],
		tipo_id: null,
		descricao: null,
		motivo: null,
		categoria_id: null,
		dados_complementares: null,
		valor_total: 0,
		data_vencimento: null,
		projeto: null,
		chave_nf: null,
		numero_nf: null,
		tipo_chave_pix: null,
	};
}

function useInitRefs() {
	return {
		fornecedores: ref([]),
		empresas: ref([]),
		grupos: ref([]),
		categorias: ref([]),
		pagamentoTipo: ref([]),
		fornecedorExistente: ref(false),
		grupo: ref(null),
		categoriasSelecionadas: ref([]),
		projetos: ref([]),
		projeto: ref(null),
	};
}
</script>

<style scoped>
.card-pagamento {
	background-color: white;
	border-radius: 6px;
}
.w-full {
	width: 100%;
	max-width: 100%;
	flex-wrap: wrap;
}
.ajust {
	max-width: 1400px !important;
}
</style>
