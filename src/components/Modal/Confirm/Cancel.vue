<template>
	<LazyModal v-model:enable="enableValue" :actions="actions" :title="title" width="800px">
		<template #content>
			<h3 class="text-center title" >Deseja realmente cancelar este pagamento?</h3>
            <v-row justify="space-between" align="center" class="mt-1">
                <v-col cols="4">
                    <CustomInput label="Fornecedor" v-model="item.fornecedor.nome_fantasia" disabled/>
                </v-col>
                <v-col cols="4">
                    <CustomInput label="Valor Total" mask="money" v-model="item.valor_total" disabled/>
                </v-col>
                <v-col cols="4">
                    <CustomInput label="Data de Vencimento" v-model="date" disabled/>
                </v-col>
                <v-col class="mt-n7">
                    <CustomInput label="Motivo" v-model="item.motivo" :rows="2" disabled type="textarea"/>
                </v-col>
            </v-row>
            <v-row class="mt-n5">
                <v-col>
                    <CustomInput v-model="updateMessage" label="Justificativa" type="text" :rows="3" required :maxLength="300"/>
                </v-col>
            </v-row>
		</template>
	</LazyModal>
</template>

<script setup>
//* PROPS

const dayjs = useDayjs()

const props = defineProps({
	enable: { type: Boolean, default: false },
	message: { type: String, default: '' },
	title: { type: String, default: 'Cancelar Pagamento' },
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

const updateMessage = computed({
    get: () => props.message,
    set: (value) => emit('update:message', value)
})

const date = dayjs(props.item.data_vencimento).format('DD/MM/YYYY')

watch(() => props.enable, (value) => {
    if(!value) updateMessage.value = null
})

</script>

<style scoped>

.title{
color: #118B9F
}

</style>
