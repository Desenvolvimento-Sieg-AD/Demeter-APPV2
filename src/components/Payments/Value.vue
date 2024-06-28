<template>
  <div class="info-value">
    <CustomText title="Valores pagos/aprovados" color="#118B9F" size="19" :bold="true" />
    <div class="parag">
      <p
        >Ano: <span>{{ formatCurrency(year) }}</span> <v-tooltip text="Valores pagos/aprovados no ano corrente" activator="parent" location="top"
      /></p>
      <p class="mx-1"> - </p>

      <p
        >Mês anterior: <span>{{ formatCurrency(lastMonth) }} </span> <v-tooltip text="Valores pagos/aprovados no mês passado" activator="parent" location="top"
      /></p>
      <p class="mx-1"> - </p>
      <p
        >Mês atual: <span>{{ formatCurrency(month) }}</span> <v-tooltip text="Valores pagos/aprovados no mês atual" activator="parent" location="top"
      /></p>
      <p class="mx-1"> - </p>
      <p>
        Hoje: <span>{{ formatCurrency(today) }}</span
        ><v-tooltip text="Valores pagos/aprovados hoje" activator="parent" location="top"
      /></p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  year: { type: Number, default: 0 },
  month: { type: Number, default: 0 },
  lastMonth: { type: Number, default: 0 },
  today: { type: Number, default: 0 }
})
</script>
<style scoped>
.info-value {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.parag {
  display: flex;
}
.info-value p {
  font-weight: 600;
  font-size: 16px;
}
.info-value span {
  color: rgb(7, 180, 7);
  font-weight: 600;
  margin-right: 5px;
}
</style>
