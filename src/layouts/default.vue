<template>
  <transition name="page">
    <slot />
  </transition>
</template>

<style>
html {
  background: #fff;
  overflow: hidden;
  font-family: 'Inter-Regular', sans-serif;
}
</style>