<template>
  <CustomText title="Categoria" class="ml-3 " color="#118B9F" size="18" :bold="true" />
  <v-row class="pa-3 mb-n6">
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
        :disabled="!formValue.setor_id || !formValue.empresa_id"
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

const selectedCategories = computed(() => categorias.value.filter((categoria) => categoria.grupo_id === formValue.value.grupo_id))

const processNfFile = async (file) => {

  loadingProcessFile.value = true
  try {
    const { nf, cpf_emitente, chave_acesso, cnpj_emitente, allIsNull, valor_total } = await getFileContent(file)

    if (allIsNull) return $toast.error('Não foi possível ler o arquivo', { autoClose: 2500 })

    formValue.value.chave_nf = chave_acesso ?? null
    formValue.value.numero_nf = nf ?? null
    formValue.value.valor_total = parseFloat(valor_total)

    validDocument(cpf_emitente, cnpj_emitente)

  } catch (error) {
    console.error('Erro ao processar arquivo NF:', error.message)
    $toast.error(error.message)
  } finally {
    loadingProcessFile.value = false
  }
}

const findFornecedorByDocumento = async (documento) => {
  return fornecedores.find((fornecedor) => fornecedor.documento === documento)
}

const validDocument = async (cpf_emitente, cnpj_emitente) => {
  if (cpf_emitente || cnpj_emitente) {

    let documento = cpf_emitente ?? cnpj_emitente

    documento = documento.replace(/\D/g, '')

    const fornecedor = await findFornecedorByDocumento(documento)

    if (find) {

      const payload = {
        id: fornecedor.id,
        nome: fornecedor.razao_social,
        apelido: fornecedor.nome_fantasia,  
        documento: cpf_emitente ? maskCpf(cpf_emitente) : maskCnpj(cnpj_emitente),
        tipo: cpf_emitente ? 'fisico' : 'juridico',
        internacional: fornecedor.internacional
      }

      formValue.value.fornecedor = payload
    }
  } 

}

const clearFornecedor = () => {
  for (const key in formValue.value.fornecedor) {
    if (key === 'internacional') continue
    formValue.value.fornecedor[key] = null
  }
}

const defineFileTitle = (fileName) => fileName.length > 20 ? fileName.replace(/.\w+$/g, '') : fileName

watch(() => formValue.value.nf, async (value) => {
    if(route.params.id) return
    if (value && value.length > 0) await processNfFile(value[0])
  }
)

watch(() => formValue.value.grupo_id, async (newValue, oldValue) => {
  
  if (oldValue && newValue !== oldValue) {
    formValue.value.categoria_id = null
    await categoriaRef?.value?.click()
  }

},{ immediate: true })

const loadCategorias = async (setor_id, internacional) => {
  try {

    if(!setor_id) return

    const { success, message, data } = await getCategoriasUsuario(setor_id, internacional)
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

watch(() => formValue.value.setor_id, async (value) => {
  if(value) loadCategorias(value)
},{ immediate: true })

onMounted(() => {
  if (formValue.value.setor_id) loadCategorias(formValue.value.setor_id)
})

watch(() => formValue.value.fornecedor.internacional, async (value) => {
  if (value) loadCategorias(formValue.value.setor_id, value)
  else loadCategorias(formValue.value.setor_id)
},{ immediate: true })

</script>
