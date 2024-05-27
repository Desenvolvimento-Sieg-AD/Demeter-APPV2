<template>
    <LazyModal v-model:enable="enableValue" :actions="actions" :title="title" width="auto">
        <template #content>
            <v-container class="txt-center">
                <CustomText :title="message" class="ml-2" color="#118B9F" size="20" :bold="true" />
            </v-container>
        </template>
    </LazyModal>
</template>
<script setup>

const props = defineProps({
    enable: { type: Boolean, default: false },
    message: { type: String, default: '' },
    title: { type: String, default: 'Confirmação' },
    actions: { type: Array, default: () => [] },
});

const emit = defineEmits(['close']);

const enableValue = computed({
    get: () => props.enable,
    set: (value) => emit('update:enable', value),
});

</script>
<style scoped>

</style>