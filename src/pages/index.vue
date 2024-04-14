<template>
  <p id="electron-status">
    isElectron: {{ useElectron().isElectron }}
    Boa Noite
  </p>
</template>

<style>
#electron-status {
  background: #000;
  color: #fff;
  position: absolute;
  font-size: 2rem;
  font: bold;
}
</style>