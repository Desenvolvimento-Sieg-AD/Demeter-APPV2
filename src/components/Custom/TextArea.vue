<template>
	<v-card flat :border="editable ? 'sm' : null">
		<v-toolbar density="compact" v-if="editable">
			<v-btn icon variant="text" color="primary" @click="doAction('bold')">
				<v-icon size="20" icon="mdi-format-bold" />
			</v-btn>

			<v-btn icon variant="text" color="primary" @click="doAction('italic')">
				<v-icon size="20" icon="mdi-format-italic" />
			</v-btn>

			<v-btn icon variant="text" color="primary" @click="doAction('underline')">
				<v-icon size="20" icon="mdi-format-underline" />
			</v-btn>

			<v-btn icon variant="text" color="primary" @click="doAction('strikeThrough')">
				<v-icon size="20" icon="mdi-format-strikethrough-variant" />
			</v-btn>

			<v-divider vertical inset class="ma-2" />

			<v-btn icon variant="text" color="primary">
				<v-icon size="20" icon="mdi-format-font-size-increase" />

				<v-menu activator="parent" open-on-hover close-on-content-click>
					<v-card variant="outlined" max-width="200">
						<v-row no-gutters justify="center" align="center">
							<v-col v-for="i in 7" :key="i" cols="4">
								<v-btn variant="text" color="primary" @click="doAction('fontSize', false, i)">
									<b>{{ i }}</b>
								</v-btn>
							</v-col>
						</v-row>
					</v-card>
				</v-menu>
			</v-btn>

			<v-divider vertical inset class="ma-2" />

			<v-btn icon variant="text" color="primary">
				<v-icon size="20" icon="mdi-format-header-pound" />

				<v-menu activator="parent" open-on-hover close-on-content-click>
					<v-card variant="outlined" max-width="200">
						<v-row no-gutters justify="center" align="center">
							<v-col v-for="i in 6" :key="i" cols="4">
								<v-btn variant="text" color="primary" @click="doAction('formatBlock', false, `H${i}`)">
									<v-icon size="20" :icon="`mdi-format-header-${i}`" />
								</v-btn>
							</v-col>
						</v-row>
					</v-card>
				</v-menu>
			</v-btn>

			<v-divider vertical inset class="ma-2" />

			<v-btn icon variant="text" color="primary" @click="doAction('clear', false, '')">
				<v-icon size="20" icon="mdi-format-clear" />
			</v-btn>

			<v-divider vertical inset class="ma-2" />

			<v-btn icon variant="text" color="primary" @click="doAction('undo')">
				<v-icon size="20" icon="mdi-undo-variant" />
			</v-btn>

			<v-btn icon variant="text" color="primary" @click="doAction('redo')">
				<v-icon size="20" icon="mdi-redo-variant" />
			</v-btn>
		</v-toolbar>

		<div :class="{ 'overflow-y-auto': editable }">
			<div
				:class="editable ? 'pa-4' : ''"
				:id="editable ? 'custom_text_editor' : 'custom_text_not_editable'"
				:style="editable ? `height: ${height}` : ''"
				:contenteditable="editable"
				@input.prevent="setDescriptionText"
			></div>
		</div>

		<span class="float-right" :style="textLength" v-if="max"> {{ current }} / {{ max }} </span>
	</v-card>
</template>

<script setup>
const props = defineProps({
	html: { type: String, required: true },
	editable: { type: Boolean, default: false },
	max: { type: Number, required: false },
	required: { type: Boolean, required: false },
	width: { type: String, required: false },
	height: { type: String, required: false, default: '60px' },
});

const current = ref(0);

const textLength = computed(() => (current.value > props.max ? 'color:red' : 'color:#7E7E7E'));

const emit = defineEmits(['update:html']);

const raw = computed({
	get: () => props.html,
	set: (value) => {
		if (props.editable) {
			if (document.getElementById('custom_text_not_editable'))
				document.getElementById('custom_text_not_editable').innerHTML =
					document.getElementById('custom_text_editor').innerHTML || '';
			current.value = document.getElementById('custom_text_editor').innerHTML.length;
		} else {
			document.getElementById('custom_text_not_editable').innerHTML =
				document.getElementById('custom_text_not_editable').innerText ?? '';
			current.value = document.getElementById('custom_text_not_editable').innerHTML.length;
		}

		emit('update:html', value);
	},
});

const setDescriptionText = () => {
	if (props.editable) raw.value = document.getElementById('custom_text_editor').innerHTML;
	else raw.value = document.getElementById('custom_text_not_editable').innerHTML;
};

onMounted(() => updateHtml());

const updateHtml = () => {
	if (props.editable) {
		document.getElementById('custom_text_editor').innerHTML = props.html || '';
		current.value = document.getElementById('custom_text_editor').length;
	} else {
		document.getElementById('custom_text_not_editable').innerHTML = props.html || '';
		current.value = document.getElementById('custom_text_not_editable').length;
	}
};

defineExpose({
	updateHtml: () => nextTick(updateHtml),
});

const doAction = (type, showUI = false, value = null) => {
	document.execCommand(type, showUI, value);
	if (type != 'clear') setDescriptionText();
};
</script>

<style scoped>
.length-span {
	font-size: 14px;
	color: #7e7e7e;
}
#custom_text_editor {
	font-size: 15px;
}
#custom_text_editor:hover {
	border: 0px;
}
#custom_text_editor:focus {
	outline: none;
	border: 0px;
}
#custom_text_not_editable {
	font-size: 15px;
}
</style>