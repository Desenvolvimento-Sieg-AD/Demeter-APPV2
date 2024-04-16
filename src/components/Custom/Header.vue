<template>
	<v-card-title class="flex">
		<CustomText :title="title" color="#118B9F" size="26" bold />
	</v-card-title>
	<v-divider />
</template>

<script setup>
const props = defineProps({
	title: { type: String, default: '' },
});
</script>