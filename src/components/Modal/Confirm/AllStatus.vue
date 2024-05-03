<template>
	<LazyModal v-model:enable="enableValue" :actions="actions" :title="title" width="auto">
		<template #content>
			<v-container class="txt-center">
				<CustomText :title="message" class="ml-2" color="#118B9F" size="20" :bold="true" />
				<br />
				<v-row class="mt-2" v-if="confirm === 'disapprove'">
					<v-col cols="12">
						<CustomInput
							v-model="justificativaValue"
							type="text"
							required
							label="Justificativa para os solicitantes"
							hide-details
						/>
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
	justificativa: { type: String, required: true },
});

const ambos = ref(true);

const emit = defineEmits(['close', 'update:justificativa']);

//* COMPUTED

const enableValue = computed({
	get: () => props.enable,
	set: (value) => emit('update:enable', value),
});

const justificativaValue = computed({
	get: () => props.justificativa,
	set: (value) => emit('update:justificativa', value),
});

</script>

<style scoped>
.txt-center {
	text-align: center;
}
</style>
