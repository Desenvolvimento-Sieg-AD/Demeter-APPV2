<template>
	<div v-if="visible" class="m">
		<v-btn
			:type="type ?? 'button'"
			size="large"
			:class="active ? 'btn-action' : 'btn-disabled'"
			:icon="icon"
			@click="click"
			:color="color"
			:disabled="active ? false : true"
			:loading="loading"
		>
			<v-tooltip :text="toolTip" activator="parent" location="top" />
			<v-icon color="white" style="font-size: 24px">{{ icon }}</v-icon>
		</v-btn>
		<v-badge v-if="badge > 0" color="error" offset-y="-20" :content="badge" />
	</div>
</template>

<script setup>
const props = defineProps({
	type: String,
	icon: String,
	toolTip: String,
	click: Function,
	loading: Boolean,
	visible: Boolean,
	active: Boolean,
	color: String,
	badge: Number,
});
</script>

<style scoped>
.fs-24 {
	font-size: 24px;
}
.m {
	margin: 0 10px;
}
.btn-action {
	margin: 0 1px !important;
}

.btn-disabled {
	background-color: grey !important;
}
</style>
