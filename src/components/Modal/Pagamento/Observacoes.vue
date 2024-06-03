<template>
  <CustomText title="Observações" class="ml-2" color="#118B9F" size="18" :bold="true" />
  <v-row class="pa-2 mb-n5">
    <v-col cols="5" >
      <CustomInput required label="Motivo" type="textarea" :rows="5" :counter="300" v-model="formValue.motivo" append-inner-icon="mdi-chat-question-outline" hide-details />
    </v-col>

    <v-col cols="7">
      <CustomInput type="textarea" :counter="300" no-resize :rows="5" label="Observações" v-model="formValue.dados_complementares" hide-details />
    </v-col>
  </v-row>
</template>

<script setup>
const { $toast } = useNuxtApp()

import { useAuthStore } from '~/store/auth'
const { user } = useAuthStore()

const props = defineProps({
  form: { type: Object, required: true },
  user: { type: Object, required: true }
})

const projetos = ref([])

const formValue = computed({
  get: () => props.form,
  set: (value) => emit('update:form', value)
})
</script>
