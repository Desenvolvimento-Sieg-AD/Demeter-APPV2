<template>
  <span :style="style">
    <slot>
      {{ title }}
    </slot>
  </span>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: 'black'
  },
  size: {
    type: String,
    default: '14'
  },
  transform: {
    type: String,
    default: 'none'
  },
  transition: {
    type: String,
    default: '0s'
  },
  bold: {
    type: Boolean,
    default: false
  },
  width: {
    type: String,
    default: 'auto'
  }
})

const formatedColor = computed(() => {
  if (props.color?.includes('#')) return props.color

  const themeColor = themes.dark[props.color]
  return themeColor ? themeColor : props.color
})

const style = ref({
  color: formatedColor.value,
  fontSize: `${props.size}px`,
  textTransform: props.transform,
  fontWeight: props.bold ? 'bold' : 'normal',
  width: props.width,
  transition: props.transition
})
</script>
