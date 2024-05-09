<template>
	<v-text-field
		v-if="type == 'text' && mask == 'money'"
		v-model="formattedValue"
		v-bind="$attrs"
		ref="inputRef"
		:density="density"
		:hide-details="hideDetails"
		:label="label"
		:variant="variant"
		:rules="fieldRules"
		:prepend-icon="prepend"
		:append-icon="appendIcon"
		:append-inner-icon="appendInnerIcon"
		:disabled="disabled"
		:rounded="rounded"
		:clearable="clearable"
		:color="color"
		:bg-color="backgroundColor"
		:loading="loading"
		:suffix="suffix"
		:prefix="prefix"
		:readonly="readonly"
		validate-on="lazy blur"
		:class="required && !enableValue ? 'required-field custom-text-field' : 'custom-text-field'"
		@update:modalValue="onChange"
		@focus="onFocus"
		@blur="onBlur"
	>
		<template #prepend-inner> {{ typeCurrency }} </template>
	</v-text-field>

	<v-text-field
		v-else-if="type == 'text'"
		v-model="enableValue"
		v-bind="$attrs"
		ref="customInput"
		v-maska="composable_masks[mask]"
		:density="density"
		:hide-details="hideDetails"
		:label="label"
		:variant="variant"
		:rules="fieldRules"
		:prepend-icon="prepend"
		:prepend-inner-icon="prependInner"
		:append-icon="appendIcon"
		:append-inner-icon="appendInnerIcon"
		:disabled="disabled"
		:rounded="rounded"
		:clearable="clearable"
		:color="color"
		:bg-color="backgroundColor"
		:loading="loading"
		:suffix="suffix"
		:prefix="prefix"
		:readonly="readonly"
		:hint="hint"
		:persistent-hint="persistentHint"
		:maxlength="max"
		validate-on="lazy blur"
		:class="required && !enableValue ? 'required-field custom-text-field' : 'custom-text-field'"
		@update:modalValue="onChange"
		@focus="onFocus"
		@blur="onBlur"
	>
	</v-text-field>

	<v-menu
		v-if="type.includes('date')"
		v-model="datetimepicker"
		:close-on-content-click="false"
	>
		<template #activator="{ props: dropdown }">
		<v-text-field
			:bg-color="backgroundColor"
			v-model="enableValue"
			ref="customInput"
			:label="label"
			:type="type_dates[type].type"
			:min="type_dates[type].min"
			:max="type_dates[type].max"
			:rules="[...fieldRules, insideDateRange]"
			@keydown.space="preventDefault($event, dropdown)"
			:append-inner-icon="!disabled && !readonly && showPicker ? 'mdi-calendar' : ''"
			@click:append-inner="dropdown.onClick"
			:rounded="rounded"
			validate-on="lazy input"
			:clearable="clearable"
			:variant="variant"
			:density="density"
			:hide-details="hideDetails"
			:class="required && !enableValue ? 'required-field custom-text-field' : 'custom-text-field'"
			:color="color"
			:readonly="readonly"
			:disabled="disabled"
		/>
		</template>
		<v-locale-provider  locale="pt">
		<v-card width="330" min-height="300" class="d-flex align-center justify-center">
			<v-fade-transition>
			<v-date-picker 
				v-model="datePick"
				v-show="pick_date"
				:color="color"
				hide-header
				locale="pt-br"
				show-adjacent-months
				:allowed-dates="allowed_dates"
				:min="type_dates[type].min"
				:max="type_dates[type].max"
			> 
			</v-date-picker>
			</v-fade-transition>
			<v-fade-transition>
			<v-time-picker
				v-model="timePick"
				v-show="pick_time"
				:color="color"
				hide-header
				locale="pt-br"
				format="24hr"
				:allowed-minutes="allowed_minutes"
				:allowed-hours="allowed_hours"
				@update:hour="handleHourPicked"
				@update:minute="handleMinutePicked"
			>

			</v-time-picker>
			</v-fade-transition>
		</v-card>
		</v-locale-provider>
	</v-menu>

	<v-text-field
		v-else-if="type == 'time'"
		v-model="enableValue"
		v-bind="$attrs"
		ref="customInput"
		type="time"
		:density="density"
		:hide-details="hideDetails"
		:label="label"
		:variant="variant"
		:rules="fieldRules"
		:prepend-icon="prepend"
		:prepend-inner-icon="prependInner"
		:append-icon="appendIcon"
		:append-inner-icon="appendInnerIcon"
		:disabled="disabled"
		:rounded="rounded"
		:clearable="clearable"
		:color="color"
		:bg-color="backgroundColor"
		:loading="loading"
		:suffix="suffix"
		:prefix="prefix"
		:readonly="readonly"
		:hint="hint"
		:persistent-hint="persistentHint"
		validate-on="lazy blur"
		:class="required && !enableValue ? 'required-field custom-text-field' : 'custom-text-field'"
		@update:modalValue="onChange"
		@focus="onFocus"
		@blur="onBlur"
	/>

	

	<v-textarea
		v-else-if="type == 'textarea'"
		v-model="enableValue"
		ref="customInput"
		v-bind="$attrs"
		:no-resize="noResize"
		:density="density"
		:hide-details="hideDetails"
		:label="label"
		:variant="variant"
		:rules="fieldRules"
		:prepend-icon="prepend"
		:prepend-inner-icon="prependInner"
		:append-icon="appendIcon"
		:append-inner-icon="appendInnerIcon"
		:disabled="disabled"
		:rounded="rounded"
		:clearable="clearable"
		:color="color"
		:bg-color="backgroundColor"
		:loading="loading"
		:suffix="suffix"
		:prefix="prefix"
		:readonly="readonly"
		:hint="hint"
		:persistent-hint="persistentHint"
		:counter="counter"
		:rows="rows"
		:auto-grow="autogrow"
		:class="{ 'required-field': required && !enableValue }"
		@update:modalValue="onChange"
		@focus="onFocus"
		@blur="onBlur"
	/>
	<v-radio-group
		v-else-if="type == 'radio'"
		v-model="enableValue"
		v-bind="$attrs"
		ref="customInput"
		:inline="inline"
		:label="label"
		:color="color"
		:density="density"
		:disabled="disabled"
		:readonly="readonly"
		:multiple="multiple"
		:append-icon="appendIcon"
		:prepend-icon="prepend"
		:hide-details="hideDetails"
		:rules="fieldRules"
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
		v-else-if="type == 'combobox'"
		v-model="enableValue"
		ref="customInput"
		v-bind="$attrs"
		v-maska="`${composable_masks[mask]}`"
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
		:rules="fieldRules"
		:rounded="rounded"
		:color="color"
		:bg-color="backgroundColor"
		:disabled="disabled"
		:readonly="readonly"
		:hint="hint"
		:persistent-hint="persistentHint"
		:prepend-icon="prepend"
		:prepend-inner-icon="prependInner"
		:append-icon="appendIcon"
		:append-inner-icon="appendInnerIcon"
		:item-title="itemTitle"
		:return-object="itemValue ? false : true"
		:item-value="itemValue"
		:class="{ 'required-field': required && (enableValue === null || enableValue.length === 0) }"
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
		v-bind="$attrs"
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
		:append-icon="appendIcon"
		:clearable="clearable"
		:prepend-icon="prepend"
		:rounded="rounded"
		:hint="hint"
		:rules="fieldRules"
		:messages="messages"
		:hide-details="hideDetails"
		:append-inner-icon="appendInnerIcon"
		validate-on="lazy blur"
		:class="required ? 'required-field' : ''"
	>
		<template #selection="{ fileNames, index }" v-if="$slots.selection">
			<slot name="selection" v-bind="{ fileNames, index }"> </slot>
		</template>

		<template #message="{ message }" v-if="$slots.message">
			<slot name="message" v-bind="{ message }"> </slot>
		</template>

	</v-file-input>

	<v-checkbox
		v-else-if="type == 'checkbox'"
		v-model="enableValue"
		ref="customInput"
		:disabled="disabled"
		:readonly="readonly"
		:density="density"
		:rules="fieldRules"
		:append-icon="appendIcon"
		:prepend-icon="prepend"
		:label="label"
		:color="color"
		:hide-details="hideDetails"
	/>

	<v-select
    v-else-if="type == 'select'"
    v-model="enableValue"
    ref="customInput"
    v-bind="$attrs"
    :density="density"
    :hide-details="hideDetails"
    :label="label"
    :variant="variant"
    :rules="fieldRules"
    :prepend-icon="prepend"
    :prepend-inner-icon="prependInner"
    :append-icon="appendIcon"
    :append-inner-icon="appendInnerIcon"
    :disabled="disabled"
    :rounded="rounded"
    :clearable="clearable"
    :color="color"
    :bg-color="backgroundColor"
    :loading="loading"
    :suffix="suffix"
    :prefix="prefix"
    :readonly="readonly"
    :hint="hint"
    :persistent-hint="persistentHint"
    :chips="chips"
    :items="items"
    :no-data-text="noDataText"
    :multiple="multiple"
    :item-title="itemTitle"
    :return-object="itemValue ? false : true"
    :item-value="itemValue"
    :class="{ 'required-field': required && (enableValue === null || enableValue.length === 0) }"
    @update:modalValue="onChange"
    @focus="onFocus"
    @blur="onBlur"
  />

  <v-autocomplete
    v-else-if="type == 'autocomplete'"
    v-model="enableValue"
    ref="customInput"
    v-bind="$attrs"
    v-maska="`${composable_masks[mask]}`"
    :density="density"
    :hide-details="hideDetails"
    :label="label"
    :variant="variant"
    :rules="fieldRules"
    :prepend-icon="prepend"
    :prepend-inner-icon="prependInner"
    :append-icon="appendIcon"
    :append-inner-icon="appendInnerIcon"
    :disabled="disabled"
    :rounded="rounded"
    :clearable="clearable"
    :color="color"
    :bg-color="backgroundColor"
    :loading="loading"
    :suffix="suffix"
    :prefix="prefix"
    :readonly="readonly"
    :hint="hint"
    :persistent-hint="persistentHint"
    :chips="chips"
    :items="items"
    :no-data-text="noDataText"
    :multiple="multiple"
    :item-title="itemTitle"
    :item-props="itemProps"
    :return-object="itemValue ? false : true"
    :item-value="itemValue"
    :class="{ 'required-field': required && (enableValue === null || enableValue.length === 0) }"
    @update:modalValue="onChange"
    @focus="onFocus"
    @blur="onBlur"
  >
    <template #item="{ item, index }" v-if="$slots.item">
      <slot name="item" v-bind="{ item, index }" />
    </template>
    <template #selection="{ item, index }" v-if="$slots.selection">
      <slot name="selection" v-bind="{ item, index }" />
    </template>
  </v-autocomplete>
</template>

<script setup>
const props = defineProps({
	//* Default
	modelValue: { type: [String, Number, Boolean, Array, Object], default: null },
	value: { type: [String, Number, Boolean, Array, Object], default: null },
	type: { type: String, default: 'text' },
	//* Basics
	density: { type: String, default: 'compact' },
	label: { type: String, default: '' },
	variant: { type: String, default: 'outlined' },
	required: { type: Boolean, default: false },
	noDataText: { type: String, default: 'Nenhuma opção encontrada' },
	loading: { type: Boolean, default: false },
	disabled: { type: Boolean, default: false },
	readonly: { type: Boolean, default: false },
	counter: { type: [Boolean, Number], default: 30 },
	backgroundColor: { type: String, default: '#FFF' },
	hideDetails: { default: false },
	mask: { type: String, default: "default" },
	rows: { type: Number, default: 1 },
	autogrow: { type: Boolean, default: false },
	//* Styles
	color: { type: String, default: '#118b9f' },
	rounded: { type: [Boolean, String, Number] , default: 'md' },
	flat: { type: Boolean, default: true },
	//* Validations
	rules: { type: [Array, Boolean, String, Function], default: false },
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
	itemTitle: { type: [String, Function], default: 'title' },
	itemProps: { type: Function, default: () => {} },
	messages: { type: [String, Array], default: '' },
	hint: { type: String, default: '' },
	persistentHint: { type: Boolean, default: false },
	//* Icons
	suffix: { type: String, default: '' },
	prefix: { type: String, default: '' },
	prependBox: { type: String, default: '' },
	appendBox: { type: String, default: '' },
	prepend: { type: String, default: null },
	prependInner: { type: String, default: null },
	appendIcon: { type: String, default: null },
	appendInnerIcon: { type: String, default: null },
	noResize: { type: Boolean, default: true },
	accept: { type: String, default: '' },
	showPicker: { type: Boolean, default: true },
	max: { type: [Number, String, Boolean] },
	min: { type: [Number, String, Boolean] },
	minHour: { type: String },
	maxHour: { type: String },
	allowWeekends: { type: Boolean, default: false },
	comercialHoursOnly: { type: Boolean, default: true },
	restrictedDates: { type: Array, default: [] },
	allowZero: { type: Boolean, default: false },
	currency: { type: String, default: 'BRL'},
	//* Events
	onChange: { type: Function, default: () => {} },
	onFocus: { type: Function, default: () => {} },
	onBlur: { type: Function, default: () => {} },
});

const dayjs = useDayjs() ;
const emit = defineEmits(['update:modelValue', 'change', 'focus', 'blur']);

import { useCurrencyInput } from 'vue-currency-input';
const { inputRef, formattedValue, numberValue, setValue } = useCurrencyInput({
	currency: props.currency,
	autoDecimalDigits: true,
	currencyDisplay: 'hidden',
	hideCurrencySymbolOnFocus: false,
	hideGroupingSeparatorOnFocus: false,
	precision: 2,
	valueRange: { min: 0 },
});

const enableValue = computed({
	get: () => props.modelValue ?? props.value,
	set: (value) => emit('update:modelValue', value),
});

watch(enableValue, (value) => {
	if(props.mask == 'money') setValue(value)
});
watch(() => props.modelValue, (value) => {
	if(props.mask == 'money') setValue(value)
});

// DATE/DATETIME INPUTS

const type_dates = computed(() => {
  return {
    'date': {
      type: 'date',
      format: 'YYYY-MM-DD',
      min: props.min != undefined ? props.min : '2021-01-01',
      max: props.max != undefined ? props.max : '2030-12-31',
    },
    'datetime': {
      type: 'datetime-local',
      format: 'YYYY-MM-DDTHH:mm:ss',
      min: props.min != undefined ? props.min : '2021-01-01T00:00',
      max: props.max != undefined ? props.max : '2030-12-31T00:00',
      minH: props.minHour != undefined ? props.minHour : '07:30',
      maxH: props.maxHour != undefined ? props.maxHour : '18:30'
    },
  }
});

const datetimepicker = ref(false)

const pick_date = ref(true)
const pick_time = ref(false)

const typeCurrency = computed(() => props.currency === 'BRL' ? 'R$' : '$')

watch(datetimepicker, (enabled) => {
  if(enabled) {
    pick_date.value = true
  }
  else {
    pick_date.value = false
    pick_time.value = false
  }
})

const allowed_dates = (v) => {
  if(!v) return;
  let conditions = []
  if(props.restrictedDates.length > 0) conditions.push(restrict_dates)
  if(!props.allowWeekends) conditions.push(restrict_weekends);

  return conditions.every(condition => condition(v));
}

const restrict_weekends = (v) =>{
  const weekends = [6, 0]
  const day = dayjs(v).get('d')
  return !weekends.includes(day)
}
const restrict_dates = (v) => {
  const date = dayjs(v).format(type_dates.value['date'].format)
  return !props.restrictedDates.includes(date)
}

const insideDateRange = (v) => {
  const over_max = type_dates.value[props.type].max != false ? dayjs(v).isAfter(type_dates.value[props.type].max) : false
  const under_min = type_dates.value[props.type].min != false ? dayjs(v).isBefore(type_dates.value[props.type].min) : false
  if(props.readonly || props.disabled) return true;
  if(over_max) return 'Data acima do permitido'
  if(under_min) return 'Data abaixo do permitido'
  if(!allowed_dates(v)) return 'Data não permitida'
  if(props.type == 'datetime' && !allowed_time(v)) return 'Horário não permitido'
  return true
}
const insideTimeRange = (v) => {
  let value = dayjs().format(type_dates.value[props.type].format)
  const min = dayjs(value.replace(/T.+/, `T${type_dates.value[props.type].minH}`))
  const max = dayjs(value.replace(/T.+/, `T${type_dates.value[props.type].maxH}`))
  value = value.replace(/T.+/, `T${v}`)
  return (min.isSame(value) || max.isSame(value)) || (min.isBefore(value) && max.isAfter(value))
}

const fiveMinutesOnly = (v) => {
  return v % 5 == 0
};

let picked_hours = ref(null)

const allowed_hours = (v) => {
  if(!props.comercialHoursOnly) return true
  let max = type_dates.value[props.type].maxH?.replace(/:.+/, '') ?? 0
  let min = type_dates.value[props.type].minH?.replace(/:.+/, '') ?? 24
  max = parseInt(max); 
  min = parseInt(min);
  return v >= min && v <= max;
}

const allowed_minutes = (v) => {
  let first_hour = type_dates.value[props.type].minH.startsWith(`${picked_hours.value}`.padStart(2, '0'))
  let last_hour = type_dates.value[props.type].maxH.startsWith(`${picked_hours.value}`.padStart(2, '0'))
  let min = 0;
  let max = 60;
  if(first_hour) {
    min = Number(type_dates.value[props.type].minH.replace(/.+:/, ''))
  }
  if(last_hour) {
    max = Number(type_dates.value[props.type].maxH.replace(/.+:/, ''))
  }

  return v >= min && v <= max && fiveMinutesOnly(v);
}

const allowed_time = (v) => {
  if(!v) return;
  const match_time = v.match(/.+T(\d+):(\d+):?(.+)?/)
  if(!match_time) return;
  let hours = match_time[1] ?? '00'
  let minutes = match_time[2] ?? '00'
  let seconds = match_time[3] ?? '00'
  let time = `${hours}:${minutes}${seconds? `:${seconds}` : ''}` 
  let conditions = []
  if(props.comercialHoursOnly) conditions.push(insideTimeRange)

  return conditions.every(condition => condition(time));
}

const datePick = computed({
  get(){
    if(!enableValue.value) return;
    return dayjs(enableValue.value).toDate();
  },
  set(v) {
    const date = dayjs(v).format(type_dates.value[props.type].format)
    if(['datetime'].includes(props.type)){
      let time = enableValue.value ? enableValue.value.slice(10) : 'T08:00'
      enableValue.value = date.replace(/T.+/, time)
      pick_date.value = false
      setTimeout(() => {
        pick_time.value = true
      }, 300);
    }
    else {
      enableValue.value = date
      datetimepicker.value = false;
    }
  }
})

const timePick = computed({
  get: () => dayjs(datePick.value).format('HH:mm:ss'),
  set:(v) => {
    enableValue.value = enableValue.value.replace(/T.+/, `T${v.padEnd(5, ':00')}`)
    datetimepicker.value = false;
  }
})

const handleHourPicked = (v) => {
  picked_hours.value = `${v}`.padStart(2, '0')
}
const handleMinutePicked = (v) => {
  v = `${v}`.padStart(2, '0')
  timePick.value = `${picked_hours.value}:${v}`
}

//* RULES
const composable_rules = useRules();
const composable_masks = useMasks();

const fieldRules = computed(() => {
	const arr = [];
	if (props.required) {
		arr.push(composable_rules.required);
	}
	if(props.mask in composable_rules) {
		arr.push(composable_rules[props.mask])
	}
	if(props.mask == 'money' && !props.allowZero) {
		arr.push(composable_rules.overZero)
	}
	if (props.type === "textarea" && typeof props.counter =='number' ) arr.push(textAreaRule);

	
	const rules = Array.isArray(props.rules) ? props.rules.flat() : [props.rules].flat();

	if (rules.length > 0) {
		rules.forEach((rule) => {
			if (typeof rule === 'function') arr.push(rule);
		});
	}

	return arr
});

const textAreaRule = (v) => (v || "").length <= props.counter || `Máximo de ${props.counter} caracteres`;



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
		const res = await customInput.value?.validate();
		if(Array.isArray(res)) return {valid: res.length == 0, errors: res};
		return res.valid;
	},
	reset: async () => await customInput.value?.reset(),
	click: async () => await customInput.value?.click(),
});

const preventDefault = (e, d) => {
  e.preventDefault()
  if(!props.disabled && !props.readonly && props.showPicker) {
    d.onClick(e)
  }
}

</script>

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
input[type="date"]::-webkit-inner-spin-button,
input[type="datetime-local"]::-webkit-inner-spin-button,
input[type="date"]::-webkit-calendar-picker-indicator,
input[type="datetime-local"]::-webkit-calendar-picker-indicator {
    display: none;
    -webkit-appearance: none;
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


.required-field .v-label::before {
	content: '*\00a0';
	color: red;
}
</style>
