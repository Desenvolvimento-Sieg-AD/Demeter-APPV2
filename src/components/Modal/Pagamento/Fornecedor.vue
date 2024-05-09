<template>
  <v-row class="pa-3" v-if="!formValue.fornecedor.internacional">
    <v-col cols="12" md="3">
      <CustomInput
        :required="!formValue.fornecedor.internacional"
        type="text"
        hide-details
        :label="documentFornecedor"
        v-model="formValue.fornecedor.documento"
        append-inner-icon="mdi-content-copy"
        @click:append-inner="pasteFromClipboard"
        @change="verifyFornecedor"
        :mask="form.fornecedor.tipo === 'fisico' ? 'cpf' : 'cnpj'"
      />
    </v-col>

    <v-col cols="12" md="3">
      <CustomInput
        :required="!formValue.fornecedor.internacional"
        hide-details
        type="select"
        itemTitle="nome"
        itemValue="value"
        label="Tipo fornecedor"
        :items="tiposFornecedor"
        v-model="formValue.fornecedor.tipo"
        :disabled="formValue.fornecedor.nome !== null"
        append-inner-icon="mdi-card-account-details-outline"
      />
    </v-col>

    <v-col cols="12" md="6">
      <CustomInput
        :required="!formValue.fornecedor.internacional"
        hideDetails
        type="combobox"
        label="Fornecedor"
        :items="fornecedores"
        itemValue="razao_social"
        itemTitle="razao_social"
        @change=";[verifyFornecedor()]"
        v-model="formValue.fornecedor.nome"
        append-inner-icon="mdi-shopping-outline"
      />
    </v-col>

    <v-col cols="12" md="3">
      <CustomInput type="text" label="Número NF/Cupom" v-model="form.numero_nf" mask="numero-nf" />
    </v-col>

    <v-col cols="12" md="9">
      <CustomInput type="text" label="Chave de Acesso" v-model="form.chave_nf" :max="48" mask="number" />
    </v-col>
  </v-row>

  <v-row v-else class="pa-3">
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
import { getFornecedor, getFornecedorByDocumentOrName } from '@api'

const { $toast } = useNuxtApp()

const fornecedores = ref((await getFornecedor()).data)

const props = defineProps({
  form: { type: Object, required: true }
})

const formValue = computed({
  get: () => props.form,
  set: (value) => emit('update:form', value)
})

const route = useRoute()

const hasID = computed(() => route.params.id)

const verifyFornecedor = async () => {
  try {
    const { success, message, data } = await getFornecedorByDocumentOrName(formValue.value.fornecedor.documento, formValue.value.fornecedor.nome)

    if (!success) throw new Error(message)

    if (data) getDataFornecedor(data)
  } catch (error) {
    console.error('Erro ao buscar fornecedor:', error)
    $toast.error('Erro ao buscar fornecedor')
  }
}

const getDataFornecedor = (data) => {
  clearFornecedor()

  formValue.value.fornecedor.id = data.id
  formValue.value.fornecedor.nome = data.razao_social
  formValue.value.fornecedor.apelido = data.nome_fantasia
  formValue.value.fornecedor.tipo = data.internacional ? null : data.tipo
  formValue.value.fornecedor.documento = data.internacional ? null : data.documento
  formValue.value.fornecedor.internacional = data.internacional

  console.log(data)

  if (!formValue.value.fornecedor.documento) return

  if (data.tipo === 'fisico') formValue.value.fornecedor.documento = maskCpf(data.documento)
  else formValue.value.fornecedor.documento = maskCnpj(data.documento)
}

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
  },
  { deep: true, immediate: true }
)
</script>
