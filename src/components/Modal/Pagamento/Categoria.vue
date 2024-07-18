<template>
  <LayoutTitle title="Categoria" />

  <v-row class="pa-3" dense>
    <v-col cols="2" md="3">
      <CustomInput
        required
        hide-details="auto"
        itemValue="id"
        v-model="formValue.grupo_id"
        :items="grupos"
        itemTitle="nome"
        type="autocomplete"
        label="Grupo do pedido"
        :disabled="!formValue.setor_solicitante_id || !formValue.empresa_id"
      />
    </v-col>

    <v-col cols="4" md="3">
      <CustomInput
        required
        hide-details="auto"
        itemValue="id"
        itemTitle="nome"
        label="Categoria"
        :disabled="!formValue.grupo_id"
        ref="categoriaRef"
        type="autocomplete"
        v-model="formValue.categoria_id"
        :items="selectedCategories"
      />
    </v-col>

    <v-col cols="6">
      <CustomInput
        type="file"
        persistent-hint
        label="Documento"
        v-model="formValue.doc"
        :required="documentRequired"
        accept="image/*,application/pdf"
        hint="Ex: Boleto, Comprovante, Certidão"
        :append-inner-icon="formValue.pathDoc ? 'mdi-paperclip' : 'mdi-file-outline'"
        @click:append-inner.stop="openFile(formValue.pathDoc)"
        hide-details="auto"
      >
        <template #selection="{ fileNames }">
          <span class="text-truncate">
            {{ defineFileTitle(fileNames[0]) }}
          </span>
        </template>
      </CustomInput>
    </v-col>
  </v-row>
</template>

<script setup>
import { getCategoriasUsuario } from '@api'

const { $toast } = useNuxtApp()

const grupos = ref([])
const categorias = ref([])

const emit = defineEmits(['update:form'])

const props = defineProps({
  form: { type: Object, required: true },
  documentRequired: { type: Boolean, default: true }
})

const categoriaRef = ref(null)

const formValue = computed({
  get: () => props.form,
  set: (value) => emit('update:form', value)
})

const selectedCategories = computed(() => categorias.value.filter((categoria) => categoria.grupo_id === formValue.value.grupo_id))

const defineFileTitle = (fileName) => (fileName.length > 20 ? fileName.replace(/.\w+$/g, '') : fileName)


const loadCategorias = async (setor_solicitante_id, internacional, nacional) => {
  try {
    if (!setor_solicitante_id) return

    const { success, message, data } = await getCategoriasUsuario(setor_solicitante_id, internacional, nacional)
    if (!success) throw new Error(message)

    const tempGrupos = []

    for (const categoria of data) {
      if (!tempGrupos.find((grupo) => grupo.id === categoria.grupo_id)) {
        tempGrupos.push({
          id: categoria.grupo_id,
          nome: categoria.grupo.nome
        })
      }
    }

    grupos.value = tempGrupos.sort((a, b) => a.nome.localeCompare(b.nome))
    categorias.value = data
  } 
  catch (error) {
    console.error('Erro ao buscar categorias:', error)
    $toast.error('Erro ao buscar categorias')
  }
}

onMounted(() => {
  if (formValue.value.setor_solicitante_id) loadCategorias(formValue.value.setor_solicitante_id, null, true)
})

// WATCHERS

watch(() => formValue.value.setor_solicitante_id, async (value) => {
  if (value) loadCategorias(value, null, true)
}, { immediate: true })

watch(() => formValue.value.grupo_id, async (newValue, oldValue) => {
  if (oldValue && newValue !== oldValue) {
    formValue.value.categoria_id = null
    await categoriaRef?.value?.click()
  }
}, { immediate: true })

watch(() => formValue.value.fornecedor.internacional, async (value) => {
  if (value) loadCategorias(formValue.value.setor_solicitante_id, value, null)
  else loadCategorias(formValue.value.setor_solicitante_id, null, true)
}, { immediate: true })

</script>