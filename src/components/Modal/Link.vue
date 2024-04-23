<template>
	<LazyModal v-model:enable="enableValue" :actions="actions" :title="title" width="500">
		<template #content>
			<v-container class="txt-center">
				<CustomText :title="message" class="ml-2" color="#118B9F" size="20" :bold="true" />
				<br />
				<v-row>
					<v-col cols="8">
						<CustomInput v-model="linkValue" readonly label="Link" icon="mdi-file" />
					</v-col>
					<v-col cols="2">
						<v-btn @click="openFile">Abrir</v-btn>
					</v-col>
				</v-row>
			</v-container>
		</template>
	</LazyModal>
</template>

<script setup>
//* PROPS

const props = defineProps({
	enable: { type: Boolean, default: false },
	message: { type: String, default: 'Segue o link da sua exportação.' },
	link: { type: String, default: '' },
	title: { type: String, default: 'Vizualização da exportação' },
});

//* EMITS

const emit = defineEmits(['close', 'update:enable', 'update:link']);

//* COMPUTED

const enableValue = computed({
	get: () => props.enable,
	set: (value) => emit('update:enable', value),
});

const linkValue = computed({
	get: () => props.link,
	set: (value) => emit('update:link', value)
})

//* METHODS

const openFile = async () => {
	const { success, message } = await useOs().openFile(props.link);
	if (!success) $toast.error(message);
};
</script>

<style scoped>
.txt-center {
	text-align: center;
}
</style>