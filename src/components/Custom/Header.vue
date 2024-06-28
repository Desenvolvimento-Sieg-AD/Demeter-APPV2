<template>
  <div class="align-center">
    <v-card-title class="d-flex justify-space-between align-center mb-n4">
      <div>
        <CustomText :title="title" :color="formatedColor" size="26" bold />
      </div>
      <div class="d-flex align-center">
        <v-icon @click="reload()" size="small" :color="formatedColor"> mdi-cached</v-icon>
        <img src="/img/S®800px.png" height="75" class="slow-blink" />
      </div>
    </v-card-title>
  </div>
  <v-divider />
</template>

<script setup>
const props = defineProps({
  title: { type: String, default: '' },
  color: { type: String, default: 'secondary' }
})

const reload = async () => await useElectron().actions.reload()

const formatedColor = computed(() => {
  if (props.color?.includes('#')) return props.color

  const themeColor = themes.dark[props.color]
  return themeColor ? themeColor : props.color
})
</script>

<style scoped>
@keyframes slow-blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}
.slow-blink {
  animation: slow-blink 10s infinite;
}
</style>
