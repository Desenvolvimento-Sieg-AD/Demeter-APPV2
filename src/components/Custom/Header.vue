<template>
	<v-card-title class="d-flex justify-space-between align-center mb-n4">
		<CustomText :title="title" color="#118B9F" size="26" bold />
		<img src="/img/S®800px.png" height="75" />
	</v-card-title>
	<v-divider />
</template>

<script setup>
const props = defineProps({
	title: { type: String, default: '' },
});
</script>