<template>
	<div >

		<CustomHeader title="Solicitação de Pagamento">
			<v-btn icon variant="plain" color="primary">
				<v-icon>mdi-arrow-left</v-icon>
			</v-btn>
		</CustomHeader>

		<LayoutForm class="mb-12">

			<v-form ref="formValidate">

				<v-card class="card-pagamento" flat>

					<CustomText title="Categoria" class="ml-2" color="#118B9F" size="18" :bold="true" />

					<ModalPagamentoCategoria v-model:form="form" />

				</v-card>

				<v-divider class="mt-2 mb-2" />

				<v-card class="pt-2 card-pagamento" flat>

					<CustomText title="Fornecedor" class="ml-2" color="#118B9F" size="18" :bold="true" />

					<ModalPagamentoFornecedor v-model:form="form"  />

				</v-card>
				<v-divider class="mt-2 mb-2" />

				<v-card class="pt-2 card-pagamento" flat>

					<CustomText title="Empresa" class="ml-2" color="#118B9F" size="18" :bold="true" />

					<ModalPagamentoEmpresa v-model:form="form" :documentRequired="documentRequired" />

				</v-card>

				<v-divider class="mt-2 mb-2" />

				<v-card class="pt-2 card-pagamento" flat>

					<CustomText title="Observações" class="ml-2" color="#118B9F" size="18" :bold="true" />

					<ModalPagamentoObservacoes v-model:form="form" :user="user" />

				</v-card>

				<v-divider class="mt-2 mb-2" />

				<v-card class="pt-2 card-pagamento" flat>

					<CustomText title="Pagamento" class="ml-2" color="#118B9F" size="18" :bold="true" />

					<ModalPagamentoDadosBancarios v-model:form="form" :paymentsType="paymentsType" />

				</v-card>

				<div class="pt-2 mt-6 mb-2 w-full d-flex justify-end align-center ga-2">
					<v-btn v-for="(action, index) of actionsForm" :key="`${action}-${index}`" :color="action.color" @click="action.onClick()" >
						{{ action.title }}
						<v-icon size="small" :icon="action.icon"/>
					</v-btn>
				</div>



			</v-form>
		</LayoutForm>
		<v-btn class="btn-flutter" variant="plain" icon color="primary" v-if="routeId" @click="router.push('/financeiro/aprovadas')">
			<v-icon>mdi-arrow-left</v-icon>
			<v-tooltip text="Voltar" activator="parent" location="right"></v-tooltip>
		</v-btn>

	</div>
</template>

<script setup>

// * IMPORTS

import { getPagamentoTipo, postPagamento, getOnePayment, updatePagamento } from '@api';

const { $toast } = useNuxtApp();

const dayjs = useDayjs();
const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

const route = useRoute();
const router = useRouter()
const form = ref(initFormState());

const access = useRuntimeConfig();
const path = access.public.PAGAMENTO_PATH;

//* DATA

const loading = ref(false);
const paymentsType = ref([]);
const formValidate = ref(null)

// * COMPUTEDS

const routeId = computed(() => route?.query?.id)

const documentRequired = computed(() => {
	const type = paymentsType.value.find((tipo) => form.value.tipo_id === tipo.id)
	return type?.requer_documento
})

const isExpired = computed(() => dayjs(form.value.data_vencimento).isBefore(dayjs().subtract(1, 'day')));

const validDateToCard = computed(() => isExpired.value && (form.value.tipo_id !== 5 && form.value.tipo_id !== 6))

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

// * METHODS

function buildFormData() {

	const formData = new FormData();

	formData.append('motivo', form.value.motivo);
	formData.append('tipo_id', form.value.tipo_id);
	formData.append('urgente', form.value.urgente);
	formData.append('chave_nf', form.value.chave_nf);
	formData.append('numero_nf', form.value.numero_nf);
	formData.append('empresa_id', form.value.empresa_id);
	formData.append('projeto_id', form.value.projeto_id);
	formData.append('valor_total', form.value.valor_total);
	formData.append('categoria_id', form.value.categoria_id);
	formData.append('fornecedor_id', form.value.fornecedor.id);
	formData.append('tipo_chave_pix', form.value.tipo_chave_pix )
	formData.append('fornecedor_tipo', form.value.fornecedor.tipo);
	formData.append('dados_bancarios', JSON.stringify(form.value.dados_bancarios));
	formData.append('data_vencimento', form.value.data_vencimento);
	formData.append('fornecedor_nome', form.value.fornecedor.nome);
	formData.append('fornecedor_apelido', form.value.fornecedor.apelido);
	formData.append('fornecedor_documento', form.value.fornecedor.documento);
	formData.append('dados_complementares', form.value.dados_complementares);
	formData.append('justificativa_urgente', form.value.justificativa_urgente)

	if (form.value.nf && form.value.nf.length > 0) formData.append('nf', form.value.nf[0]);
	
	if (form.value.doc && form.value.doc.length > 0) {
		for (let i = 0; i < form.value.doc.length; i++) {
        	formData.append('doc', form.value.doc[i]);
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
		await definePaymentImportant();
		reset();

	} catch (error) {
		console.error(error.message);
		$toast.error(error.message);
	} 
};

const updatePayment = async (id, data) => {
	try {

		const payload = buildFormData()

		const { success, message } = await updatePagamento(id, payload)

		if(!success) throw new Error(message)

		$toast.success(message)

		setTimeout(() => router.push('/financeiro/aprovadas'), 750)

	} catch (error) {
		console.log('Erro ao atualizar pagamento', error.message)
		$toast.error('Erro ao atualizar pagamento')
	}
}

const definePaymentImportant = async () => {
	try {
		const { data: pagamentos, success, message } = await getPagamentoTipo();

		if(!success) throw new Error(message);
		
		const priorizados = pagamentos.filter((p) => p.nome === 'PIX' || p.nome === 'Boleto');
		const restantes = pagamentos.filter((p) => p.nome !== 'PIX' && p.nome !== 'Boleto').sort((a, b) => a.nome.localeCompare(b.nome));
		paymentsType.value = [...priorizados, ...restantes];

	} catch (error) {
		console.log('Erro ao buscar tipos de pagamento', error.message)
		$toast.error('Erro ao buscar tipos de pagamento')
	}
}

await definePaymentImportant();

function createFileFromAnexo(anexo) {
    if (!anexo) return { file: null, folder: null };
    const folder = `${path}${anexo.caminho}`;
	const file = new File([folder], anexo.nome, { type: anexo.tipo_arquivo.mime });
    return { file, folder }
}

function formatPaymentData(data) {

	const fileDOC = data.anexos_pagamento?.find((anexo) => anexo.tipo_anexo_id === 4);
	const fileNF = data.anexos_pagamento?.find((anexo) => anexo.tipo_anexo_id === 3);

	const { file: doc, folder: pathDoc } = createFileFromAnexo(fileDOC);
	const { file: nf, folder: pathNF }  = createFileFromAnexo(fileNF);

    form.value = {
		nf,
		doc: [doc],
		pathNF,
		...data,
		pathDoc,
        projeto_id: data.projeto_id,
		categoria_id: data.categoria.id,
		grupo_id: data.categoria.grupo.id,
        tipo_chave_pix: data.tipo_chave_pix_id,
        dados_bancarios: formatBankingData(data),
        data_vencimento: dayjs(data.data_vencimento).format('YYYY-MM-DD'),
    };

}

function formatBankingData(data) {
    const dadosBancarios = JSON.parse(data.dados_bancarios);
    switch (form.value.tipo_id) {
        case 1: 
            dadosBancarios.outhers = dadosBancarios.chave_pix.replace(/[\D]/g, '');
            break;
        case 3: 
            const { banco, agencia, conta, digito } = dadosBancarios;
            return { banco, agencia, conta, digito, ...dadosBancarios };
        default:
            return dadosBancarios;
    }
}

const getPagamento = async (id) => {
    try {
        const { success, data, message } = await getOnePayment(id, 'geral');

        if (!success)  throw new Error(message);

        formatPaymentData(data);

    } catch (error) {
        console.error('Erro ao buscar pagamento:', error.message);
        $toast.error('Erro ao buscar pagamento');
    }
};

// * Função para limpar o formulário

const reset = () => {
	form.value = initFormState();
	form.value.valor_total = 0
	form.value.doc = []
	form.value.tipo_chave_pix = null
	form.value.projeto_id = null
};

function initFormState() {
	return {
		fornecedor: { id: null, nome: null, apelido: null, documento: null, tipo: null, modo: {
			nacional: false,
			internacional: false,
		}},
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
		projeto_id: null,
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

// * Lifecycle

onMounted(async () => {
	if(routeId.value) await Promise.all([ await definePaymentImportant(), await getPagamento(routeId.value) ])
});

// * Watchers

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

.btn-flutter {
	position: fixed;
	top: 100px;
	left: 70px;
	scale: 1.5;
}

</style>
