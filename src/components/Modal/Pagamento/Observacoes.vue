<template>

	<v-row class="pa-2">

		<v-col cols="12" md="4">
			<CustomInput
				required
				hide-details
				label="Motivo"
				type="textarea"
				:no-resize="false"
				v-model="formValue.motivo"
				append-inner-icon="mdi-chat-question-outline"
			/>
		</v-col>

		<v-col cols="8">
			<CustomInput
				hide-details
				type="textarea"
				:no-resize="false"
				label="Observações"
				v-model="formValue.dados_complementares"
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
				v-model="formValue.projeto_id"
				append-inner-icon="mdi-briefcase-plus-outline"
			/>
		</v-col>

	</v-row>

</template>
<script setup>

import { getProjects } from '@api';

const { data: projetos } = await getProjects();

const props = defineProps({
    form: { type: Object, required: true },
    user: { type: Object, required: true },
})

const formValue = computed({
    get: () => props.form,
    set: (value) => emit('update:form', value)
})

</script>
<style scoped>

</style>
