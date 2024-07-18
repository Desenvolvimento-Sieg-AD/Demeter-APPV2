<template>
  <LayoutTitle title="Observações" />

  <v-row class="pa-3" dense>
    <v-col cols="12">
      <CustomInput required label="Motivo" type="textarea" :rows="4" :counter="300" v-model="formValue.motivo" append-inner-icon="mdi-chat-question-outline" hide-details />
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
