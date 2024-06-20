<template>
	<v-dialog
		v-model="enableValue"
		:width="width"
		:height="height"
		min-width="400px"
		scrollable
		:persistent="persistent"
		:max-width="maxWidth"
		@click:outside="handleClickOutside"
		:transition="transition"
	>
		<v-card :max-height="maxHeight" class="modal">
			<v-card-title class="modal-header">
				<v-row no-gutters justify="space-between">
					<v-col cols="1" />

					<v-col cols="auto">
						<span class="modal-title">{{ title }}</span>
					</v-col>

					<v-col cols="1" class="d-flex justify-end">
						<v-icon
							@click.stop="
								enableValue = false;
								emit('close');
							"
							>mdi-close</v-icon
						>
					</v-col>
				</v-row>
			</v-card-title>

			<LayoutLoading v-if="isLoading" />

			<div v-else class="modal-loaded-content">
				<!-- MULTIPLE SLOTS -->
				<v-card flat class="modal-content-box" v-if="slotable && slots.length > 0">
					<div class="modal-content" :key="currentSlot">
						<div v-if="defaultContent">
							<slot name="head-content" />
							<slot name="orgao" />
						</div>
						<div v-for="(slot, index) in slots" :name="slot" :key="slot.name">
							<transition name="fade">
								<div :key="index" v-if="slot.name == currentSlot && showFade">
									<slot :name="slot.name" />
								</div>
							</transition>
						</div>
						<div v-if="defaultContent">
							<slot name="foot-content" />
						</div>
					</div>

					<div class="slot-actions">
						<v-btn
							v-for="slot in slots"
							icon
							:key="slot.name"
							@click="setCurrentSlot(slot.name)"
							v-show="slot.show != undefined ? slot.show : true"
							flat
							size="small"
						>
							<v-icon :color="getActionColor(slot)" size="x-large" :icon="slot.icon" />
							<v-tooltip activator="parent" location="bottom" :text="slot.tooltip" />
						</v-btn>
					</div>
				</v-card>

				<!-- SINGLE SLOT -->
				<v-card flat v-else class="modal-content-box">
					<div class="modal-content" :style="contentPadless ? 'padding: 0px!important' : ''">
						<slot name="content" />
					</div>
				</v-card>

				<v-card-actions class="modal-actions" v-if="!noFooter || actions.length > 0">
					<slot name="actions">
						<v-row justify="center" v-if="actions.length > 0">
							<v-btn
								v-for="(action, index) in actions"
								:key="index"
								:width="action.width ?? '150px'"
								:color="getColor(action.type)"
								@click="action.click"
								v-show="showAction(action.show)"
								:loading="loadingAction(action.loading)"
								:disabled="action.disabled"
								:prepend-icon="action.icon"
								variant="flat"
								class="action-button"
							>
								<b>{{ action.title }}</b>
							</v-btn>
						</v-row>
					</slot>
				</v-card-actions>
			</div>
		</v-card>
	</v-dialog>
</template>

<script setup>
//* PROPS

const props = defineProps({
	enable: { type: Boolean, default: false },
	transition: { type: String, default: 'dialog-bottom-transition' },
	closeClickingOutside: { type: Boolean, default: true },
	persistent: { type: Boolean, default: false },
	title: { type: String, default: 'Título' },
	actions: { type: Array, default: [] },
	width: { type: String, default: 'auto' },
	height: { type: String, default: 'auto' },
	maxHeight: { type: String, default: 'auto' },
	isLoading: { type: Boolean, default: false },
	slotable: { type: Boolean, default: false },
	slots: { type: Array, default: [] },
	mode: { type: String, default: 'Create' },
	defaultSlot: { type: String, default: null },
	noFooter: { type: Boolean, default: true },
	contentPadless: { type: Boolean, default: false },
	defaultContent: { type: Boolean, default: false },
	validadeDados: { type: Function, default: () => true },
	validadeProdutos: { type: Function, default: () => true },
	validadeContatos: { type: Function, default: () => true },
	maxWidth: { type: String, default: '1000px' },
});

//* EMITS

const emit = defineEmits(['update:enable', 'update:defaultSlot', 'close', 'slot']);

//* DATA

const colors = {
	confirm: '#F68A1A',
	cancel: '#F44336',
	grey: '#AAA',
	info: 'info',
	success: 'green',
	error: 'error',
};

const showFade = ref(true);

//* COMPUTED

const enableValue = computed({
	get: () => props.enable,
	set: (value) => emit('update:enable', value),
});

const currentSlot = computed({
	get: () => (props.slotable && props.slots.length > 0 ? props.defaultSlot || props.slots[0].name : ''),
	set: (value) => emit('update:defaultSlot', value),
});

//* ACTIONS

const handleClickOutside = () => {
	if (!props.closeClickingOutside || props.persistent) return;
	enableValue.value = false;
};

const getColor = (type) => colors[type] || '#F68A1A';

const getActionColor = (slot) => (currentSlot.value == slot.name ? slot.color ?? '#F68A1A' : '#ccc');

const setCurrentSlot = (slot) => {
	if (currentSlot.value == slot) return;

	if (props.mode !== 'watch') {
		if (slot === 'produtos' && !props.validadeDados()) return;
		if (slot === 'contatos' && !props.validadeProdutos()) return;
	}

	emit('slot', slot);

	showFade.value = false;
	setTimeout(() => (showFade.value = true), 5);
};

const showAction = (action) => (action != undefined ? action : true);

const loadingAction = (action) => (action != undefined ? action : false);
</script>

<style>
.modal {
	max-height: 810px;
	overflow-y: hidden;
}
.modal-header {
	background-color: #F68A1A;
	color: white;
	padding: 10px 15px !important;
	height: auto;
}
.modal-title {
	font-weight: bold;
	color: white;
}
.modal-content-box {
	display: flex;
	flex-direction: row;
	height: 100%;
	max-height: 700px;
	overflow: auto;
	border-radius: 0px;
}
.modal-content {
	width: 100%;
	padding: 20px !important;
}
.modal-actions {
	background-color: #f0f0f0;
	width: 100%;
	height: auto;
	bottom: 0;
	z-index: 20;
}
.slot-actions {
	width: 70px;
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
	align-items: center;
	padding: 10px 0px;
	border-left: 1px solid #ccc;
}
.action-button {
	padding: 0 16px !important;
}
.modal-loaded-content {
	height: calc(100% - 52px - 52px);
}

.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}
.fade-enter-to,
.fade-leave-from {
	opacity: 1;
}
</style>