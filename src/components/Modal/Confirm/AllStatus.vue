<template>
  <LazyModal v-model:enable="enableValue" :actions="actions" :title="title" width="auto">
    <template #content>
      <h3 class="text-center title"> {{ messageValue }} </h3>

      <v-row class="mt-2" v-if="type === 'recusar' || type == 'revisar'">
        <v-col cols="12">
          <CustomInput
            v-model="justificativaValue"
            type="textarea"
            :rows="3"
            required
            label="Justificativa"
            hide-details="auto"
            hint="Esta justificativa será enviada para os solicitantes via e-mail"
          />
        </v-col>
      </v-row>
    </template>
  </LazyModal>
</template>

<script setup>

const props = defineProps({
  enable: { type: Boolean, default: false },
  title: { type: String, default: 'Confirmação' },
  actions: { type: Array, default: () => [] },
  type: { type: String, default: 'aprovar' },
  justificativa: { type: String, default: '' }
})

const emit = defineEmits(['close', 'update:justificativa'])

//* COMPUTED

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

const enableValue = computed({
  get: () => props.enable,
  set: (value) => emit('update:enable', value)
})

const justificativaValue = computed({
  get: () => props.justificativa,
  set: (value) => emit('update:justificativa', value)
})
</script>

<style scoped>
.txt-center {
  text-align: center;
}
.title {
  color: #f68a1a;
}
</style>
