<template>
    <div>
        <CustomHeader title="Configuração de Categorias por Setor" />
        <LayoutForm>
            <CustomTableSelect
                ref="categoriasTable"
                :columns="columns"
                :items="setores"
                :actions="actions"
                :loading="loadingTable"
                scrolling="standard"
                noDataText="Nenhum setor cadastrado"
                choose-columns
                store-state
                key-stored="categorias-table"
                allowColumnResizing
                enableAddButton
                @add="enableModal.create = true"
                allow-column-reordering
            >
                <template #item-nome="{data: { data: item } } ">
                    <v-chip :text="item.nome" :color="colors[item.nome]" variant="flat"/>
                </template>
                <template #item-sigla="{data: { data: item } } ">
                    <v-chip :text="item.sigla" :color="colors[item.nome]" variant="flat"/>
                </template>
                <template #[`item-usuarios.length`]="{data: { data: item } } ">
                    <v-chip :text="item.usuarios.length" color="primary" variant="flat"/>
                    <v-tooltip v-for="(usuario, index) in item.usuarios" :key="index" :text="textUser(item.usuarios)" activator="parent" location="top"/>
                </template>
                <template #item-categorias="{data: { data: item } } ">
                    <v-chip :text="categoriasLength(item.grupo_categoria)" color="primary" variant="flat"/>
                </template>
            </CustomTableSelect>
        </LayoutForm>
        <LazyModalCategoriaEditar v-if="enableModal.edit" v-model:enable="enableModal.edit" :setor="setorSelected" @close="getSetores()" />
        <LazyModalCategoriaCriar v-if="enableModal.create" v-model:enable="enableModal.create" @close="getSetores()"/>
    </div>
</template>
<script setup>
import { getSetoresCategorias } from "@api"

const { $toast } = useNuxtApp()
const setores = ref([])
const columns = getColumns('setores')
const loadingTable = ref(false)
const setorSelected = ref({})

const enableModal = reactive({ edit: false, create: false })

const colors = {
    Desenvolvimento: '#FFC107',
    Produção: '#4CAF50',
    Gerência: '#9C27B0',
    'Recursos Humanos': '#FF5722',
    Marketing: '#2196F3',
    Administrativo: '#607D8B',
    Financeiro: '#795548',
    Compras: '#FF9800',
    Comercial: '#E91E63',
    Licitação: '#9E9E9E',
    Cliente: '#00BCD4',
    Qualidade: '#8BC34A',
    Logística: '#FFEB3B',
}

const actions = [
    {
        icon: 'mdi-pencil',
        tooltip: 'Editar categorias do setor',
        color: 'primary',
        click: (item) => {
            enableModal.edit = true
            setorSelected.value = item
        }
    }
]

const getSetores = async () => {
    loadingTable.value = true
    try {
        const { success, message, data } = await getSetoresCategorias()

        if(!success) throw new Error(message)

        setores.value = data

        loadingTable.value = false

    } catch (error) {
        console.error(error.message)
        $toast.error('Erro ao buscar setores')
    }
}

const categoriasLength = (grupos) => grupos.reduce((acc, grupo) => { return acc + grupo.categorias.length }, 0)

const textUser = (usuarios) => usuarios.map((usuario) => usuario.sigla).join(', ')

await getSetores()

</script>
<style scoped>

</style>