<template>
	<LazyModal v-model:enable="enableValue" title="Atualização Disponível" width="500">
		<template #content>
			<v-container class="text-center">
				<v-row justify="center" align="center" class="mb-4">
					<v-col cols="12">
						<h3 class="font-weight-bold text-primary">{{ sigla }}, temos uma atualização disponível!</h3>
						<p class="mt-2">Por favor, aguarde enquanto realizamos a instalação da atualização. Isso pode levar alguns minutos.</p>
					</v-col>
					<v-col cols="12">
						<v-icon size="100" color="primary" class="mb-5">mdi-loading mdi-spin</v-icon>
					</v-col>
				</v-row>
			</v-container>
		</template>
	</LazyModal>
</template>
<script setup>
//* PROPS

const props = defineProps({ enable: { type: Boolean, default: false } });

//* EMITS

const emit = defineEmits(['close', 'update:enable', 'update:link']);

//* COMPUTED

const enableValue = computed({
	get: () => props.enable,
	set: (value) => emit('update:enable', value),
});

const usuario = await useOs().getUser();
const sigla = usuario?.username?.toUpperCase();

</script>

<style scoped>
.text-center {
  text-align: center;
}

.font-weight-bold {
  font-weight: bold;
}

.mt-2 {
  margin-top: 16px;
}

.mb-4 {
  margin-bottom: 32px;
}
</style>



<style scoped>
.txt-center {
	text-align: center;
}
</style>