<template>
  <v-row class="px-3 pt-1" dense>
    <v-col cols="12">
      <CustomInput required label="Motivo" type="textarea" :rows="4" :counter="500" v-model="formValue.motivo" append-inner-icon="mdi-chat-question-outline"  />
    </v-col>
  </v-row>
</template>

<script setup>
const props = defineProps({
  form: { type: Object, required: true },
  user: { type: Object, required: true }
})

const formValue = computed({
  get: () => props.form,
  set: (value) => emit('update:form', value)
})
</script>
