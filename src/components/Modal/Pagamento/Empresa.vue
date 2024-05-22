<template>
  <CustomText title="Empresa" class="ml-3" color="#118B9F" size="18" :bold="true" />
  <v-row class="pa-3 mb-n6">
    <v-col cols="4">
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

    <v-col cols="3">
      <CustomInput
        required
        type="autocomplete"
        hide-details
        itemValue="id"
        itemTitle="nome"
        :itemProps="itemProps"
        :items="setores"
        label="Setor"
        v-model="formValue.setor_id"
        append-inner-icon="mdi-domain"
        :disabled="setores.length <= 1 || !formValue.empresa_id"
      />
    </v-col>

    <v-col cols="5">
      <CustomInput
        hide-details
        item-value="id"
        label="Projeto"
        :required="requer_projeto"
        :items="projetos"
        item-title="nome"
        type="combobox"
        v-model="formValue.projeto_id"
        @change="findProject"
        append-inner-icon="mdi-briefcase-plus-outline"
      />
    </v-col>

    
  </v-row>
</template>
<script setup>
import { getEmpresa, existRelationSetorWithEmpresa } from '@api'
import { useAuthStore } from '~/store/auth'

const { data: empresas } = await getEmpresa()

const { user } = useAuthStore()

const { $toast } = useNuxtApp()

const setores = computed(() => user.setores)

const itemProps = (item) => {
  return { disabled: item.disabled, subtitle: item.disabled ? 'Setor não relacionado com a empresa' : ''}
}

const props = defineProps({
  form: { type: Object, required: true },
})

const formValue = computed({
  get: () => props.form,
  set: (value) => emit('update:form', value)
})

const defineFileTitle = (fileName) => {
  if (fileName && fileName.length > 20) return fileName.replace(/.\w+$/g, '')
  return fileName
}

const openFile = async (folder) => {
  try {
    if (!folder) return
    await useOs().openFile(folder)
  } catch (error) {
    console.error(error)
    $toast.error('Erro ao abrir arquivo')
  }
}

const existRelation = async () => {
  try {

    if(!formValue.value.empresa_id) return

    for await (const setor of setores.value) {

      const { data } = await existRelationSetorWithEmpresa(setor.id, formValue.value.empresa_id)

      setor.disabled = false
      if (!data) setor.disabled = true

    }

  } catch (error) {
    console.error(error)
    $toast.error('Erro ao verificar relação entre setor e empresa')
  }
}

watch(() => formValue.value.empresa_id, existRelation)


</script>
<style scoped></style>
