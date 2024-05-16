<template>
  <v-row class="pa-3">
    <v-col cols="2" md="3">
      <CustomInput 
        required
        hide-details
        itemValue="id"
        v-model="formValue.grupo_id" 
        :items="grupos" 
        itemTitle="nome" 
        type="autocomplete" 
        label="Grupo do pedido" 
        :disabled="!formValue.setor_id"
      />
    </v-col>

    <v-col cols="4" md="3">
      <CustomInput
        required
        hide-details
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

    <v-col cols="12" md="6">
      <CustomInput
        type="file"
        hide-details
        v-model="form.nf"
        :loading="loadingProcessFile"
        :disabled="!form.categoria_id || formValue.fornecedor.internacional"
        label="Nota fiscal/Cupom fiscal"
        accept="image/*,application/pdf"
        append-inner-icon="mdi-file-upload-outline"
      >
        <template #selection="{ fileNames }">
          <span class="text-truncate">{{ defineFileTitle(fileNames[0]) }}</span>
        </template>
      </CustomInput>
    </v-col>
  </v-row>
</template>

<script setup>
import { getFileContent } from '@api/conversor'
import { getFornecedor, getCategoriasByGrupo, getCategoriasUsuario } from '@api'

const route = useRoute()

const { $toast } = useNuxtApp()
const { data: fornecedores } = await getFornecedor()

const grupos = ref([])
const categorias = ref([])

const emit = defineEmits(['update:form'])

const props = defineProps({ form: { type: Object, required: true } })
const categoriaRef = ref(null)
const loadingProcessFile = ref(false)

const formValue = computed({
  get: () => props.form,
  set: (value) => emit('update:form', value)
})

const selectedCategories = computed(() => {
  return categorias.value.filter((categoria) => categoria.grupo_id === formValue.value.grupo_id)
})

function setFornecedorDocumentData(cpf_emitente, cnpj_emitente) {
  if (cpf_emitente) {
    formValue.value.fornecedor.documento = cpf_emitente
    formValue.value.fornecedor.tipo = 'fisico'
  } else if (cnpj_emitente) {
    formValue.value.fornecedor.documento = cnpj_emitente
    formValue.value.fornecedor.tipo = 'juridico'
  } else {
    formValue.value.fornecedor.documento = null
    formValue.value.fornecedor.tipo = null
  }
}

const processNfFile = async (file) => {
  if (route.params.id) return

  clearFornecedor()
  loadingProcessFile.value = true
  try {
    const { nf, cpf_emitente, chave_acesso, cnpj_emitente, allIsNull, valor_total } = await getFileContent(file)

    if (allIsNull) return $toast.error('Não foi possível ler o arquivo', { autoClose: 2500 })

    setFornecedorDocumentData(cpf_emitente, cnpj_emitente)

    formValue.value.chave_nf = chave_acesso ?? null
    formValue.value.numero_nf = nf ?? null
    formValue.value.valor_total = parseFloat(valor_total)

    validDocument()
  } catch (error) {
    console.error('Erro ao processar arquivo NF:', error.message)
    $toast.error(error.message)
  } finally {
    loadingProcessFile.value = false
  }
}

const findFornecedorByDocumento = (documento) => {
  return fornecedores.find((fornecedor) => fornecedor.documento === documento)
}

const validDocument = () => {
  if (!formValue.value.fornecedor.documento) {
    formValue.value.fornecedor.tipo = null
    return
  }

  const documento = formValue.value.fornecedor.documento.replace(/\D/g, '')
  const find = findFornecedorByDocumento(documento)

  if (find) {
    formValue.value.fornecedor.id = find.id
    formValue.value.fornecedor.nome = find.razao_social

    if (find.tipo === 'fisico') {
      formValue.value.fornecedor.documento = maskCpf(find.documento)
    } else {
      formValue.value.fornecedor.documento = maskCnpj(find.documento)
    }

    formValue.value.fornecedor.tipo = find.internacional ? null : find.tipo
    formValue.value.fornecedor.internacional = find.internacional
  }
}

const clearFornecedor = () => {
  for (const key in formValue.value.fornecedor) {
    if (key === 'internacional') continue
    formValue.value.fornecedor[key] = null
  }
}

const defineFileTitle = (fileName) => {
  if (fileName.length > 20) return fileName.replace(/.\w+$/g, '')
  return fileName
}

watch(() => formValue.value.setor_id, async (value) => {
  if(value) loadCategorias(value)
},{ immediate: true })

watch(
  () => formValue.value.nf,
  async (value) => {
    if (value && value.length > 0) await processNfFile(value[0])
  }
)

watch(
  () => formValue.value.grupo_id,
  async (newValue, oldValue) => {
    if (oldValue && newValue !== oldValue) {
      formValue.value.categoria_id = null
      await categoriaRef?.value?.click()
    }
  },
  { immediate: true }
)

const loadCategorias = async (setor_id) => {
  try {
    const { success, message, data } = await getCategoriasUsuario(setor_id)
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
  } catch (error) {
    console.error('Erro ao buscar categorias:', error.message)
    $toast.error(error.message)
  }
}

onMounted(() => {
  if (formValue.value.setor_id) loadCategorias(formValue.value.setor_id)
})
</script>
