<template>
	<LazyModal v-model:enable="enableValue" :actions="actions" :title="title" width="auto">
		<template #content>
			<div class="txt-center">
				<CustomText :title="message" class="ml-2" color="#118B9F" size="20" :bold="true" />
				<br />
				<v-row justify="space-between" align="start" align-content="start" class="mt-3">
					<v-col cols="auto">
						<CustomText title="Solicitante:" class="ml-2" color="black" size="16" :bold="true" />
						{{ item.usuario.nome }}
					</v-col>
					<v-col cols="auto">
						<CustomText title="Valor:" class="ml-2" color="black" size="16" :bold="true" />
						{{ formatCurrency(item.valor_total) }}
					</v-col>
					<v-col cols="auto">
						<CustomText title="Motivo:" class="ml-2" color="black" size="16" :bold="true" />
						{{ item.motivo }}
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
	title: { type: String, default: 'Confirmação' },
	actions: { type: Array, default: () => [] },
	item: { type: Object, required: true },
});

//* EMITS

const emit = defineEmits('close');

//* COMPUTED

const enableValue = computed({
	get: () => props.enable,
	set: (value) => emit('update:enable', value),
});
</script>

<style scoped>
.txt-center {
	text-align: center;
}
</style>
