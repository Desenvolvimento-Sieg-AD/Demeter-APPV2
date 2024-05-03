<template>
	<LazyModal v-model:enable="enableValue" :actions="actions" :title="title" width="800px">
		<template #content>
			<v-container class="txt-center">
				<div class="d-flex ml-2 flex-wrap">
					<div class="mr-3">
						<CustomText title="Solicitante:" class="ml-2" color="black" size="16" :bold="true" />
						{{ payment.usuario.nome }}
					</div>

					<div>
						<CustomText title="Valor:" class="ml-2" color="black" size="16" :bold="true" />
						{{ formatCurrency(payment.valor_total) }}
					</div>

					<div>
						<CustomText title="Motivo:" class="ml-2" color="black" size="16" :bold="true" />
						{{ payment.motivo }}
					</div>
				</div>

				<v-row class="mt-3">
					<v-col cols="12" md="6">
						<CustomInput
							type="select"
							required
							label="Empresa pagadora"
							:items="empresas"
							v-model="form.empresa_id"
							itemValue="id"
							itemTitle="apelido"
							hide-details
						/>
					</v-col>

					<v-col cols="12" md="6">
						<CustomInput
							:disabled="!form.empresa_id"
							type="select"
							required
							label="Conta"
							:items="contasEmpresa"
							v-model="form.conta_id"
							itemValue="id"
							itemTitle="descricao"
							hide-details
						/>
					</v-col>
				</v-row>
				<v-row>
					<v-col cols="12" md="6">
						<CustomInput
							type="select"
							required
							label="Grupo de categoria"
							:items="gruposCategoria"
							v-model="form.grupo_id"
							itemValue="id"
							itemTitle="nome"
						/>
					</v-col>

					<v-col>
						<CustomInput
							:disabled="!form.grupo_id"
							type="select"
							required
							:items="categorias"
							label="Categoria"
							v-model="form.categoria_id"
							itemValue="id"
							itemTitle="nome"
						/>
					</v-col>
				</v-row>
			</v-container>
		</template>
	</LazyModal>
</template>

<script setup>
//* IMPORTS

import { getEmpresa, getConta, updatePagamento, getGrupos, getCategoriasByGrupo, getOnePayment } from '@api';
const { $toast } = useNuxtApp();

//* PROPS

const props = defineProps({
	enable: { type: Boolean, default: false },
	message: { type: String, default: '' },
	title: { type: String, default: 'Editar pagamento' },
	id: { type: Number },
});

//* DATA

const payment = ref(null);
const conta_id = ref(null);
const loading = ref(false);
const empresa_id = ref(null);
const contasEmpresa = ref([]);
const categorias = ref([]);
const gruposCategoria = ref([]);

const form = reactive({
	empresa_id: null,
	conta_id: null,
	grupo_id: null,
	categoria_id: null,
});

//* EMITS

const emit = defineEmits('close', 'update-success');

//* COMPUTED

const enableValue = computed({
	get: () => props.enable,
	set: (value) => emit('update:enable', value),
});

const actions = computed(() => [
	{
		icon: 'mdi-close',
		title: 'Cancelar',
		type: 'grey',
		click: () => (enableValue.value = false),
	},
	{
		icon: 'mdi-check',
		title: 'Alterar',
		type: 'padrao',
		loading: loading.value,
		click: async () => await saveUpdates(),
	},
]);

//* METHODS

const getPayment = async () => {
	try {
		const { success, message, data } = await getOnePayment(props.id, 'financeiroPendentes');

		if (!success) throw new Error(message);

		payment.value = data;

		form.empresa_id = data.empresa.id;
		form.conta_id = data.conta_id;
		form.grupo_id = data.categoria.grupo.id;
		form.categoria_id = data.categoria_id;

		await getCategorias(form.grupo_id);
	} catch (error) {
		console.log(error.message);
		$toast.error(error.message);
	}
};

const getGruposCategoria = async () => {
	try {
		const { success, message, data } = await getGrupos();

		if (!success) throw new Error(message);

		gruposCategoria.value = data;
	} catch (error) {
		console.log(error.message);
		$toast.error(error.message);
	}
};

const getCategorias = async (id) => {
	try {
		const { success, message, data } = await getCategoriasByGrupo(id);
		if (!success) throw new Error(message);

		categorias.value = data;
	} catch (error) {
		console.log(error.message);
		$toast.error(error.message);
	}
};

const [{ data: empresas }, contasPagadoras] = await Promise.all([
	getEmpresa(),
	getConta(),
	getPayment(),
	getGruposCategoria(),
]);

contasEmpresa.value = contasPagadoras.data.filter((conta) => conta.empresa_id === form.empresa_id);

const saveUpdates = async () => {
	loading.value = true;
	try {
		const payload = {
			conta_id: form.conta_id,
			empresa_id: form.empresa_id,
			categoria_id: form.categoria_id,
		};

		const { success, message } = await updatePagamento(props.id, payload);

		if (!success) throw new Error(message);

		enableValue.value = false;
		emit('update-success');
	} catch (error) {
		console.log(error.message);
		$toast.error(error.message);
	}
	loading.value = false;
};

// TODO: Achar outra maneira de limpar esses campos

//* WATCHERS

watch(
	() => form.grupo_id,
	async (v) => {
		if (v !== payment.value.categoria.grupo.id) {
			form.categoria_id = null;
			await getCategorias(v);
		}
	},
	{ deep: true, immediate: true }
);

watch(() => form.empresa_id, (v) => {
	if (v !== payment.value.empresa.id) {
		form.conta_id = null;
	}
},{ deep: true, immediate: true });
</script>

<style scoped>
.txt-center {
	text-align: center;
}
</style>