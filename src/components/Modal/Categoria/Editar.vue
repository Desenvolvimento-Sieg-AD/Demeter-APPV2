<template>
	<Modal v-model:enable="enableValue" :actions="modalActions" title="Editar Categorias do Setor" width="850">
        <template #content>
            <v-card>
                <v-card-title class="d-flex justify-space-between align-center">
                    <div>
                        <CustomText :title="`Categorias do Setor: ${setor.nome}`" color="#118B9F" size="16" bold />
                    </div>
                    <div>
                        <v-btn @click="reload()" color="primary" icon>
                            <v-icon>mdi-cached</v-icon>
                        </v-btn>
                    </div>
                </v-card-title>
                <v-divider />
                <v-card-text>
                   
                    <v-list v-if="!loading">
                        <v-list-item v-for="(grupo, grupoIndex) of grupos" :key="`${grupo}-${grupoIndex}`" >
                            <v-list-item-title class="mouseClick" @click="selectAllCategories(grupo)">
                                <v-tooltip activator="parent" location="left" text="Selecionar todas categorias desse grupo"/>
                                {{ grupo.nome }}
                            </v-list-item-title>
                                <v-list-item-action v-for="(categoria, categoriaIndex) of grupo.categorias" :key="`${categoria}-${categoriaIndex}`" center class="mb-n8">
                                    <v-checkbox v-model="categoria.isActive"  :label="categoria.nome" color="primary"/>
                                </v-list-item-action>
                        </v-list-item>
                    </v-list>

                    <LayoutLoading v-else/> 

                </v-card-text>
            </v-card>

        </template>
	</Modal>
</template>
<script setup>

import { getGrupoWithCategoria, updateCategoriaSetor } from '@api'

const emit = defineEmits(['close']);
const { $toast } = useNuxtApp()

const props = defineProps({
    enable: { type: Boolean, default: false },
    actions: { type: Array, default: () => [] },
    setor: { type: Object, default: () => ({}) },
});

const grupos = ref([])
const loading = ref(false);

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
    click: async () => await sendValueCategorias(grupos.value.map((grupo) => grupo.categorias).flat())
  }
]

const getGruposWithCategorias = async () => {
    loading.value = true
    try {
        const { success, message, data } = await getGrupoWithCategoria()

        if(!success) throw new Error(message)

         grupos.value = data.map((grupo) => {

            const categorias = grupo.categorias.map((categoriaDefault) => {

                categoriaDefault.isActive = false

                props.setor.grupo_categoria.forEach((grupo) => {
                    grupo.categorias.forEach((categoria) => categoria.id === categoriaDefault.id ? categoriaDefault.isActive = true : false)
                });

                return categoriaDefault;

            });

            return { ...grupo, categorias };

        });

        loading.value = false

    } catch (error) {
        console.error(error)
    }
}

const selectAllCategories = (grupo) => grupo.categorias.forEach(setValueCategoria)

const setValueCategoria = (categoria) => categoria.isActive = !categoria.isActive

const sendValueCategorias = async (categorias) => {
    try {
        
        const { success, message } = await updateCategoriaSetor({setor_id: props.setor.id, categorias })

        if(!success) throw new Error(message)

        $toast.success('Categorias do setor atualizadas com sucesso')

        enableValue.value = false

        emit('close')

    } catch (error) {
        console.log(error)
        $toast.error('Erro ao atualizar categorias do setor')
    }
}

const reload = async () => await getGruposWithCategorias()

onMounted( async() => await getGruposWithCategorias())

</script>
<style scoped>

.mouseClick {
    cursor: pointer;
    font-weight: bold;
    width: 50%;
}

.mouseClick:hover {
    color: #118B9F;
}

</style>