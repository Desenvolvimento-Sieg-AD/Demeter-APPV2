<template>
	<LazyModal v-model:enable="enableValue" :actions="actions" :title="title" width="auto">
		<template #content>
			<div class="txt-center">
				<CustomText :title="message" color="#118B9F" size="20" :bold="true" />
				<v-row justify="space-between" align="start" align-content="start" class="mt-3">
					<v-col cols="auto" v-if="item.usuario">
						<CustomText title="Solicitante:" color="black" size="16" :bold="true" />
						{{ item.usuario.nome }}
					</v-col>

					<v-col cols="auto">
						<CustomText title="Valor:" color="black" size="16" :bold="true" />
						{{ formatCurrency(item.valor_total) }}
					</v-col>

					<v-col cols="auto">
						<CustomText title="Motivo do Pagamento:" color="black" size="16" :bold="true" />
						{{ item.motivo }}
					</v-col>

					<v-col cols="12">
						<CustomInput
							v-model="ambos"
							append-inner-icon="mdi-file-upload-outline"
							type="checkbox"
							label="Enviar para ambos"
							hide-details
						/>
					</v-col>

					<v-col>
						<v-row v-if="confirm === 'delete' && ambos">
							<v-col>
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
						<v-row v-if="confirm === 'delete' && !ambos">
							<v-col>
								<CustomInput
									:rows="2"
									type="textarea"
									label="Justificativa Solicitante"
									v-model="justiSolicitante"
									hide-details
									required
								>
								</CustomInput>
							</v-col>
						</v-row>
						<v-row v-if="confirm === 'delete' && !ambos">
							<v-col>
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
					</v-col>
				</v-row>
			</div>
		</template>
	</LazyModal>
</template>

<script setup>
//* PROPS

const props = defineProps({
	enable: { type: Boolean, default: false },
	message: { type: String, default: '' },
	title: { type: String, default: 'Reprovar Pagamento' },
	labelCancel: { type: String, default: 'Justificativa de Reprovação:' },
	actions: { type: Array, default: () => [] },
	confirm: { type: String, default: 'delete' },
	ambos: { type: Boolean, default: false },
	item: { type: Object, required: true },
	justificativa: { type: String, required: true },
});

const justi = ref('');

//* EMITS

const emit = defineEmits('close', 'update:justificativa', 'update:ambos');

//* COMPUTED

const ambos = ref(true);

const enableValue = computed({
	get: () => props.enable,
	set: (value) => emit('update:enable', value),
});

const justiSolicitante = ref('');
const justiFinanceiro = ref('');
const justificativaAmbos = ref('');

const justificativaValue = computed({
	get: () => props.justificativa,
	set: (value) => emit('update:justificativa', value),
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
