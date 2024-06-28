<template>
  <LazyModal v-model:enable="enableValue" :actions="actions" :title="title" width="500">
    <template #content>
      <v-container class="txt-center">
        <CustomText title="Selecione o cliente a ser exportado" class="ml-2" color="#F68A1A" size="20" bold />
        <br />
        <CustomInput v-model="clientValue" readonly label="Cliente" icon="mdi-account" type="autocomplete" :items="clients" />
        <br>
        <CustomText :title="`Pagamentos a serem exportados: ${payments}`" class="ml-2" size="160" />
      </v-container>
    </template>
  </LazyModal>
</template>

<script setup>
//* PROPS

const props = defineProps({
	enable: { type: Boolean, default: false },
	message: { type: String, default: 'Segue o link da sua exportação.' },
  client: { type: String, default: '' },
	title: { type: String, default: 'Exportar Pagamentos' },
  payments: { type: Number, default: 0 },
});

//* DATA

const clients = ref([]);
const loading = ref(false);

//* EMITS

const emit = defineEmits(['close', 'update:enable', 'update:client']);

//* COMPUTED

const enableValue = computed({
	get: () => props.enable,
	set: (value) => emit('update:enable', value),
});

const clientValue = computed({
  get: () => props.client,
  set: (value) => emit('update:client', value)
})

//* UTILS

const actions = computed(() => [
  {
    text: 'Exportar',
    color: 'primary',
    icon: 'mdi-export',
    handler: () => emit('export'),
    loading: loading.value,
    active: () => !!clientValue.value
  },
  {
    text: 'Cancelar',
    color: 'error',
    icon: 'mdi-close',
    handler: () => enableValue.value = false,
    loading: loading.value,
    active: () => !loading.value
  }
])

</script>