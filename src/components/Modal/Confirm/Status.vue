<template>
	<LazyModal v-model:enable="enableValue" :actions="actions" :title="title" width="600px">
		<template #content>
			<div class="txt-center">
				<CustomText :title="message" class="ml-2" color="#118B9F" size="20" :bold="true" />
				<br />

				<v-row justify="center" class="mt-3">
					<v-col cols="4">
						<CustomInput v-model="item.usuario.sigla" disabled hide-details label="Solicitante"/>
					</v-col>
					<v-col cols="4">
						<CustomInput v-model="valor_total" disabled hide-details label="Valor"/>
					</v-col>
					<v-col cols="4">
						<CustomInput v-model="data_vencimento" disabled hide-details label="Data de Vencimento"/>
					</v-col>
					
				</v-row>

				<v-row justify="center">
					<v-col cols="12">
						<CustomInput type="textarea" :rows="2" v-model="item.motivo" disabled hide-details label="Motivo do Pagamento"/>
					</v-col>
				</v-row>

				<v-row justify="center" v-if="confirm === 'disapprove'">
					<v-col cols="12">
						<CustomInput
							type="textarea"
							:rows="2"
							v-model="justificativaValue"
							label="Justificativa de recusa"
							placeholder="Digite a justificativa"
							:rules="[v => !!v || 'Campo obrigatório']"
							required
							hide-details
							hide-label
							/>
						</v-col>
				</v-row>

				<!-- <v-row v-if="page === 'gerencia' && confirm === 'disapprove'">
					<v-col cols="12">
						<CustomInput
							v-model="permiteEditar"
							append-inner-icon="mdi-file-upload-outline"
							type="checkbox"
							label="Permitir solicitante editar pagamento para reenvio?"
							hide-details
						/>
					</v-col>
				</v-row> -->
				
			</div>
		</template>
	</LazyModal>
</template>

<script setup>
//* PROPS

const props = defineProps({
	item: { type: Object, required: true },
	title: { type: String, default: 'Confirmação' },
	enable: { type: Boolean, default: false },
	confirm: { type: String, default: 'approve' },
	message: { type: String, default: '' },
	actions: { type: Array, default: () => [] },
	page: { type: String, default: '' },
	justificativa: { type: String, default: null },
	permiteEditar: { type: Boolean, default: false },
});

//* EMITS

const emit = defineEmits(['close', 'update:enable', 'update:justificativa', 'update:permiteEditar']);

//* COMPUTED

const enableValue = computed({
	get: () => props.enable,
	set: (value) => emit('update:enable', value),
});

const justificativaValue = computed({
	get: () => props.justificativa,
	set: (value) => emit('update:justificativa', value),
})

const permiteEditar = computed({
	get: () => props.permiteEditar,
	set: (value) => emit('update:permiteEditar', value),
})

const valor_total = computed(() => formatCurrency(props.item.valor_total)); 
const data_vencimento = computed(() => formatDate(props.item.data_vencimento));

watch(() => props.enable, (value) => {
	if (!value) justificativaValue.value = null;	
});

</script>

<style scoped>
.txt-center {
	text-align: center;
}
</style>
