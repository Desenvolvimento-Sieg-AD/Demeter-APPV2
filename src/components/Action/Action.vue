<template>
	<v-row no-gutters justify="end" class="actions-container">
		<ActionButton
			v-for="(button, index) in buttons"
			:key="index"
			:icon="button.icon"
			:click="button.click"
			:color="button.color"
			:toolTip="button.toolTip"
			:visible="button.visible ?? true"
			:active="button.active ?? false"
			:badge="button.badge"
			:loading="button.loading"
			:type="button.type ?? 'button'"
		/>
	</v-row>
</template>

<script setup>
const props = defineProps({
	buttons: { type: Array, required: true },
});
</script>