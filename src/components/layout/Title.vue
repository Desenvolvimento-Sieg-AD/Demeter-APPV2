<template>
  <div class="pagamento-title-box">
    <h3 class="pagamento-title text-primary">{{ title }}</h3>

    <slot />

  </div>
  <v-divider v-if="divider" />
</template>

<script setup>

const props = defineProps({
  title: { type: String, default: 'Título' },
  divider: { type: Boolean, default: false }
})

</script>

<style>
.pagamento-title-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 10px 0px;
  height: 40px;
}
</style>