<template>
  <v-container class="form-container" fluid>
    <v-card style="overflow-y: auto" flat :max-height="maxHeight" :height="height" :width="width" min>
      <v-card-text>
        <slot />
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
const props = defineProps({
  actionButtons: { type: Array, default: [] },
  submit: { type: Function, default: () => {} },
  maxHeight: { type: String, default: 'calc(100vh - 130px)' },
  height: { type: String, default: '100%' },
  width: { type: String, default: '100%' },
  titleColor: { type: String, default: '#F68A1A' },
  titleSize: { type: String, default: '24' },
  titleBold: { type: Boolean, default: true },
})

const customForm = ref(null)

const resetForm = () => customForm.value.reset()

const validateForm = () => customForm.value.validate()

defineExpose({ resetForm, validateForm })
</script>

<style scoped>
.form-container {
  max-width: 100% !important;
  height: 100vh;
}
</style>
