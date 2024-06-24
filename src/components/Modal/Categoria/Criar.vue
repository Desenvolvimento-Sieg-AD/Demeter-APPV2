<template>
    <LazyModal v-model:enable="enableValue" title="Criar Categoria" :actions="modalActions" width="600">
        <template #content>
            <v-card>
                <v-card-text>
                    <v-col>
                        <v-row no-gutters   >
                            <CustomInput v-model="categoria.nome" label="Nome da Categoria" />
                            <CustomInput type="checkbox" v-model="categoria.internacional" label="Internacional" />
                        </v-row>
                        <CustomInput v-model="categoria.descricao" label="Descrição da Categoria" />
                        <CustomInput type="autocomplete" v-model="categoria.grupo_id" label="Grupo da Categoria" :items="grupos" itemTitle="nome" itemValue="id" />
                        <CustomInput type="combobox" v-model="categoria.empresas_id" label="Empresa da Categoria" :items="empresas" itemTitle="nome" itemValue="id" multiple />
                        <CustomInput type="combobox" v-model="categoria.setores_id" label="Setor da Categoria" :items="setores" itemTitle="nome" itemValue="id" multiple />
                    </v-col>
                </v-card-text>
            </v-card>
        </template>
    </LazyModal>
</template>
<script setup>

const { $toast } = useNuxtApp()

import { getGrupos, getEmpresa, createCategoria, getSetoresPadrao } from '@api'

const emit = defineEmits(['close']);

const props = defineProps({
    enable: { type: Boolean, default: false },
});

const categoria = reactive({
    nome: null,
    descricao: null,
    grupo_id: null,
    empresas_id: [],
    setores_id: [],
    internacional: false
})

const grupos = ref([])
const empresas = ref([])
const setores = ref([])

const enableValue = computed({
    get: () => props.enable,
    set: (value) => emit('update:enable', value),
});

const modalActions = [
    {
        icon: 'mdi-close',
        title: 'Cancelar',
        type: 'cancel',
        click: () => enableValue.value = false
    },
    {
        icon: 'mdi-check',
        title: 'Confirmar',
        type: 'success',
        click: async () => await createCategory()
    }
]

const getGrupo = async () => {
    try {
        const { success, message, data } = await getGrupos()

        if(!success) throw new Error(message)

        grupos.value = data
    } catch (error) {
        $toast.error(error.message)
    }
}

const getEmpresas = async () => {
    try {
        const { success, message, data } = await getEmpresa()

        if(!success) throw new Error(message)

        empresas.value = data
    } catch (error) {
        $toast.error(error.message)
    }
}

const getSetores = async () => {
    try {
        const { success, message, data } = await getSetoresPadrao()

        if(!success) throw new Error(message)

        setores.value = data
    } catch (error) {
        $toast.error(error.message)
    }
}

const createCategory = async () => {
    try {
        const { success, message } = await createCategoria(categoria)

        if(!success) throw new Error(message)

        $toast.success(message)
        enableValue.value = false

        emit('close')

    } catch (error) {
        $toast.error(error.message)
    }
}

onMounted( async () => await Promise.all([ getGrupo(), getEmpresas(), getSetores() ]) )

</script>
<style scoped>

</style>