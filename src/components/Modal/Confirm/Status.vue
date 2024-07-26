<template>
	<LazyModal v-model:enable="enableValue" :actions="actions" :title="title" width="600px">
		<template #content>
			<div class="txt-center">
				<h3 class="text-center title"> {{ messageValue }} </h3>

				<v-row justify="center" class="mt-2">
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
						<CustomInput type="textarea" :rows="4" v-model="item.motivo" disabled hide-details label="Motivo do Pagamento"/>
					</v-col>
				</v-row>

				<v-row justify="center" v-if="type === 'recusar' || type === 'revisar' ">
					<v-col cols="12">
						<CustomInput
							type="textarea"
							:rows="3"
							v-model="justificativaValue"
							label="Justificativa"
							required
							hide-details="auto"
							hint="Esta justificativa será enviada para os solicitantes via e-mail"
							hide-label
							/>
						</v-col>
				</v-row>
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
	type: { type: String, default: 'aprovar' },
	actions: { type: Array, default: () => [] },
	justificativa: { type: String, default: null }
});

//* EMITS

const emit = defineEmits(['close', 'update:enable', 'update:justificativa']);

//* COMPUTED

const enableValue = computed({
	get: () => props.enable,
	set: (value) => emit('update:enable', value),
});

const justificativaValue = computed({
	get: () => props.justificativa,
	set: (value) => emit('update:justificativa', value),
})

const valor_total = computed(() => formatCurrency(props.item.valor_total));

const data_vencimento = computed(() => formatDate(props.item.data_vencimento));

const messageValue = computed(() => {
  switch (props.type) {
    case 'aprovar':
      return 'Deseja realmente aprovar estes pagamentos?'
    case 'revisar':
      return 'Deseja realmente enviar estes pagamentos para revisão?'
    case 'recusar':
      return 'Deseja realmente recusar estes pagamentos?'
    default:
      return 'Deseja realmente realizar esta ação?'
  }
})

//* WATCHERS

watch(() => props.enable, (value) => {
	if (!value) justificativaValue.value = null;	
});

</script>

<style scoped>
.txt-center {
	text-align: center;
}
.title {
  color: #f68a1a;
}
</style>
