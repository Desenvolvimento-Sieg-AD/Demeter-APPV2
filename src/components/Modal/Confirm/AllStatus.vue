<template>
	<LazyModal v-model:enable="enableValue" :actions="actions" :title="title" width="auto">
		<template #content>
			<v-container class="txt-center">
				<CustomText :title="message" class="ml-2" color="#118B9F" size="20" :bold="true" />
				<br />
				<v-row v-if="confirm === 'delete'" class="mt-4">
					<v-col cols="12">
						<CustomInput
							v-model="ambos"
							append-inner-icon="mdi-file-upload-outline"
							type="checkbox"
							label="Enviar para ambos"
							hide-details
						/>
					</v-col>
				</v-row>
				<v-row v-if="confirm === 'delete' && ambos" class="mt-2">
					<v-col cols="12">
						<CustomInput
							:rows="2"
							type="textarea"
							label="Justificativa"
							v-model="justificativaAmbos"
							hide-details
							required
						>
						</CustomInput>
					</v-col>
				</v-row>

				<v-row v-if="confirm === 'delete' && !ambos" class="mt-2">
					<v-col cols="12">
						<CustomInput
							:rows="2"
							type="textarea"
							label="Justificativa Solicitante"
							v-model="justiSolicitante"
							hide-details
						>
						</CustomInput>
					</v-col>
				</v-row>
				<v-row v-if="confirm === 'delete' && !ambos" class="mt-2">
					<v-col cols="12">
						<CustomInput
							:rows="2"
							type="textarea"
							label="Justificativa financeiro"
							v-model="justiFinanceiro"
							hide-details
							required
						>
						</CustomInput>
					</v-col>
				</v-row>
			</v-container>
		</template>
	</LazyModal>
</template>

<script setup>
//* PROPSdelete

const props = defineProps({
	enable: { type: Boolean, default: false },
	message: { type: String, default: '' },
	title: { type: String, default: 'Confirmação' },
	actions: { type: Array, default: () => [] },
	confirm: { type: String, default: 'aprovar' },
	justificativaFinanceiro: { type: String, required: true },
	justificativaClientes: { type: String, required: true },
	justificativaAmbos: { type: String, required: true },
	ambos: { type: Boolean, default: true },
});

const justiSolicitante = ref('');
const justiFinanceiro = ref('');
const justificativaAmbos = ref('');

const ambos = ref(true);

const emit = defineEmits(
	'close',
	'update:justificativaAmbos',
	'update:justificativaFinanceiro',
	'update:justificativaClientes',
	'update:ambos'
);

//* COMPUTED

const enableValue = computed({
	get: () => props.enable,
	set: (value) => emit('update:enable', value),
});

watch(
	() => justiFinanceiro.value,
	(newValue) => {
		emit('update:justificativaFinanceiro', newValue);
	}
);

watch(
	() => justiSolicitante.value,
	(newValue) => {
		emit('update:justificativaClientes', newValue);
	}
);

watch(
	() => justificativaAmbos.value,
	(newValue) => {
		emit('update:justificativaAmbos', newValue);
	}
);

watch(
	() => ambos.value,
	(newValue) => {
		emit('update:ambos', newValue);
	}
);
</script>

<style scoped>
.txt-center {
	text-align: center;
}
</style>
