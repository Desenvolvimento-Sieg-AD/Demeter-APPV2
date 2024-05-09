<template>
  <v-row class="pa-2">
    <v-col cols="12" md="4">
      <CustomInput
        required
        hide-details
        label="Motivo"
        type="textarea"
        no-resize
        :rows="3"
        :counter="false"
        v-model="formValue.motivo"
        append-inner-icon="mdi-chat-question-outline"
      />
    </v-col>

    <v-col cols="8">
      <CustomInput hide-details type="textarea" no-resize :rows="3" :counter="false" label="Observações" v-model="formValue.dados_complementares" />
    </v-col>

    <v-col cols="12" v-if="!requer_projeto">
      <CustomInput
        hide-details
        item-value="id"
        label="Projeto"
        :required="!requer_projeto"
        :items="projetos"
        item-title="nome"
        type="combobox"
        v-model="formValue.projeto_id"
        @blur="findProject"
        append-inner-icon="mdi-briefcase-plus-outline"
        return-object
      />
    </v-col>
  </v-row>
</template>

<script setup>
const { $toast } = useNuxtApp()

import { getProjects } from '~/api'
import { useAuthStore } from '~/store/auth'
const { user } = useAuthStore()

const props = defineProps({
  form: { type: Object, required: true },
  user: { type: Object, required: true }
})

const projetos = ref([])
const requer_projeto = computed(() => user?.setores?.some((setor) => setor.requer_projeto))

const formValue = computed({
  get: () => props.form,
  set: (value) => emit('update:form', value)
})

const findProject = async (search) => {
  try {
    if (typeof search !== 'string') return
    if (search.length < 6) throw new Error('Digite pelo menos 6 caracteres para buscar um projeto')

    const { data } = await getProjects(search)
    if (data.length === 0) throw new Error('Nenhum projeto encontrado com esse nome')

    projetos.value = data
  } catch (error) {
    console.error(error)
    $toast.error(error.message)
  }
}
</script>
