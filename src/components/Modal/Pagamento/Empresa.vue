<template>
  <CustomText title="Empresa" class="ml-3" size="18" color="secondary" :bold="true" />
  <v-row class="pa-3" dense>
    <v-col cols="3">
      <CustomInput
        required
        type="select"
        hide-details="auto"
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
        hide-details="auto"
        itemValue="id"
        itemTitle="nome"
        :itemProps="itemProps"
        :items="setores"
        label="Seu setor"
        v-model="formValue.setor_solicitante_id"
        append-inner-icon="mdi-domain"
        :disabled="setores.length <= 1 || !formValue.empresa_id"
      />
    </v-col>

    <v-col cols="3">
      <CustomInput
        required
        hide-details="auto"
        itemValue="id"
        itemTitle="nome"
        :items="setoresPadrao"
        label="Setor referência"
        type="combobox"
        v-model="formValue.setor_id"
        append-inner-icon="mdi-briefcase-plus-outline"
      />
    </v-col>

    <v-col cols="3">
      <CustomInput
        ref="projetoRef"
        hide-details="auto"
        item-value="id"
        label="Projeto"
        :required="requer_projeto"
        :items="projetos"
        item-title="nome"
        type="combobox"
        v-model="formValue.projeto_id"
        @change="findProject"
        @blur="notExistProject"
        append-inner-icon="mdi-briefcase-plus-outline"
      />
    </v-col>

    <LazyModalConfirmProjeto
      v-model:form="formValue"
      v-model:enable="enableModal.confirm"
      message="O projeto mencionado não existe no sistema, deseja confirmar a criação desse projeto?"
      :actions="modalActions"
    />
  </v-row>
</template>
<script setup>
import { getProjects, getEmpresa, existRelationSetorWithEmpresa, createProjectAPI, getSetoresPadrao } from '@api'
import { useAuthStore } from '~/store/auth'

const { data: empresas } = await getEmpresa()

const setores = computed(() => user.setores)
const { data: setoresPadrao } = await getSetoresPadrao()

const { user } = useAuthStore()

const requer_projeto = computed(() => {
  if (!formValue.value.setor_solicitante_id) return false

  const find = setores.value.find((setor) => setor.id === formValue.value.setor_solicitante_id)
  return find ? find.requer_projeto : false
})

const { $toast } = useNuxtApp()

const projetoRef = ref(null)
const projetos = ref([])
const loading = ref(false)

const enableModal = reactive({ confirm: false })

const itemProps = (item) => {
  return { disabled: item.disabled, subtitle: item.disabled ? 'Setor não relacionado com a empresa' : '' }
}

const props = defineProps({ form: { type: Object, required: true } })

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
    if (!formValue.value.empresa_id) return

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

const modalActions = [
  {
    icon: 'mdi-close',
    title: 'Cancelar',
    type: 'cancel',
    click: () => (enableModal.confirm = false)
  },
  {
    icon: 'mdi-check',
    title: 'Confirmar',
    type: 'success',
    loading: loading.value,
    click: () => createProject()
  }
]

const findProject = async (attrs, search) => {
  try {
    projetos.value = []

    if (typeof search !== 'string') return

    const { data } = await getProjects(search)

    projetos.value = data

    await projetoRef?.value?.click()
  } catch (error) {}
}

const notExistProject = async () => (formValue.value.projeto_id && isNaN(Number(formValue.value.projeto_id)) ? (enableModal.confirm = true) : null)

const createProject = async () => {
  try {
    const { success, message, data } = await createProjectAPI(formValue.value.projeto_id)

    if (!success) throw new Error(message)

    formValue.value.projeto_id = data.id

    enableModal.confirm = false

    findProject(null, data.nome)
  } catch (error) {
    console.error(error)
    $toast.error('Erro ao criar projeto')
  }
}

watch(() => formValue.value.empresa_id, existRelation)
</script>
<style scoped></style>
