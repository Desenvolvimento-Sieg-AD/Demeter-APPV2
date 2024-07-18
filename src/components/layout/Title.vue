<template>
  <div class="pagamento-title-box" :style="margin ? 'margin: 10px 10px 0px;' : ''">
    <h3 class="pagamento-title text-primary">{{ title }}</h3>

    <slot />

  </div>
  <v-divider v-if="divider" />
</template>

<script setup>

const props = defineProps({
  title: { type: String, default: 'Título' },
  divider: { type: Boolean, default: false },
  margin: { type: Boolean, default: true }
})

</script>

<style>
.pagamento-title-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  height: 40px;
}
</style>