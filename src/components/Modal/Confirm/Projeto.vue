<template>
    <LazyModal v-model:enable="enableValue" :actions="actions" :title="title" width="auto">
        <template #content>
            <v-col>
                <v-row class="mb-2" >
                    <CustomText :title="message" class="ml-2" color="#F68A1A" size="20" :bold="true" />
                </v-row>
                <v-row>
                    <CustomInput v-model="formValue.projeto_id" label="Nome do projeto" />
                </v-row>
            </v-col>
        </template>
    </LazyModal>
</template>
<script setup>

const props = defineProps({
    enable: { type: Boolean, default: false },
    message: { type: String, default: '' },
    form: { type: Object, default: () => ({}) },
    title: { type: String, default: 'Confirmação' },
    actions: { type: Array, default: () => [] },
});

const emit = defineEmits(['close']);

const enableValue = computed({
    get: () => props.enable,
    set: (value) => emit('update:enable', value),
});

const formValue = computed({
    get: () => props.form,
    set: (value) => emit('update:form', value),
});

</script>
<style scoped>

</style>