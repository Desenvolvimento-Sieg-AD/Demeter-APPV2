<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
<style>
.page-enter-active,
.page-leave-active {
  transition: all 0.5s ease-in-out;
}

.page-enter-from,
.page-leave-to {
  opacity: 1;
  filter: blur(1rem);
}

</style>