<template>
  <CustomText title="Pagamento" class="ml-3" color="#118B9F" size="18" :bold="true" />
  <v-row class="pa-3 mb-n5">
    <v-col cols="3">
      <CustomInput
        append-inner-icon="mdi-cash-clock"
        type="select"
        required
        label="Forma de pagamento"
        :items="paymentsType"
        v-model="formValue.tipo_id"
        itemValue="id"
        itemTitle="nome"
        hide-details
        :change="validPaymentType()"
      />
    </v-col>

    <v-col cols="3">
      <CustomInput type="date" required label="Data de vencimento" v-model="formValue.data_vencimento" :messages="messagesDate()" :min="minDate" />
    </v-col>

    <v-col v-if="isInternacional">
      <CustomInput type="text" mask="money" currency="USD" required label="Valor em Dólar" v-model="formValue.valor_total_dolar" hide-details />
    </v-col>

    <v-col>
      <CustomInput type="text" mask="money" currency="BRL" required :label="isInternacional ? 'Valor Estimado ' : 'Valor Total'" v-model="formValue.valor_total" hide-details />
    </v-col>

    <v-col cols="1">
      <CustomInput type="checkbox" label="Urgente" v-model="formValue.urgente" hide-details color="primary" />
    </v-col>

    <v-col cols="1" v-if="userIsAllowed">
      <CustomInput type="checkbox" label="Privado" v-model="formValue.privado" hide-details color="primary" />
    </v-col>

  </v-row>

  <v-row class="pa-3 mt-n12" v-if="!tiposNormalize.includes(form.tipo_id)">
    <v-col v-if="formValue.tipo_id === 1" cols="3">
      <CustomInput v-model="formValue.tipo_chave_pix_id" append-inner-icon="mdi-key" type="select" required :items="chavesPix" itemTitle="nome" itemValue="id" label="Tipo de Chave" />
    </v-col>

    <v-col>
      <CustomInput
        v-if="formValue.tipo_chave_pix_id !== 4"
        :disabled="!tipos.descricao"
        type="text"
        :label="!tipos.descricao ? 'Descrição' : tipos.descricao"
        v-model="formValue.dados_bancarios.outhers"
        :mask="formValue.tipo_id === 1 ? maskDescriptionPIX : maskDescriptionOuthers"
        appen-innerColor="#118B9F"
        append-inner-icon="mdi-content-copy"
        @click:append-inner="pasteFromClipBoardDadosBancarios"
        :required="tipos.obrigatorio"
      />

    <CustomInput
      v-else
      type="text"
      label="E-mail"
      append-inner-icon="mdi-content-copy"
      v-model="formValue.dados_bancarios.outhers"
      :required="tipos.obrigatorio"
      :rules="emailRules"
    />

    </v-col>
  </v-row>

  <v-row class="pa-3 mt-n11" v-else-if="form.tipo_id === 2">
    <v-col>
      <CustomInput type="text" mask="number" label="Banco" v-model="formValue.dados_bancarios.banco" required :max="3" />
    </v-col>

    <v-col>
      <CustomInput type="text" mask="number" label="Agência" v-model="formValue.dados_bancarios.agencia" required :max="4" />
    </v-col>

    <v-col>
      <CustomInput type="text" mask="number" label="Conta" v-model="formValue.dados_bancarios.conta" required />
    </v-col>

    <v-col>
      <CustomInput type="text" mask="number" label="Dígito" v-model="formValue.dados_bancarios.digito" required :max="1" />
    </v-col>
  </v-row>

  <v-row class="pa-3 mt-n11" v-else>
    <v-col>
      <CustomInput type="autocomplete" label="Cartão" v-model="formValue.conta_id" required :items="cards" itemTitle="descricao" itemValue="id" />
    </v-col>
  </v-row>

  <v-row v-if="formValue.urgente" class="pa-3 mt-n11">
    <v-col>
      <CustomInput type="textarea" :required="formValue.urgente" :rows="1" label="Justificativa da urgência" v-model="formValue.justificativa_urgente" :counter="600" />
    </v-col>
  </v-row>
</template>
<script setup>

import { useAuthStore } from '~/store/auth'
import { getPagamentoTipo, getTiposChavePix, getCard, getContasDisponiveis } from '@api'

const dayjs = useDayjs()

const route = useRoute()

const emit = defineEmits(['update:form'])

const { $toast } = useNuxtApp()
const { user } = useAuthStore()

const props = defineProps({
  form: { type: Object, default: {} },
  paymentsType: { type: Array, default: [] }
})

const formValue = computed({
  get: () => props.form,
  set: (value) => emit('update:form', value)
})

const tipos = ref(false)
const cards = ref([])
const chavesPix = ref([])

const emailRules = [(v) => /.+@.+\..+/.test(v) || 'E-mail inválido']

const tiposNormalize = [2, 5, 6]

const isExpired = computed(() => dayjs(formValue.value.data_vencimento).isBefore(dayjs().subtract(1, 'day')))

const maskDescriptionPIX = computed(() => {
  const tipo = chavesPix?.value.find((chave) => chave?.id === formValue.value.tipo_chave_pix_id)
  return tipo?.mask
})

const maskDescriptionOuthers = computed(() => {
  const tipo = props.paymentsType.find((tipo) => {
    return tipo.id === formValue.value.tipo_id
  })
  return tipo?.mask
})

const validDateToCard = computed(() => isExpired.value && formValue.value.tipo_id !== 5 && formValue.value.tipo_id !== 6)

const labelValue = computed(() => {
  if (formValue.value.fornecedor.internacional) return 'Valor Estimado em Reais'
  return 'Valor Total'
})

const isInternacional = computed(() => formValue.value.fornecedor.internacional)

const messagesDate = () => {
  if (isExpired.value && validDateToCard.value) return 'Data de vencimento inválida'
  return ''
}

const minDate = computed(() => {
  if (formValue.value.tipo_id === 5 || formValue.value.tipo_id === 6) return dayjs().subtract(30, 'day').format('YYYY-MM-DD')
  return dayjs().format('YYYY-MM-DD')
})

const userIsAllowed = computed(() => {
  const setoresAllowed = [3, 5, 12]
  return user.setores.some((setor) => setoresAllowed.includes(setor.id))
})

const validPaymentType = () => {
  tipos.value = false
  const type = props.paymentsType.find((type) => type.id === formValue.value.tipo_id)
  if (type) tipos.value = type
}

const pasteFromClipBoardDadosBancarios = async () => {
  try {
    const text = await navigator.clipboard.readText()
    formValue.value.dados_bancarios.outhers = text
  } catch (error) {
    console.error('Erro ao acessar a área de transferência:', error)
  }
}

const dateRules = (v) => {
  if (formValue.value.tipo_id === 5 || formValue.value.tipo_id === 6) {
    return dayjs(v).isAfter(dayjs().subtract(30, 'day')) || 'Data inválida'
  }
  return true
}

const getTiposChave = async () => {
  try {
    const { success, message, data } = await getTiposChavePix()

    if (!success) throw new Error(message)

    chavesPix.value = data
  } catch (error) {
    console.log(error.message)
    $toast.error(error.message)
  }
}

const getCards = async () => {
  try {
    
    if (!formValue.value.empresa_id) return $toast.error('Selecione uma empresa')
    if (!formValue.value.tipo_id) return $toast.error('Selecione um tipo de pagamento')

    const { success, message, data } = await getContasDisponiveis(formValue.value.empresa_id, formValue.value.tipo_id)
    if (!success) throw new Error(message)

    cards.value = data
  } catch (error) {
    console.log(error.message)
    $toast.error(error.message)
  }
}

await getTiposChave()

watch(() => formValue.value.tipo_chave_pix_id, async (newValue, oldValue) => {

  if(newValue !== oldValue && oldValue) {
    formValue.value.dados_bancarios.outhers = null
    
  }
}, { immediate: true })

watch(() => formValue.value.tipo_id, (value) => {
    if (value == 5 || value == 6) {
      try {
        getCards()
      } catch (error) {
        console.error(error.message)
      }
    }
  },{ immediate: true }
)

watch(() => formValue.value.empresa_id, (value) => {
  if (value == 5 || value == 6) {
    try {
      getCards()
    } catch (error) {
      console.error(error.message)
    }
  }
  },{ immediate: true }
)


</script>
