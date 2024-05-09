<template>

    <v-row class="pa-3">

		<v-col cols="6">

			<CustomInput
				required
				type="select"
				hide-details
				itemValue="id"
				itemTitle="nome"
				:items="empresas"
				label="Empresa pagadora"
				v-model="formValue.empresa_id"
				append-inner-icon="mdi-domain"
			/>

		</v-col>

		<v-col cols="6">

		    <CustomInput
		    	type="file"
		    	persistent-hint
		    	label="Documento"
		    	v-model="formValue.doc"
		    	:required="documentRequired"
		    	accept="image/*,application/pdf"
		    	hint="Ex: Boleto, Comprovante, Certidão"
		    	:append-inner-icon="formValue.pathDoc ? 'mdi-paperclip' : 'mdi-file-outline'"
				@click:append-inner.stop="openFile(formValue.pathDoc)"
		    >
				<template #selection="{ fileNames }">
					<span class="text-truncate">
						{{ defineFileTitle(fileNames[0]) }}
					</span>
				</template>

			</CustomInput>
		</v-col>
	</v-row>

</template>
<script setup>

import { getEmpresa } from '@api'

const { data: empresas } = await getEmpresa()

const props = defineProps({
    form: { type: Object, required: true },
    documentRequired: { type: Boolean, default: true }
})

const formValue = computed({
    get: () => props.form,
    set: (value) => emit('update:form', value)
})

watch(() => formValue.value, (value) => {
	if (!value) return
	console.log(formValue.value);
})

const defineFileTitle = (fileName) => {
	if (fileName && fileName.length > 20) return fileName.replace(/.\w+$/g, '');
	return fileName;
};

const openFile = async (folder) => {
	try {
		if(!folder) return 
		await useOs().openFile(folder);
	} catch (error) {
		console.error(error);
		$toast.error('Erro ao abrir arquivo');
	}
}

</script>
<style scoped>

</style>