<template>
	<div class="align-center">
		<v-card-title class="d-flex justify-space-between align-center mb-n4">
			<div>
				<CustomText :title="title" color="#118B9F" size="26" bold />
			</div>
			<div class="d-flex align-center">
				<v-icon @click="reload()" size="small" color="primary">
					mdi-cached
				</v-icon>
				<img src="/img/S®800px.png" height="75" class="slow-blink" />
			</div>
		</v-card-title>
	</div>
	<v-divider />
</template>

<script setup>
const props = defineProps({
	title: { type: String, default: '' },
});

const electron = useElectron()

const reload = async () => await electron.actions.reload()

</script>

<style scoped>

@keyframes slow-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.slow-blink {
  animation: slow-blink 10s infinite;
}

</style>