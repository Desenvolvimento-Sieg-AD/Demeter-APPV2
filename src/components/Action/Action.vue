<template>
	<div class="actions-container">
		<v-row no-gutters justify="end">
			<ActionButton
				v-for="(button, index) in buttons"
				:key="index"
				:icon="button.icon"
				:click="button.click"
				:color="button.color"
				:tooltip="button.tooltip"
				:visible="button.visible ?? true"
				:active="button.active ?? false"
				:badge="button.badge"
				:loading="button.loading"
				:type="button.type ?? 'button'"
			/>
		</v-row>
	</div>
</template>

<script setup>
const props = defineProps({
	buttons: { type: Array, required: true },
});
</script>

<style>
.actions-container {
	position: fixed;
	bottom: 0;
	right: 0;
	margin: 10px 10px 20px;
}
</style>