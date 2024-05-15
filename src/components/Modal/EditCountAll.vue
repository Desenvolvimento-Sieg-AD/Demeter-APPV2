<template>
	<LazyModal v-model:enable="enableValue" :actions="actions" :title="title" width="600px">
		<template #content>
			<v-container class="txt-center">
				<CustomText title="Editar contas pagadoras dos pagamentos selecionados" class="ml-2" color="#118B9F" size="20" :bold="true" />
				<br />

				<div class="w-full d-flex mt-2">
					<v-col cols="12" md="6">
						<CustomInput
							type="select"
							:required="true"
							label="Empresa pagadora"
							:items="empresas"
							v-model="empresa_id"
							itemValue="id"
							itemTitle="apelido"
							hide-details
							:change="verifyConta()"
						/>
					</v-col>
					<v-col cols="12" md="6">
						<CustomInput
							:disabled="!empresa_id"
							type="select"
							:required="true"
							label="Conta"
							:items="contaSelecionada"
							v-model="conta_id"
							itemValue="id"
							itemTitle="descricao"
							hide-details
						/>
					</v-col>
				</div>
			</v-container>
		</template>
	</LazyModal>
</template>

<script setup>
//* IMPORTS

import { getEmpresa, getConta, alterCountAll } from '@api';

//* PROPS

const props = defineProps({
	enable: { type: Boolean, default: false },
	message: { type: String, default: '' },
	title: { type: String, default: 'Editar conta' },
	items: { type: Object, default: [] },
});

onBeforeMount(async () => {
	await Promise.all([(empresas.value = (await getEmpresa()).data), (contas.value = (await getConta()).data)]);
});

//* DATA

const empresas = ref([]);
const contas = ref([]);
const contaSelecionada = ref([]);
const conta_id = ref(null);
const empresa_id = ref(null);
const loading = ref(false);

//* EMITS

const emit = defineEmits('close', 'update-success');

//* COMPUTED

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
		click: async () => await alter(),
	},
]);

const enableValue = computed({
	get: () => props.enable,
	set: (value) => emit('update:enable', value),
});

//* METHODS

const verifyConta = () => {
	if (empresa_id.value) {
		const cont = contas.value.filter((obj) => obj.empresa_id === empresa_id.value);
		const id = cont.find((obj) => obj.padrao === true);
		conta_id.value = id;
		contaSelecionada.value = cont;
	}
};

const alter = async () => {
	
	const ids = props.items.map((item) => item.id);

	loading.value = true;
	const cont = conta_id.value.id ?? conta_id.value;
	const emp = empresa_id.value.id ?? empresa_id.value;

	const { success } = await alterCountAll(ids, cont, emp);

	if (success) {
		loading.value = false;
		enableValue.value = false;
		emit('update-success');
	}
};
</script>

<style scoped>
.txt-center {
	text-align: center;
}
</style>