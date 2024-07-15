<template>
    <div>
        <LayoutForm>
            <CustomTableSelect
                ref="categoriasTable"
                :columns="columns"
                :items="categorias"
                :actions="actions"
                :loading="loadingTable"
                scrolling="standard"
                noDataText="Nenhuma categoria cadastrada"
                choose-columns
                store-state
                key-stored="categorias-table"
                allowColumnResizing
                :allowed-page-sizes="[15, 30, 60, 100]"
                :page-size="30"
                pager
                enableAddButton
                @add="enableModal.create = true"
                allow-column-reordering
            >
            <template #[`item-grupo.nome`]="{data: { data: item } } ">
                <v-chip :text="item.grupo.nome" color="primary" variant="tonal"/>
            </template>

            <template #item-nacional="{data: { data: item } } ">
                <v-chip :text="item.nacional ? 'Sim' : 'Não'" :color="item.nacional ? 'success' : 'red'" variant="flat"/>
            </template>

            <template #item-internacional="{data: { data: item } } ">
                <v-chip :text="item.internacional ? 'Sim' : 'Não'" :color="item.internacional ? 'success' : 'red'" variant="flat"/>
            </template>

            <template #item-descricao="{data: { data: item } } ">
                <p> {{ item.descricao ?? '-' }}</p>
            </template>

            <template #item-ativo="{data: { data: item } } ">
                <v-chip :text="item.ativo ? 'Ativo' : 'Inativo'" :color="item.ativo ? 'success' : 'red'" variant="flat"/>
            </template>

            <template #item-requer_projeto="{data: { data: item } } ">
                <v-chip :text="item.requer_projeto ? 'Sim' : 'Não'" :color="item.requer_projeto ? 'success' : 'red'" variant="flat"/>
            </template>

            </CustomTableSelect>
        </LayoutForm>
        <LazyModalCategoriaCriar v-if="enableModal.create" v-model:enable="enableModal.create" @close="getCategorias()" :categoria_id="categoria_id"/>
    </div>
</template>
<script setup>

import { getCategoriasWithGrupo } from '@api'

const { $toast } = useNuxtApp()

const categorias = ref([])
const columns = getColumns('categorias')
const loadingTable = ref(false)
const categoria_id = ref(null)

const actions = [
    {
        icon: 'mdi-pencil',
        color: 'primary',
        tooltip: 'Editar',
        click: (item) => {
            enableModal.create = true
            categoria_id.value = item.id
        }
    }
]

const enableModal = reactive({ edit: false, create: false })

watch(() => enableModal.create, (value) => {
    if(!value) categoria_id.value = null
})

const getCategorias = async () => {
    try {
        const { success, message, data } = await getCategoriasWithGrupo()

        if(!success) throw new Error(message)

        categorias.value = data

    } catch (error) {
        console.error(error)
        $toast.error('Erro ao buscar categorias')
    }
}

await getCategorias()
</script>
<style scoped>

</style>
