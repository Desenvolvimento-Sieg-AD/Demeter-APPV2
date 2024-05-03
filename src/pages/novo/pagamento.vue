<template>
	<div>

		<CustomHeader title="Solicitação de Pagamento" />

		<LayoutForm class="mb-12">

			<v-form ref="formValidate">

				<v-card class="card-pagamento" flat>

					<CustomText title="Categoria" class="ml-2" color="#118B9F" size="18" :bold="true" />

					<v-row class="pa-3">

						<v-col cols="2" md="3">
							<CustomInput
								required
								hide-details
								itemValue="id"
								v-model="grupo"
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
								:disabled="!grupo"
								ref="categoriaRef"
								type="autocomplete"
								v-model="form.categoria_id"
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
				</v-card>

				<v-divider class="mt-2 mb-2" />

				<v-card class="pt-2 card-pagamento" flat>

					<CustomText title="Fornecedor" class="ml-2" color="#118B9F" size="18" :bold="true" />

					<v-row class="pa-3">

						<v-col cols="12" md="3">
							<CustomInput
								required
								type="text"
								hide-details
								:change="validDocument()"
								:label="documentFornecedor"
								v-model="form.fornecedor.documento"
								appen-innerColor="#118B9F"
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
								v-model="form.fornecedor.tipo"
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
								v-model="form.fornecedor.nome"
								append-inner-icon="mdi-shopping-outline"
							/>
						</v-col>

						<v-col cols="12" md="3">
							<CustomInput type="text" label="Número NF/Cupom" v-model="form.numero_nf" />
						</v-col>

						<v-col cols="12" md="9">
							<CustomInput type="text" label="Chave de Acesso" v-model="form.chave_nf" :maxLength="50" mask="number" />
						</v-col>

					</v-row>
				</v-card>
				<v-divider class="mt-2 mb-2" />

				<v-card class="pt-2 card-pagamento" flat>

					<CustomText title="Empresa" class="ml-2" color="#118B9F" size="18" :bold="true" />

					<v-row class="pa-3">

						<v-col cols="12" md="6">

							<CustomInput
								required
								type="select"
								hide-details
								itemValue="id"
								itemTitle="nome"
								:items="empresas"
								label="Empresa pagadora"
								v-model="form.empresa_id"
								append-inner-icon="mdi-domain"
							/>

						</v-col>

						<v-col cols="12" md="6">

							<CustomInput
								type="file"
								persistent-hint
								label="Documento"
								v-model="form.doc"
								:required="documentRequired"
								accept="image/*,application/pdf"
								hint="Ex: Boleto, Comprovante, Certidão"
								append-inner-icon="mdi-file-upload-outline"
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
								required
								hide-details
								label="Motivo"
								type="textarea"
								:no-resize="false"
								v-model="form.motivo"
								append-inner-icon="mdi-chat-question-outline"
							/>
						</v-col>

						<v-col cols="8">
							<CustomInput
								hide-details
								type="textarea"
								:no-resize="false"
								label="Observações"
								v-model="form.dados_complementares"
							/>
						</v-col>

						<v-col cols="12">
							<CustomInput
								v-if="user.setor.exibir_projetos"
								hide-details
								itemValue="id"
								label="Projetos"
								:required="true"
								:items="projetos"
								itemTitle="name"
								type="autocomplete"
								v-model="projeto_id"
								append-inner-icon="mdi-briefcase-plus-outline"
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
								:items="paymentsType"
								v-model="form.tipo_id"
								itemValue="id"
								itemTitle="nome"
								hide-details
								:change="validPaymentType()"
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

						<v-col cols="2">
							<CustomInput
								type="date"
								:required="true"
								label="Data de vencimento"
								v-model="form.data_vencimento"
								:messages="messagesDate()"
								:min="minDate"
								:rules="[dateRules]"
							/>
						</v-col>

						<v-col cols="2">
							<CustomInput type="text" mask="money" required label="Valor total" v-model="form.valor_total" hide-details />
						</v-col>

						<v-col cols="2">
							<CustomInput type="checkbox" label="Urgência" v-model="form.urgente" hide-details color="#118B9F" />
						</v-col>

					</v-row>

					<v-row class="pa-3 mt-n12" v-if="form.tipo_id !== 2">

						<v-col>
							<CustomInput
								:disabled="!tipos.descricao"
								type="text"
								:label="!tipos.descricao ? 'Descrição' : tipos.descricao"
								v-model="form.dados_bancarios.outhers"
								:mask="form.tipo_id === 1 ? maskDescriptionPIX : maskDescriptionOuthers"
								appen-innerColor="#118B9F"
								append-inner-icon="mdi-content-copy"
								@click:append-inner="pasteFromClipBoardDadosBancarios"
								:required="tipos.obrigatorio"
							/>
						</v-col>
					</v-row>

					<v-row class="pa-3 mt-n12" v-else>

						<v-col>
							<CustomInput type="text" mask="number" label="Banco" v-model="form.dados_bancarios.banco" required :maxLength="3"/>
						</v-col>

						<v-col>
							<CustomInput type="text" mask="number" label="Agência" v-model="form.dados_bancarios.agencia" required :maxLength="4" />
						</v-col>

						<v-col>
							<CustomInput type="text" mask="number" label="Conta" v-model="form.dados_bancarios.conta" required />
						</v-col>

						<v-col>
							<CustomInput type="text" mask="number" label="Dígito" v-model="form.dados_bancarios.digito" required :maxLength="1"/>
						</v-col>

					</v-row>

					<v-row v-if="form.urgente" class="pa-3 mt-n12">

						<v-col>
							<CustomInput type="textarea" :required="form.urgente" :rows="1" label="Justificativa da urgência" v-model="form.justificativa_urgente" />
						</v-col>

					</v-row>

				</v-card>

				<div class="pt-2 mt-6 mb-2 w-full d-flex justify-end align-center ga-2">
					<v-btn v-for="(action, index) of actionsForm" :key="`${action}-${index}`" :color="action.color" @click="action.onClick()">
						{{ action.title }}
						<v-icon size="small" :icon="action.icon"/>
					</v-btn>
				</div>

			</v-form>
		</LayoutForm>
	</div>
</template>

<script setup>

const dayjs = useDayjs();

const { $toast } = useNuxtApp();
import { getFileContent } from '@api/conversor';
import { getFornecedor, getEmpresa, getPagamentoTipo, getCategorias, getGrupos, postPagamento, getProjects, getTiposChavePix, existNFEqual, getOnePayment, updatePagamento } from '@api';

const router = useRouter()
const route = useRoute();

const form = ref(initFormState());
const tiposFornecedor = getTiposFornecedor();

const { fornecedores, empresas, grupos, categorias, fornecedorExistente, grupo, selectedCategories, projetos, projeto } = useInitRefs();

const formValidate = ref(null)

const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

const tipos = ref(null);
const loading = ref(false);
const chavesPix = ref([])
const projeto_id = ref(null);
const categoriaRef = ref(null);
const paymentsType = ref([]);
const tipoChavePix = ref(null)
const loadingProcessFile = ref(false);

const disabledKey = computed(() => {
	const chave = form.value.chave_nf?.toString() || '';
	return chave.length > 44;
});

const routeId = computed(() => route?.query?.id)

const documentRequired = computed(() => {
	const type = paymentsType.value.find((tipo) => tipos.value?.id === tipo.id)
	return type?.requer_documento
})

const maskDescriptionPIX = computed(() => {
	const tipo = chavesPix?.value.find((chave) => chave?.id === tipoChavePix.value)
	return tipo?.mask
})

const maskDescriptionOuthers = computed(() => {
	const tipo = paymentsType.value.find((tipo) => tipo.id === form.value.tipo_id)
	return tipo?.mask
})

const isExpired = computed(() => {
	return dayjs(form.value.data_vencimento).isBefore(dayjs().subtract(1, 'day'));
});

const minDate = computed(() => {
    if (form.value.tipo_id === 5 || form.value.tipo_id === 6) return dayjs().subtract(30, 'day').format('YYYY-MM-DD');
    return dayjs().format('YYYY-MM-DD');
});

const validDateToCard = computed(() => isExpired.value && (form.value.tipo_id !== 5 && form.value.tipo_id !== 6))

const defineFileTitle = (fileName) => {
	if (fileName.length > 20) {
		return fileName.replace(/.\w+$/g, '');
	}
	return fileName;
};

const messagesDate = () => {
	if (isExpired.value && (validDateToCard.value)) return 'Data de vencimento inválida';
	return '';
};

const actionsForm = [
	{
		title: 'Limpar',
		icon: 'mdi-trash-can-outline',
		color: 'red',
		onClick: () => reset(),
	},
	{
		title: routeId.value ? 'Atualizar' : 'Salvar',
		icon: 'mdi-currency-usd',
		color: 'green',
		onClick: () => {
			if(routeId.value) updatePayment(Number(routeId.value), form.value)
			else sendForm()
		},
	},
];

const dateRules = (v) => {
    if (form.value.tipo_id === 5 || form.value.tipo_id === 6) {
        return dayjs(v).isAfter(dayjs().subtract(30, 'day')) || 'Data inválida';
    }
    return true;
};

const verifyFornecedor = () => {

	fornecedorExistente.value = false;
	const existFornecedor = fornecedores.value.some((fornecedor) => fornecedor.razao_social === form.value.fornecedor.nome) 

	if (existFornecedor) {

		fornecedorExistente.value = true;

		const fornecedor = fornecedores.value.find((fornecedor) => fornecedor.razao_social === form.value.fornecedor.nome);

		form.value.fornecedor.id = fornecedor.id;
		form.value.fornecedor.tipo = fornecedor.tipo;
		form.value.fornecedor.apelido = fornecedor.nome_fantasia;

		form.value.fornecedor.documento = maskCnpj(fornecedor.documento);

		if (fornecedor.tipo === 'fisico') form.value.fornecedor.documento = maskCpf(fornecedor.documento);

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

const pasteFromClipBoardDadosBancarios = async () => {
	try {
		const text = await navigator.clipboard.readText();
		form.value.dados_bancarios.outhers = text;
	} catch (error) {
		console.error('Erro ao acessar a área de transferência:', error);
	}
};

const validPaymentType = () => {

	tipos.value = false;

	const type = paymentsType.value.find((type) => type.id === form.value.tipo_id);

	if (type) tipos.value = type;
};

const documentFornecedor = computed(() => {
	const tipo = form.value.fornecedor?.tipo;

	if (!tipo || tipo == 'juridico') return 'CNPJ';
	else if (tipo == 'fisico') return 'CPF';
	else return 'CNPJ';
})

const validGroup = async () => {
	if (grupo.value) {
		selectedCategories.value = categorias.value.filter((categoria) => categoria.grupo_id === grupo.value);
		if(route?.query?.id) return
		form.value.categoria_id = '';
	}
};

const validDocument = () => {
	if (!form.value.fornecedor.documento) {
		form.value.fornecedor.tipo = null;
		return;
	}
	const documento = form.value.fornecedor.documento.replace(/\D/g, '');
	const find = fornecedores.value.find((fornecedor) => fornecedor.documento === documento);

	form.value.fornecedor.nome = null;
	form.value.fornecedor.apelido = null;
	form.value.fornecedor.id = null;

	if (find) {
		form.value.fornecedor.id = find.id;
		form.value.fornecedor.nome = find.razao_social;
		form.value.fornecedor.apelido = find.nome_fantasia;
	} 

	if(validaCNPJ(form.value.fornecedor.documento)) form.value.fornecedor.tipo = 'juridico'
	else if (validaCPF(form.value.fornecedor.documento)) form.value.fornecedor.tipo = 'fisico'
	else form.value.fornecedor.tipo = null

};

function buildFormData() {

	const formData = new FormData();

	const {
		fornecedor,
		empresa_id,
		tipo_id,
		motivo,
		categoria_id,
		dados_complementares,
		valor_total,
		data_vencimento,
		nf,
		doc,
		numero_nf,
		chave_nf,
		urgente,
		dados_bancarios
	} = form.value;

	formData.append('motivo', motivo);
	formData.append('tipo_id', tipo_id);
	formData.append('urgente', urgente);
	formData.append('chave_nf', chave_nf);
	formData.append('numero_nf', numero_nf);
	formData.append('empresa_id', empresa_id);
	formData.append('projeto_id', projeto_id.value);
	formData.append('valor_total', valor_total);
	formData.append('categoria_id', categoria_id);
	formData.append('fornecedor_id', fornecedor.id);
	formData.append('tipo_chave_pix', tipoChavePix.value )
	formData.append('fornecedor_tipo', fornecedor.tipo);
	formData.append('dados_bancarios', JSON.stringify(dados_bancarios));
	formData.append('data_vencimento', data_vencimento);
	formData.append('fornecedor_nome', fornecedor.nome);
	formData.append('fornecedor_apelido', fornecedor.apelido);
	formData.append('fornecedor_documento', fornecedor.documento);
	formData.append('dados_complementares', dados_complementares);
	formData.append('justificativa_urgente', form.value.justificativa_urgente)

	if (nf && nf.length > 0) formData.append('nf', nf[0]);
	
	if (doc && doc.length > 0) {
		for (let i = 0; i < doc.length; i++) {
        	formData.append('doc', doc[i]);
    	}
	}

	return formData;
}

const sendForm = async () => {
	loading.value = true;
	try {

		const { valid } = await formValidate.value.validate()
		if(!valid) throw new Error('Preencha os campos obrigatórios')

		if (validDateToCard.value) {
			loading.value = false;
			return $toast.error('Data de vencimento inválida');
		}

		const formData = buildFormData();
		const { success, message } = await postPagamento(formData);

		if (!success) throw new Error(message);

		$toast.success(message);

		loading.value = false;
		await pushData();
		reset();

	} catch (error) {
		console.error(error.message);
		$toast.error(error.message);
	} 
};

const updatePayment = async (id, data) => {
	try {
		console.log(data.fornecedor_id)
		console.log(form.value.fornecedor.id)

		data.fornecedor_id = form.value.fornecedor.id
		data.dados_bancarios = JSON.stringify(data.dados_bancarios)

		const { success, message } = await updatePagamento(id, form.value)

		if(!success) throw new Error(message)

		$toast.success(message)
		setTimeout(() => router.push('/financeiro/aprovadas'), 750)

	} catch (error) {
		console.log('Erro ao atualizar pagamento', error.message)
		$toast.error('Erro ao atualizar pagamento')
	}
}

const pushData = async () => {
	try {
		const [fornecedor, grupo, categoria, empresa, pagamento, projeto] = await Promise.all([
			getFornecedor(),
			getGrupos(),
			getCategorias(),
			getEmpresa(),
			getPagamentoTipo(),
			getProjects(),
		]);;

		if (grupo.success) grupos.value = grupo.data;
		if (empresa.success) empresas.value = empresa.data;
		if (projeto.success) projetos.value = projeto.data;
		if (categoria.success) categorias.value = categoria.data;
		if (fornecedor.success) fornecedores.value = fornecedor.data;

		if (pagamento.success) {
			const pagamentos = pagamento.data;
			const priorizados = pagamentos.filter((p) => p.nome === 'PIX' || p.nome === 'Boleto');
			const restantes = pagamentos
				.filter((p) => p.nome !== 'PIX' && p.nome !== 'Boleto')
				.sort((a, b) => a.nome.localeCompare(b.nome));
			paymentsType.value = [...priorizados, ...restantes];
		}
		
	} catch (error) {
		console.error('Erro ao buscar dados:', error);
	}
};

const getPagamento = async (id) => {
    try {
        const { success, data } = await getOnePayment(id, 'geral');

        if (!success) throw new Error('Erro ao buscar pagamento');

        form.value = data;

        grupo.value = data.categoria.grupo.id;
        form.value.categoria_id = data.categoria_id;
        projeto_id.value = data.projeto_id;
        tipoChavePix.value = data.tipo_chave_pix_id;
        form.value.data_vencimento = dayjs(data.data_vencimento).format('YYYY-MM-DD');

        const dados_bancarios = JSON.parse(data.dados_bancarios);

        if (form.value.tipo_id === 1) {
            const chave_pix = dados_bancarios.chave_pix.replace(/[\D]/g, '');
            dados_bancarios.outhers = chave_pix;
        }

        if (form.value.tipo_id === 3) {
            dados_bancarios.banco = dados_bancarios.banco;
            dados_bancarios.agencia = dados_bancarios.agencia;
            dados_bancarios.conta = dados_bancarios.conta;
            dados_bancarios.digito = dados_bancarios.digito;
        }

        form.value.dados_bancarios = dados_bancarios;

		console.log('Dados do pagamento:', form.value);

    } catch (error) {
        console.error(error.message);
        $toast.error(error.message);
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

await getTiposChave()

await pushData();

function getTiposFornecedor() {
	return [
		{ nome: 'Pessoa Jurídica', value: 'juridico' },
		{ nome: 'Pessoa Física', value: 'fisico' },
	];
}

// * Função para processar o arquivo de NF

const processNfFile = async (file) => {
	loadingProcessFile.value = true;
	clearFornecedor();
	try {
		const { nf, cpf_emitente, chave_acesso, cnpj_emitente, allIsNull, valor_total } = await getFileContent(file);

		if (allIsNull) {
			loadingProcessFile.value = false;
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

		form.value.valor_total = parseFloat(valor_total);

		validDocument();

	} catch (error) {
		console.log(error.message);
		$toast.error(error.message);
	}

	loadingProcessFile.value = false;
};

// * Função para limpar o formulário

const reset = () => {
	form.value = initFormState();
    grupo.value = null;
	form.value.valor_total = 0
	form.value.doc = []
	tipoChavePix.value = null
	projeto_id.value = null
};

function initFormState() {
	return {
		fornecedor: { id: null, nome: null, apelido: null, documento: null, tipo: null },
		empresa_id: null,
		nf: [],
		doc: [],
		tipo_id: null,
		motivo: null,
		categoria_id: null,
		dados_complementares: null,
		valor_total: 0,
		data_vencimento: null,
		projeto: null,
		chave_nf: null,
		numero_nf: null,
		tipo_chave_pix: null,
		urgente: false,
		justificativa_urgente: null,
		dados_bancarios: {
			banco: null,
			agencia: null,
			conta: null,
			digito: null,
			outhers: null
		}
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
		selectedCategories: ref([]),
		projetos: ref([]),
		projeto: ref(null),
	};
}

const clearFornecedor = () => {
	form.value.fornecedor.tipo = null;
	form.value.fornecedor.nome = null;
	form.value.fornecedor.chave_nf = null;
	form.value.fornecedor.numero_nf = null;
	form.value.fornecedor.documento = null;
};

onMounted(async () => {
	if(routeId.value) {
		await pushData()
		await getPagamento(routeId.value)
	}
});

// * Watchers

// watch(() => selectedCategories.value, async () => {
// 	await categoriaRef.value.click();
// 	},{ immediate: true}
// );

watch(() => form.value.tipo_id, async (nv, oV) => {
	if(nv !== oV){
		if(route?.query?.id) return
		tipoChavePix.value = null
		form.value.descricao = null
	}
},{ immediate: true});

watch(() => form.value.nf, async (value) => {
	if (value && value.length > 0) {
		processNfFile(value[0]);
	}
}, { deep: true, immediate: false });

watch(() => grupo.value, (value) => {
	if (value) {
		validGroup();
	}
}, { deep: true, immediate: true });

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


.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
