<template>
  <LazyModal v-model:enable="enableValue" :actions="actions" title="Anexar arquivo" width="600">
    <template #content>
      <v-container>
        <div class="d-flex justify-center">
          <CustomText title="Dados do pagamento" class="ml-2" color="#F68A1A" size="20" :bold="true" />
        </div>
        <v-form ref="formValidate">
          <v-row no-gutters class="mt-5 ga-2">
            <v-col>
              <CustomInput label="Fornecedor" v-model="item.fornecedor.razao_social" disabled />
            </v-col>
            <v-col>
              <CustomInput label="Categoria" v-model="item.categoria.nome" disabled />
            </v-col>
          </v-row>

          <v-row no-gutters class="ga-2">
            <v-col>
              <CustomInput label="Empresa Pagadora" v-model="item.empresa.apelido" disabled />
            </v-col>
            <v-col>
              <CustomInput label="Valor" v-model="item.valor_total" disabled mask="money" />
            </v-col>
          </v-row>

          <v-row no-gutters>
            <v-col>
              <CustomInput label="Motivo" v-model="item.motivo" disabled />
            </v-col>
          </v-row>

          <v-row no-gutters> </v-row>

          <v-row no-gutters justify="center">
            <p class="text-body-2 text-center text-grey">
              {{ nameFile }}
            </p>
          </v-row>

          <v-row no-gutters class="w-100 mt-5">
            <v-col>
              <CustomInput
                type="file"
                :label="tipo_anexo_id == 3 ? 'Anexar NF' : 'Anexar documento'"
                v-model="anexo"
                hide-details
                prependInnerIcon="mdi-paperclip"
                accept="image/*,application/pdf"
              >
                <template #selection="{ fileNames }">
                  <span class="text-truncate">{{ defineFileTitle(fileNames[0]) }}</span>
                </template>
              </CustomInput>
            </v-col>
          </v-row>
        </v-form>
      </v-container>
    </template>
  </LazyModal>
</template>

<script setup>
//* IMPORTS
import { createArquivo } from '@api'
const { $toast } = useNuxtApp()

const dayjs = useDayjs()

//* PROPS
const props = defineProps({
  enable: { type: Boolean, default: false },
  message: { type: String, default: '' },
  title: { type: String, default: 'Upload NF' },
  item: { type: Object, required: true },
  tipo_anexo_id: { type: String, default: null }
})

//* REFS
const anexo = ref(null)
const loading = ref(false)
const formValidate = ref(null)

//* COMPUTED
const actions = computed(() => [
  {
    icon: 'mdi-close',
    title: 'Fechar',
    type: 'grey',
    click: async () => {
      enableValue.value = false
    }
  },
  {
    icon: 'mdi-check',
    title: 'Enviar',
    type: 'success',
    loading: loading.value,
    click: () => sendUpload()
  }
])

//* EMITS

const emit = defineEmits(['close', 'update', 'nameFile'])

//* METHODS

const nameFile = computed(() => {
  if(props.tipo_anexo_id == 3) return `${dayjs().format('YYYYMMDD')} - ${props.item.fornecedor.razao_social} - ${formatCurrency(props.item.valor_total)} - NF `
  return `${dayjs().format('YYYYMMDD')} - ${props.item.fornecedor.razao_social} - ${formatCurrency(props.item.valor_total)} - ${props.item.tipo_pagamento.nome} `
})

const sendUpload = async () => {
  if (!anexo.value) return $toast.error('Selecione um arquivo para enviar')

  loading.value = true

  try {
    const formData = new FormData()

    formData.append('file', anexo.value)
    formData.append('name_file', nameFile.value)
    formData.append('tipo_anexo_id', props.tipo_anexo_id)

    const { success, message } = await createArquivo(formData, props.item.id)

    if (!success) throw new Error(message)

    $toast.success('Arquivo enviado com sucesso')

    loading.value = false
    enableValue.value = false

    emit('update')
  } 
	catch (error) {
    loading.value = false
    console.error(error)
    $toast.error('Erro ao enviar o arquivo')
  }
}

const enableValue = computed({
  get: () => props.enable,
  set: (value) => emit('update:enable', value)
})

// * Definir o titulo do arquivo pois se deixar o tamanho original e for maior que tamanho 20, o nome ultrapassa o tamanho do input
const defineFileTitle = (fileName) => {
  if (fileName.length > 20) {
    return fileName.replace(/.\w+$/g, '')
  }
  return fileName
}

watch(() => props.enable, (value) => {
    if (!value) anexo.value = null
  }
)
</script>

<style scoped>
.txt-center {
  text-align: center;
}
</style>
