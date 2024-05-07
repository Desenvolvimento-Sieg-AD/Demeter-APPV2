<template>
	<v-text-field
		v-if="type == 'text' && !mask"
		v-model="enableValue"
		ref="customInput"
		:density="density"
		:hide-details="hideDetails"
		:label="label"
		:variant="variant"
		:rules="[fieldRules]"
		:prepend-icon="prepend"
		:prepend-inner-icon="prependInner"
		:append-icon="append"
		:append-inner-icon="appendInner"
		:disabled="disabled"
		:rounded="rounded"
		:clearable="clearable"
		:color="color"
		:bg-color="backgroundColor"
		:loading="loading"
		:suffix="suffix"
		:prefix="prefix"
		:readonly="readonly"
		:maxLength="maxLength"
		:class="required && !enableValue ? 'required-field custom-text-field' : 'custom-text-field'"
		@update:modalValue="onChange"
		@focus="onFocus"
		@blur="onBlur"
	/>

	<v-text-field
		v-else-if="type == 'text' && mask == 'number'"
		v-model="enableValue"
		ref="customInput"
		v-maska="'#*'"
		:density="density"
		:hide-details="hideDetails"
		:label="label"
		:variant="variant"
		:rules="[fieldRules]"
		:prepend-icon="prepend"
		:prepend-inner-icon="prependInner"
		:append-icon="append"
		:append-inner-icon="appendInner"
		:disabled="disabled"
		:rounded="rounded"
		:clearable="clearable"
		:color="color"
		:bg-color="backgroundColor"
		:loading="loading"
		:suffix="suffix"
		:prefix="prefix"
		:readonly="readonly"
		:maxLength="maxLength"
		:class="required && !enableValue ? 'required-field custom-text-field' : 'custom-text-field'"
		@update:modalValue="onChange"
		@focus="onFocus"
		@blur="onBlur"
	/>

	<v-text-field
		v-else-if="type == 'text' && mask == 'boleto'"
		v-model="enableValue"
		ref="customInput"
		v-maska="maskaBoleto"
		:density="density"
		:hide-details="hideDetails"
		:label="label"
		:variant="variant"
		:rules="[fieldRules]"
		:prepend-icon="prepend"
		:prepend-inner-icon="prependInner"
		:append-icon="append"
		:append-inner-icon="appendInner"
		:disabled="disabled"
		:rounded="rounded"
		:clearable="clearable"
		:color="color"
		:bg-color="backgroundColor"
		:loading="loading"
		:suffix="suffix"
		:prefix="prefix"
		:readonly="readonly"
		:class="required && !enableValue ? 'required-field custom-text-field' : 'custom-text-field'"
		@update:modalValue="onChange"
		@focus="onFocus"
		@blur="onBlur"
	/>

	<v-text-field
		v-else-if="type == 'text' && mask == 'money'"
		v-model="formattedValue"
		ref="inputRef"
		:density="density"
		:hide-details="hideDetails"
		:label="label"
		:variant="variant"
		:rules="[fieldRules]"
		:prepend-icon="prepend"
		:append-icon="append"
		:append-inner-icon="appendInner"
		:disabled="disabled"
		:rounded="rounded"
		:clearable="clearable"
		:color="color"
		:bg-color="backgroundColor"
		:loading="loading"
		:suffix="suffix"
		:prefix="prefix"
		:readonly="readonly"
		:class="required && !enableValue ? 'required-field custom-text-field' : 'custom-text-field'"
		@update:modalValue="onChange"
		@focus="onFocus"
		@blur="onBlur"
	>
		<template #prepend-inner> R$ </template>
	</v-text-field>

	<v-text-field
		v-else-if="type == 'text' && mask == 'cnpj'"
		v-model="enableValue"
		ref="customInput"
		v-maska="'##.###.###/####-##'"
		:density="density"
		:hide-details="hideDetails"
		:label="label"
		:variant="variant"
		:rules="[fieldRules, rules.cnpj]"
		:prepend-icon="prepend"
		:prepend-inner-icon="prependInner"
		:append-icon="append"
		:append-inner-icon="appendInner"
		:disabled="disabled"
		:rounded="rounded"
		:clearable="clearable"
		:color="color"
		:bg-color="backgroundColor"
		:loading="loading"
		:suffix="suffix"
		:prefix="prefix"
		:readonly="readonly"
		:class="required && !enableValue ? 'required-field custom-text-field' : 'custom-text-field'"
		@update:modalValue="onChange"
		@focus="onFocus"
		@blur="onBlur"
	/>

	<v-text-field
		v-else-if="type == 'text' && mask == 'cpf'"
		v-model="enableValue"
		ref="customInput"
		v-maska="'###.###.###-##'"
		:density="density"
		:hide-details="hideDetails"
		:label="label"
		:variant="variant"
		:rules="[fieldRules]"
		:prepend-icon="prepend"
		:prepend-inner-icon="prependInner"
		:append-icon="append"
		:append-inner-icon="appendInner"
		:disabled="disabled"
		:rounded="rounded"
		:clearable="clearable"
		:color="color"
		:bg-color="backgroundColor"
		:loading="loading"
		:suffix="suffix"
		:prefix="prefix"
		:readonly="readonly"
		:class="required && !enableValue ? 'required-field custom-text-field' : 'custom-text-field'"
		@update:modalValue="onChange"
		@focus="onFocus"
		@blur="onBlur"
	/>

	<v-text-field
		v-else-if="type == 'text' && mask == 'cep'"
		v-model="enableValue"
		ref="customInput"
		v-maska="'#####-###'"
		:density="density"
		:hide-details="hideDetails"
		:label="label"
		:variant="variant"
		:rules="[fieldRules]"
		:prepend-icon="prepend"
		:prepend-inner-icon="prependInner"
		:append-icon="append"
		:append-inner-icon="appendInner"
		:disabled="disabled"
		:rounded="rounded"
		:clearable="clearable"
		:color="color"
		:bg-color="backgroundColor"
		:loading="loading"
		:suffix="suffix"
		:prefix="prefix"
		:readonly="readonly"
		:class="required && !enableValue ? 'required-field custom-text-field' : 'custom-text-field'"
		@update:modalValue="onChange"
		@focus="onFocus"
		@blur="onBlur"
	/>

	<v-text-field
		v-else-if="type == 'text' && mask == 'phone'"
		v-maska="'(##) #####-####'"
		v-model="enableValue"
		ref="customInput"
		:density="density"
		:hide-details="hideDetails"
		:label="label"
		:variant="variant"
		:rules="[fieldRules]"
		:prepend-icon="prepend"
		:prepend-inner-icon="prependInner"
		:append-icon="append"
		:append-inner-icon="appendInner"
		:disabled="disabled"
		:rounded="rounded"
		:clearable="clearable"
		:color="color"
		:bg-color="backgroundColor"
		:loading="loading"
		:suffix="suffix"
		:prefix="prefix"
		:readonly="readonly"
		:class="required && !enableValue ? 'required-field custom-text-field' : 'custom-text-field'"
		@update:modalValue="onChange"
		@focus="onFocus"
		@blur="onBlur"
	/>

	<v-text-field
		v-else-if="type == 'text' && mask == 'aleatoria'"
		v-maska="'XXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX'"
		v-model="enableValue"
		ref="customInput"
		:density="density"
		:hide-details="hideDetails"
		:label="label"
		:variant="variant"
		:rules="[fieldRules]"
		:prepend-icon="prepend"
		:prepend-inner-icon="prependInner"
		:append-icon="append"
		:append-inner-icon="appendInner"
		:disabled="disabled"
		:rounded="rounded"
		:clearable="clearable"
		:color="color"
		:bg-color="backgroundColor"
		:loading="loading"
		:suffix="suffix"
		:prefix="prefix"
		:readonly="readonly"
		:class="required && !enableValue ? 'required-field custom-text-field' : 'custom-text-field'"
		@update:modalValue="onChange"
		@focus="onFocus"
		@blur="onBlur"
	/>

	<v-text-field
		v-else-if="type == 'text' && mask == 'email'"
		v-model="enableValue"
		ref="customInput"
		:density="density"
		:hide-details="hideDetails"
		:label="label"
		:variant="variant"
		:rules="[rules.email]"
		:prepend-icon="prepend"
		:prepend-inner-icon="prependInner"
		:append-icon="append"
		:append-inner-icon="appendInner"
		:disabled="disabled"
		:rounded="rounded"
		:clearable="clearable"
		:color="color"
		:bg-color="backgroundColor"
		:loading="loading"
		:suffix="suffix"
		:prefix="prefix"
		:readonly="readonly"
		:class="required && !enableValue ? 'required-field custom-text-field' : 'custom-text-field'"
		@update:modalValue="onChange"
		@focus="onFocus"
		@blur="onBlur"
	/>


	<v-text-field
		v-else-if="type == 'date'"
		v-model="enableValue"
		ref="customInput"
		type="date"
		:density="density"
		:hide-details="hideDetails"
		:label="label"
		:variant="variant"
		:rules="[fieldRules]"
		:prepend-icon="prepend"
		:prepend-inner-icon="prependInner"
		:append-icon="append"
		:append-inner-icon="appendInner"
		:disabled="disabled"
		:rounded="rounded"
		:clearable="clearable"
		:color="color"
		:bg-color="backgroundColor"
		:loading="loading"
		:suffix="suffix"
		:hint="hint"
		:messages="messages"
		:prefix="prefix"
		:readonly="readonly"
		:class="required && !enableValue ? 'required-field custom-text-field' : 'custom-text-field'"
		@update:modalValue="onChange"
		@focus="onFocus"
		@blur="onBlur"
	/>

	<v-text-field
		v-else-if="type == 'datetime'"
		v-model="enableValue"
		ref="customInput"
		type="datetime-local"
		:density="density"
		:hide-details="hideDetails"
		:label="label"
		:variant="variant"
		:rules="[fieldRules]"
		:prepend-icon="prepend"
		:prepend-inner-icon="prependInner"
		:append-icon="append"
		:append-inner-icon="appendInner"
		:disabled="disabled"
		:rounded="rounded"
		:clearable="clearable"
		:color="color"
		:bg-color="backgroundColor"
		:loading="loading"
		:suffix="suffix"
		:prefix="prefix"
		:readonly="readonly"
		:class="required && !enableValue ? 'required-field custom-text-field' : 'custom-text-field'"
		@update:modalValue="onChange"
		@focus="onFocus"
		@blur="onBlur"
	/>

	<v-text-field
		v-else-if="type == 'time'"
		v-model="enableValue"
		ref="customInput"
		type="time"
		:density="density"
		:hide-details="hideDetails"
		:label="label"
		:variant="variant"
		:rules="[fieldRules]"
		:prepend-icon="prepend"
		:prepend-inner-icon="prependInner"
		:append-icon="append"
		:append-inner-icon="appendInner"
		:disabled="disabled"
		:rounded="rounded"
		:clearable="clearable"
		:color="color"
		:bg-color="backgroundColor"
		:loading="loading"
		:suffix="suffix"
		:prefix="prefix"
		:readonly="readonly"
		:class="required && !enableValue ? 'required-field custom-text-field' : 'custom-text-field'"
		@update:modalValue="onChange"
		@focus="onFocus"
		@blur="onBlur"
	/>

	<v-textarea
		v-else-if="type == 'textarea'"
		v-model="enableValue"
		ref="customInput"
		:no-resize="noResize"
		:density="density"
		:hide-details="hideDetails"
		:label="label"
		:variant="variant"
		:rules="[fieldRules]"
		:prepend-icon="prepend"
		:prepend-inner-icon="prependInner"
		:append-icon="append"
		:append-inner-icon="appendInner"
		:disabled="disabled"
		:rounded="rounded"
		:clearable="clearable"
		:color="color"
		:bg-color="backgroundColor"
		:loading="loading"
		:suffix="suffix"
		:prefix="prefix"
		:readonly="readonly"
		:rows="rows"
		:maxLength="maxLength"
		:auto-grow="autogrow"
		:class="{ 'required-field': required && !enableValue }"
		@update:modalValue="onChange"
		@focus="onFocus"
		@blur="onBlur"
	>
		<template v-for="(slotName, index) in Object.keys($slots)" :key="index" v-slot:[slotName]>
			<slot :name="slotName"></slot>
		</template>
	</v-textarea>
	<v-radio-group
		v-else-if="type == 'radio'"
		v-model="enableValue"
		ref="customInput"
		:inline="inline"
		:label="label"
		:color="color"
		:density="density"
		:disabled="disabled"
		:readonly="readonly"
		:multiple="multiple"
		:append-icon="append"
		:prepend-icon="prepend"
		:hide-details="hideDetails"
		:rules="[fieldRules]"
	>
		<v-radio
			v-for="(option, index) in options"
			:key="index"
			:label="option.label"
			:value="option.value"
			:density="option.density"
			:disabled="option.disabled"
			:readonly="option.readonly"
		/>
	</v-radio-group>

	<v-combobox
		v-else-if="type == 'combobox' && !mask"
		v-model="enableValue"
		ref="customInput"
		no-data-text="Nenhuma opção encontrada"
		:density="density"
		:hide-details="hideDetails"
		:chips="chips"
		:clearable="clearable"
		:multiple="multiple"
		:closable-chips="closableChips"
		:label="label"
		:variant="variant"
		:items="items"
		:rules="[fieldRules]"
		:rounded="rounded"
		:color="color"
		:bg-color="backgroundColor"
		:disabled="disabled"
		:readonly="readonly"
		:prepend-icon="prepend"
		:prepend-inner-icon="prependInner"
		:append-icon="append"
		:append-inner-icon="appendInner"
		:item-title="itemTitle"
		:return-object="itemValue ? false : true"
		:item-value="itemValue"
		:class="{ 'required-field': required && !enableValue }"
		@click:clear="$emit('clear')"
		@update:modalValue="onChange"
		@focus="onFocus"
		@blur="onBlur"
	>
		<template #selection="{ item, index }" v-if="$slots.selection">
			<slot name="selection" v-bind="{ item, index }" />
		</template>

		<!-- Create a slot that can be any slot of v-combobox -->
		<template v-for="slot in $slots">
			<slot :name="slot.name" v-bind="slot.props" />
		</template>
	</v-combobox>

	<v-combobox
		v-else-if="type == 'combobox' && mask == 'email'"
		v-model="enableValue"
		ref="customInput"
		no-data-text="Nenhuma opção encontrada"
		:density="density"
		:hide-details="hideDetails"
		:chips="chips"
		:clearable="clearable"
		:multiple="multiple"
		:closable-chips="closableChips"
		:label="label"
		:variant="variant"
		:items="items"
		:rules="[rules.emails]"
		:rounded="rounded"
		:color="color"
		:bg-color="backgroundColor"
		:disabled="disabled"
		:readonly="readonly"
		:prepend-icon="prepend"
		:prepend-inner-icon="prependInner"
		:append-icon="append"
		:append-inner-icon="appendInner"
		:item-title="itemTitle"
		:return-object="itemValue ? false : true"
		:item-value="itemValue"
		:class="{ 'required-field': required && !enableValue }"
		:delimiters="[',', ';', ' ']"
		@update:modalValue="onChange"
		@focus="onFocus"
		@blur="onBlur"
	>
		<template #selection="{ item, index }" v-if="$slots.selection">
			<slot name="selection" v-bind="{ item, index }" />
		</template>

		<!-- Create a slot that can be any slot of v-combobox -->
		<template v-for="slot in $slots">
			<slot :name="slot.name" v-bind="slot.props" />
		</template>
	</v-combobox>

	<v-file-input
		v-else-if="type == 'file'"
		v-model="enableValue"
		:color="color"
		:label="label"
		:chips="chips"
		:accept="accept"
		:loading="loading"
		:variant="variant"
		:density="density"
		:multiple="multiple"
		:disabled="disabled"
		:required="required"
		:append-icon="append"
		:clearable="clearable"
		:prepend-icon="prepend"
		:hint="hint"
		:rules="[fieldRules]"
		:messages="messages"
		:hide-details="hideDetails"
		:append-inner-icon="appendInner"
		:class="required ? 'required-field' : ''"
	>
		<template #selection="{ fileNames, index }" v-if="$slots.selection">
			<slot name="selection" v-bind="{ fileNames, index }"> </slot>
		</template>

		<template #message="{ message }" v-if="$slots.message">
			<slot name="message" v-bind="{ message }"> </slot>
		</template>

	</v-file-input>

	<v-combobox
		v-else-if="type == 'combobox' && mask == 'cnpj'"
		v-model="enableValue"
		ref="customInput"
		v-maska="'##.###.###/####-##'"
		no-data-text="Nenhuma opção encontrada"
		:density="density"
		:hide-details="hideDetails"
		:chips="chips"
		:clearable="clearable"
		:multiple="multiple"
		:label="label"
		:variant="variant"
		:items="items"
		:rules="[fieldRules]"
		:rounded="rounded"
		:color="color"
		:bg-color="backgroundColor"
		:disabled="disabled"
		:readonly="readonly"
		:prepend-icon="prepend"
		:prepend-inner-icon="prependInner"
		:append-icon="append"
		:append-inner-icon="appendInner"
		:item-title="itemTitle"
		:return-object="itemValue ? false : true"
		:item-value="itemValue"
		:class="{ 'required-field': required && !enableValue }"
		@update:modalValue="onChange"
		@focus="onFocus"
		@blur="onBlur"
	/>

	<v-checkbox
		v-else-if="type == 'checkbox'"
		v-model="enableValue"
		ref="customInput"
		:disabled="disabled"
		:readonly="readonly"
		:density="density"
		:rules="[fieldRules]"
		:append-icon="append"
		:prepend-icon="prepend"
		:label="label"
		:color="color"
		:hide-details="hideDetails"
	/>

	<v-select
		v-else-if="type == 'select'"
		v-model="enableValue"
		ref="customInput"
		:density="density"
		:hide-details="hideDetails"
		:label="label"
		:variant="variant"
		:rules="[fieldRules]"
		:prepend-icon="prepend"
		:prepend-inner-icon="prependInner"
		:append-icon="append"
		:append-inner-icon="appendInner"
		:disabled="disabled"
		:rounded="rounded"
		:clearable="clearable"
		:color="color"
		:bg-color="backgroundColor"
		:loading="loading"
		:suffix="suffix"
		:prefix="prefix"
		:readonly="readonly"
		:chips="chips"
		:items="items"
		:no-data-text="noDataText"
		:multiple="multiple"
		:item-title="itemTitle"
		:return-object="itemValue ? false : true"
		:item-value="itemValue"
		:class="{ 'required-field': required && !enableValue }"
		@update:modalValue="onChange"
		@focus="onFocus"
		@blur="onBlur"
	/>

	<v-autocomplete
		v-else-if="type == 'autocomplete' && !mask"
		v-model="enableValue"
		ref="customInput"
		:density="density"
		:return-object="itemValue ? false : true"
		:hide-details="hideDetails"
		:label="label"
		:variant="variant"
		:rules="[fieldRules]"
		:prepend-icon="prepend"
		:auto-select-first="autoSelectFirst"
		:prepend-inner-icon="prependInner"
		:append-icon="append"
		:append-inner-icon="appendInner"
		:disabled="disabled"
		:rounded="rounded"
		:clearable="clearable"
		:color="color"
		:bg-color="backgroundColor"
		:loading="loading"
		:suffix="suffix"
		:prefix="prefix"
		:readonly="readonly"
		:chips="chips"
		:items="items"
		:no-data-text="noDataText"
		:multiple="multiple"
		:item-title="itemTitle"
		:item-value="itemValue"
		:class="{ 'required-field': required && !enableValue }"
		@update:modalValue="onChange"
		@focus="onFocus"
		@blur="onBlur"
	>
		<template #item="{ item, index }" v-if="$slots.item">
			<slot name="item" v-bind="{ item, index }" />
		</template>
	</v-autocomplete>

	<v-autocomplete
		v-else-if="type == 'autocomplete' && mask == 'cnpj'"
		v-model="enableValue"
		ref="customInput"
		v-maska="'##.###.###/####-##'"
		:density="density"
		:hide-details="hideDetails"
		:label="label"
		:variant="variant"
		:rules="[fieldRules]"
		:prepend-icon="prepend"
		:prepend-inner-icon="prependInner"
		:append-icon="append"
		:append-inner-icon="appendInner"
		:disabled="disabled"
		:rounded="rounded"
		:clearable="clearable"
		:color="color"
		:bg-color="backgroundColor"
		:loading="loading"
		:suffix="suffix"
		:prefix="prefix"
		:readonly="readonly"
		:chips="chips"
		:items="items"
		:no-data-text="noDataText"
		:multiple="multiple"
		:item-title="itemTitle"
		:return-object="itemValue ? false : true"
		:item-value="itemValue"
		:class="{ 'required-field': required && !enableValue }"
		@update:modalValue="onChange"
		@focus="onFocus"
		@blur="onBlur"
	>
		<template #selection="{ item, index }" v-if="$slots.selection">
			<slot name="selection" v-bind="{ item, index }" />
		</template>
	</v-autocomplete>
</template>

<script setup>
const props = defineProps({
	//* Default
	modelValue: { type: [String, Number, Boolean, Array, Object], default: null },
	type: { type: String, default: 'text' },
	//* Basics
	density: { type: String, default: 'compact' },
	maxLength: { type: Number, default: null },
	label: { type: String, default: '' },
	variant: { type: String, default: 'outlined' },
	required: { type: Boolean, default: false },
	noDataText: { type: String, default: 'Nenhuma opção encontrada' },
	loading: { type: Boolean, default: false },
	disabled: { type: Boolean, default: false },
	readonly: { type: Boolean, default: false },
	counter: { type: Number, default: 30 },
	backgroundColor: { type: String, default: '#FFF' },
	hideDetails: { default: false },
	mask: { type: String, default: '' },
	rows: { type: Number, default: 1 },
	autogrow: { type: Boolean, default: false },
	//* Styles
	color: { type: String, default: '#118b9f' },
	rounded: { type: Boolean, default: false },
	flat: { type: Boolean, default: true },
	//* Validations
	rules: { type: [Boolean, String, Function], default: null },
	//* Interactives
	autoSelectFirst: { type: Boolean, default: false },
	clearable: { type: Boolean, default: false },
	multiple: { type: Boolean, default: false },
	inline: { type: Boolean, default: false },
	chips: { type: Boolean, default: false },
	closableChips: { type: Boolean, default: false },
	//* Fields
	options: { type: Array, default: () => [] },
	items: { type: Array, default: () => [] },
	itemValue: { type: String },
	messages: { type: [String, Array], default: '' },
	hint: { type: String, default: '' },
	itemTitle: { type: [String, Function], default: 'title' },
	//* Icons
	suffix: { type: String, default: '' },
	prefix: { type: String, default: '' },
	prependBox: { type: String, default: '' },
	appendBox: { type: String, default: '' },
	prepend: { type: String, default: null },
	prependInner: { type: String, default: null },
	append: { type: String, default: null },
	appendInner: { type: String, default: null },
	noResize: { type: Boolean, default: true },
	accept: { type: String, default: '' },
	//* Events
	onChange: { type: Function, default: () => {} },
	onFocus: { type: Function, default: () => {} },
	onBlur: { type: Function, default: () => {} },
});

const emit = defineEmits(['update:modelValue', 'change', 'focus', 'blur']);

import { useCurrencyInput } from 'vue-currency-input';
const { inputRef, formattedValue, numberValue, setValue } = useCurrencyInput({
	currency: 'BRL',
	autoDecimalDigits: true,
	currencyDisplay: 'hidden',
	hideCurrencySymbolOnFocus: false,
	hideGroupingSeparatorOnFocus: false,
	precision: 2,
	valueRange: { min: 0 },
});

const enableValue = computed({
	get: () => props.modelValue,
	set: (value) => emit('update:modelValue', value),
});
watch(
	() => enableValue,
	(value) => {
		setValue(value);
	}
);
watch(
	() => props.modelValue,
	(value) => {
		setValue(value);
	}
);
//* RULES
const fieldRules = (v) => {
	const arr = [];
	if (props.required) arr.push(requiredRule(v));

	const rules = Array.isArray(props.rules) ? props.rules.flat() : [props.rules].flat();

	if (rules.length > 0) {
		rules.forEach((rule) => {
			if (typeof rule === 'function') arr.push(rule(v));
		});
	}
	// if (props.type === 'textarea') arr.push(textAreaRule(v));

	return arr.find((v) => v) || true;
};

const maskaBoleto = '#'.repeat(47);

const requiredRule = (v) => (v instanceof Array && v.length == 0 ? 'Campo obrigatório' : !!v || 'Campo obrigatório');
const textAreaRule = (v) => (v || '').length <= props.counter || `Máximo de ${props.counter} caracteres`;

const rules = useRules();

//* MASK

const onChange = (attrs) => {
	emit('change', enableValue.value);
};
const onFocus = (attrs) => {
	emit('focus', enableValue.value);
};
const onBlur = (attrs) => {
	emit('blur', enableValue.value);
};

const customInput = ref(null);

defineExpose({
	validate: async () => {
		const valid = await customInput.value?.validate();
		return valid.length == 0;
	},
	reset: async () => await customInput.value?.reset(),
	click: async () => await customInput.value?.click(),
});
</script>

<style scoped></style>

<style>
input,
select,
textarea {
	font-size: 14px;
}

.v-label,
.v-field-label,
.v-autocomplete__selection-text,
.v-autocomplete__selection,
.v-autocomplete__selection--comma {
	font-size: 14px;
}

.input-row {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	border: 1px solid #ccc;
	border-radius: 4px;
	padding: 0 8px;
	margin: 8px 0;
}
.prepend-box {
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 8px;
	color: #ccc;
}
.append-box {
	display: flex;
	align-items: center;
	justify-content: center;
	margin-left: 8px;
	color: #ccc;
}
.custom-text-field .v-field__field {
	height: 44px;
}

.required-field .v-label::before {
	content: '*\00a0';
	color: red;
}
</style>
