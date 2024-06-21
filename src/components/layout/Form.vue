<template>
  <v-container class="ajust" fluid>
    <v-form ref="customForm" @submit.prevent="submit" class="d-flex justify-center">
      <v-col cols="12" >
        <v-card class="backgroundimg" style="overflow-y: auto" :height="height">
          <v-card-text class="card-box">
            <slot />
          </v-card-text>
        </v-card>
      </v-col>
    </v-form>
  </v-container>
</template>

<script setup>
const props = defineProps({
  actionButtons: { type: Array, default: [] },
  submit: { type: Function, default: () => {} },
  titleColor: { type: String, default: '#F68A1A' },
  titleSize: { type: String, default: '24' },
  titleBold: { type: Boolean, default: true },
  height: { type: String, default: 'calc(100vh - 145px)' }
})

const customForm = ref(null)

const resetForm = () => {
  customForm.value.reset()
}

const validateForm = () => {
  return customForm.value.validate()
}

defineExpose({ resetForm, validateForm })
</script>

<style scoped>
.ajust {
  max-width: 100% !important;
  height: 100vh;
}

.v-form {
  overflow-y: auto;
}
.backgroundimg {
  /* background-image: url('../../img/light.jpg'); */
  background-color: #ffffff;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
}
</style>
