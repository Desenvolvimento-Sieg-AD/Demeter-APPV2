<template>
  <v-row no-gutters justify="space-between" align="center" class="mb-n14 mr-2">
    <CustomText title="Fornecedor" class="ml-2 mb-n5 mt-n10" color="secondary" size="18" :bold="true" />
    <CustomInput type="checkbox" v-model="form.fornecedor.internacional" label="Internacional" :disabled="route.params.id" />
  </v-row>
  <v-row class="pa-2" v-if="!formValue.fornecedor.internacional">
    <v-col cols="12" md="3">
      <CustomInput
        type="file"
        hide-details
        v-model="formValue.nf"
        :loading="loadingProcessFile"
        color="primary"
        :disabled="formValue.fornecedor.internacional || !formValue.setor_solicitante_id || !formValue.empresa_id"
        label="Nota fiscal/Cupom fiscal"
        accept="image/*,application/pdf"
        append-inner-icon="mdi-file-upload-outline"
      >
        <template #selection="{ fileNames }">
          <span class="text-truncate">{{ defineFileTitle(fileNames[0]) }}</span>
        </template>
      </CustomInput>
    </v-col>

    <v-col cols="12" md="3">
      <CustomInput type="text" label="Número NF/Cupom" v-model="form.numero_nf" mask="numero-nf" />
    </v-col>

    <v-col cols="12" md="6">
      <CustomInput type="text" label="Chave de Acesso" v-model="form.chave_nf" :max="52" mask="chave" />
    </v-col>

    <v-col cols="12" md="3" class="mt-n7">
      <CustomInput
        :required="!formValue.fornecedor.internacional"
        type="text"
        :label="documentFornecedor"
        v-model="formValue.fornecedor.documento"
        append-inner-icon="mdi-content-copy"
        @click:append-inner="pasteFromClipboard"
        @blur="verifyFornecedor('documento')"
        :mask="form.fornecedor.tipo === 'fisico' ? 'cpf' : 'cnpj'"
      />
    </v-col>

    <v-col cols="12" md="3" class="mt-n7">
      <CustomInput
        :required="!formValue.fornecedor.internacional"
        hide-details
        type="select"
        itemTitle="nome"
        itemValue="value"
        label="Tipo fornecedor"
        :items="tiposFornecedor"
        v-model="formValue.fornecedor.tipo"
        append-inner-icon="mdi-card-account-details-outline"
      />
    </v-col>

    <v-col cols="12" md="6" class="mt-n7">
      <CustomInput
        :required="!formValue.fornecedor.internacional"
        hideDetails
        type="combobox"
        label="Fornecedor"
        :items="fornecedores"
        itemValue="razao_social"
        itemTitle="razao_social"
        @blur="verifyFornecedor('nome')"
        v-model="formValue.fornecedor.nome"
        append-inner-icon="mdi-shopping-outline"
      />
    </v-col>
  </v-row>

  <v-row v-else class="pa-3 mb-n10">
    <v-col>
      <CustomInput
        required
        hideDetails
        type="combobox"
        label="Fornecedor"
        :items="fornecedores"
        itemValue="razao_social"
        itemTitle="razao_social"
        v-model="formValue.fornecedor.nome"
        append-inner-icon="mdi-shopping-outline"
      />
    </v-col>

    <v-col>
      <CustomInput type="text" label="Número Invoice" v-model="form.numero_nf" />
    </v-col>
  </v-row>
</template>
<script setup>
import { getFileContent } from '@api/conversor'
import { getFornecedor, getFornecedorByDocumentOrName } from '@api'

const { $toast } = useNuxtApp()

const props = defineProps({ form: { type: Object, required: true } })

const route = useRoute()

const formValue = computed({
  get: () => props.form,
  set: (value) => emit('update:form', value)
})
const fornecedores = ref([])

const loadingProcessFile = ref(false)

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

const findFornecedorByDocumento = async (documento) => {
  return fornecedores.value.find((fornecedor) => fornecedor.documento === documento)
}

const verifyFornecedor = async (type) => {
  try {
    const documento = formValue.value.fornecedor.documento ? formValue.value.fornecedor.documento.replace(/\D/g, '') : null
    const nome = formValue.value.fornecedor.nome

    if (nome && formValue.value.fornecedor.id && type === 'nome') {
      const fornecedor = fornecedores.value.find((f) => f.razao_social === nome)
      await getDataFornecedor(fornecedor)
    }

    if (type === 'documento') {
      const { data } = await getFornecedorByDocumentOrName(documento, null, formValue.value.fornecedor.internacional)

      if (data) {
        await getDataFornecedor(data)
      } else {
        formValue.value.fornecedor.nome = null
        formValue.value.fornecedor.id = null
      }
    } else if (type === 'nome') {
      const { data } = await getFornecedorByDocumentOrName(null, nome, formValue.value.fornecedor.internacional)

      if (data) {
        await getDataFornecedor(data)
      } else {
        formValue.value.fornecedor.id = null
      }
    }
  } catch (error) {
    console.error('Erro ao buscar fornecedor:', error)
    $toast.error('Erro ao buscar fornecedor')
  }
}

const defineFileTitle = (fileName) => (fileName.length > 20 ? fileName.replace(/.\w+$/g, '') : fileName)

const getDataFornecedor = async (fornecedor) => {
  for (const key in formValue.value.fornecedor) {
    if (key === 'internacional') continue
    formValue.value.fornecedor[key] = fornecedor[key]
    formValue.value.fornecedor.nome = fornecedor.razao_social

    if (fornecedor.tipo === 'fisico') formValue.value.fornecedor.documento = maskCpf(fornecedor.documento)
    else formValue.value.fornecedor.documento = maskCnpj(fornecedor.documento)
  }
}

const getFornecedores = async () => {
  try {
    const { success, message, data } = await getFornecedor()
    if (!success) throw new Error(message)

    fornecedores.value = data
  } catch (error) {
    console.error('Erro ao buscar fornecedores:', error)
    $toast.error('Erro ao buscar fornecedores')
  }
}

onMounted(() => getFornecedores())

const documentFornecedor = computed(() => {
  const tipo = formValue.value.fornecedor?.tipo

  if (!tipo || tipo == 'juridico') return 'CNPJ'
  else if (tipo == 'fisico') return 'CPF'
  else return 'CNPJ'
})

function getTiposFornecedor() {
  return [
    { nome: 'Pessoa Jurídica', value: 'juridico' },
    { nome: 'Pessoa Física', value: 'fisico' }
  ]
}

const tiposFornecedor = getTiposFornecedor()

const pasteFromClipboard = async () => {
  try {
    const text = await navigator.clipboard.readText()
    formValue.fornecedor.documento = text
  } catch (error) {
    console.error('Erro ao acessar a área de transferência:', error)
  }
}

const clearFornecedor = () => {
  for (const key in formValue.value.fornecedor) {
    if (key === 'internacional') continue
    formValue.value.fornecedor[key] = null
  }
}

watch(
  () => formValue.value.fornecedor.internacional,
  async (value) => {
    clearFornecedor()

    const { data } = await getFornecedor(value)
    fornecedores.value = data
  }
)

watch(
  () => formValue.value.nf,
  async (value) => {
    if (route.params.id) return
    if (value && value.length > 0) await processNfFile(value[0])
  }
)
</script>
<style scoped></style>
