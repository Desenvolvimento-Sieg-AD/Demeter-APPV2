<template>
  <LazyModal v-model:enable="enableValue" :title="title" :actions="modalActions" width="auto">
    <template #content>
      <div height="calc(100vh - 340px)" style="overflow-x: hidden; overflow-y: auto" class="pa-2">
        <v-row dense>
          <CustomText title="Informações" color="#118B9F" size="18" bold />
        </v-row>

        <v-row>
          <v-col cols="8">
            <CustomInput v-model="categoria.nome" label="Nome da Categoria" hide-details="auto" />
          </v-col>

          <v-col cols="2">
            <CustomInput type="checkbox" v-model="categoria.internacional" label="Internacional" hide-details />
          </v-col>

          <v-col cols="2">
            <CustomInput type="checkbox" v-model="categoria.nacional" label="Nacional" hide-details />
          </v-col>

          <v-col cols="7">
            <CustomInput type="autocomplete" v-model="categoria.grupo_id" label="Grupo da Categoria" :items="grupos" itemTitle="nome" itemValue="id" hide-details="auto" />
          </v-col>

          <v-col cols="3">
            <CustomInput type="checkbox" v-model="categoria.requer_projeto" label="Projeto Obrigatório" hide-details />
          </v-col>

          <v-col cols="2">
            <CustomInput type="checkbox" v-model="categoria.ativo" label="Ativo" hide-details />
          </v-col>

          <v-col cols="12">
            <CustomInput v-model="categoria.descricao" label="Descrição da Categoria" hide-details />
          </v-col>

          <v-col cols="12">
            <CustomInput
              type="combobox"
              chips
              color="primary"
              v-model="categoria.setores_id"
              label="Setores da Categoria"
              :items="setores"
              itemTitle="nome"
              itemValue="id"
              multiple
              hide-details="auto"
            />
          </v-col>
        </v-row>

        <v-divider class="my-3" />

        <v-row dense class="mb-4">
          <CustomText title="Integrações" color="#118B9F" size="18" bold />
        </v-row>

        <v-row v-for="(integracao, index) of categoria.empresas_id" :key="index" dense>
          <v-col cols="8">
            <CustomInput type="autocomplete" v-model="integracao.empresa_id" label="Empresa" :items="empresas" itemTitle="nome" itemValue="id" :itemProps="itemProps" />
          </v-col>

          <v-col cols="4">
            <CustomInput v-model="integracao.codigo_cliente_omie" label="Código de Integração" max="10" />
          </v-col>

          <!-- <v-btn color="red" @click="removeIntegracao(index, integracao.empresa_id)" size="39"> <v-icon>mdi-delete</v-icon> </v-btn>
            <v-btn color="success" @click="addIntegracao(integracao)" size="39"> <v-icon>mdi-plus</v-icon> </v-btn> -->
        </v-row>
      </div>
    </template>
  </LazyModal>
</template>
<script setup>
const { $toast } = useNuxtApp()

import { getGrupos, getEmpresa, createCategoria, getSetoresPadrao, getCategoriaById, updateCategoria } from '@api'

const emit = defineEmits(['close'])

const props = defineProps({
  enable: { type: Boolean, default: false },
  categoria_id: { type: Number, default: null }
})

const title = computed(() => (props.categoria_id ? 'Editar Categoria' : 'Criar Categoria'))

const integracao = reactive({
  empresa_id: null,
  codigo_cliente_omie: null
})

const categoria = reactive({
  nome: null,
  descricao: null,
  ativo: true,
  nacional: false,
  requer_projeto: false,
  grupo_id: null,
  empresas_id: [integracao],
  setores_id: [],
  internacional: false
})

const grupos = ref([])
const empresas = ref([])
const empresasIntegracao = ref([])
const setores = ref([])

const enableValue = computed({
  get: () => props.enable,
  set: (value) => emit('update:enable', value)
})

const modalActions = [
  {
    icon: 'mdi-close',
    title: 'Cancelar',
    type: 'cancel',
    click: () => (enableValue.value = false)
  },
  {
    icon: 'mdi-check',
    title: 'Confirmar',
    type: 'success',
    click: () => createOrUpdateCategory()
  }
]

const getGrupo = async () => {
  try {
    const { success, message, data } = await getGrupos()

    if (!success) throw new Error(message)

    grupos.value = data
  } catch (error) {
    console.error(error)
    $toast.error('Erro ao buscar grupos')
  }
}

const getEmpresas = async () => {
  try {
    const { success, message, data } = await getEmpresa()

    if (!success) throw new Error(message)

    empresas.value = data
    empresasIntegracao.value = data
  } catch (error) {
    console.error(error)
    $toast.error('Erro ao buscar empresas')
  }
}

const getSetores = async () => {
  try {
    const { success, message, data } = await getSetoresPadrao()

    if (!success) throw new Error(message)

    setores.value = data
  } catch (error) {
    console.error(error)
    $toast.error('Erro ao buscar setores')
  }
}

const createOrUpdateCategory = async () => {
  if (props.categoria_id) return await updateCategory()
  return await createCategory()
}

const createCategory = async () => {
  try {
    if (categoria.empresas_id.length === 0) {
      categoria.empresas_id = null
    }

    const { success, message } = await createCategoria(categoria)

    if (!success) throw new Error(message)

    $toast.success(message)
    enableValue.value = false

    emit('close')
  } catch (error) {
    console.error(error)
    $toast.error('Erro ao criar categoria')
  }
}

const updateCategory = async () => {
  try {
    categoria.empresas_id.forEach((integracao) => {
      if (integracao.empresa_id === null && integracao.codigo_cliente_omie === null) {
        categoria.empresas_id = null
      }
    })

    const { success, message } = await updateCategoria(props.categoria_id, categoria)

    if (!success) throw new Error(message)

    $toast.success(message)
    enableValue.value = false

    emit('close')
  } catch (error) {
    console.error(error)
    $toast.error('Erro ao atualizar categoria')
  }
}

const getCategoria = async () => {
  if (!props.categoria_id) return

  try {
    const { success, message, data } = await getCategoriaById(props.categoria_id)

    if (!success) throw new Error(message)

    Object.assign(categoria, {
      nome: data.nome,
      descricao: data.descricao,
      ativo: data.ativo,
      nacional: data.nacional,
      internacional: data.internacional,
      requer_projeto: data.requer_projeto,
      grupo_id: data.grupo_id
    })

    if (data.categorias_empresa.length > 0) {
      categoria.empresas_id = data.categorias_empresa
      empresas.value.forEach((empresa) => {
        empresa.disabled = data.categorias_empresa.some((integracao) => integracao.empresa_id === empresa.id)
      })
    }

    categoria.setores_id = data.categorias_setor.map((setor) => setor.setor_id)
  } catch (error) {
    console.error(error)
    $toast.error('Erro ao buscar categoria')
  }
}

const removeIntegracao = (index, empresa_id) => {
  if (index === 0 && !props.categoria_id) return

  categoria.empresas_id.splice(index, 1)

  empresas.value.forEach((empresa) => {
    if (empresa.id === empresa_id) empresa.disabled = false
  })
}

const addIntegracao = (integracao) => {
  const { empresa_id, codigo_cliente_omie } = integracao

  if (categoria.empresas_id.length === empresas.value.length) return $toast.error('Limite de integrações atingido')

  if (!empresa_id || !codigo_cliente_omie) return $toast.error('Preencha os campos')

  categoria.empresas_id.push({ empresa_id: null, codigo_cliente_omie: null, ativo: true })

  empresas.value.forEach((empresa) => {
    if (empresa.id === empresa_id) {
      empresa.disabled = true
    }
  })
}

const itemProps = (item) => {
  return { disabled: item.disabled }
}

onMounted(async () => await Promise.all([getCategoria(), getGrupo(), getEmpresas(), getSetores()]))
</script>
<style scoped></style>
