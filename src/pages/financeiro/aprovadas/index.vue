<template>
    <CustomHeader title="Enviar pagamentos - OMIE" />
    <LayoutForm>
        
        <v-form ref="form">

            <v-card class="card-box" flat>

                <v-row no-gutters class="row-text">
				    <CustomText title="Cliente" color="#118B9F" size="20" :bold="true" />
                </v-row>
                
                <v-row no-gutters class="row-input d-flex justify-space-between align-center ">
                    <v-col cols="5">
                        <CustomInput label="Selecione o cliente" type="autocomplete" v-model="selectedClient" :items="clients" itemValue="id" itemTitle="apelido" variant="solo-filled" />
                    </v-col>
                    <v-col class="ml-10">
                        <v-divider vertical color="#118B9F"></v-divider>
                        <CustomText :title="title" color="#118B9F" size="16" :bold="true" />
                    </v-col>
                </v-row>

                <v-row no-gutters>
                  
                </v-row>

            </v-card>

            <LayoutLoading v-if="loadingPayments" />

            <v-card class="card-box" flat v-else-if="showPayments">

                <v-row no-gutters class="row-text" justify="space-between">
                    <CustomText title="Pagamentos" color="#118B9F" size="20" :bold="true" />
                    <v-chip color="#F68A1A" text="Pagamentos aprovados pela gerência"></v-chip>
                </v-row>

                <v-card class="card-payment-box" flat v-for="(payment, index) in payments" :key="`${payment}-${index}`" @click="selectPayment(payment)">
                    
                    <v-row no-gutters class="ga-2">
                        <v-col cols="4">
                            <CustomInput label="Fornecedor" v-model="payment.fornecedor.razao_social" color="#118B9F" disabled variant="solo"/>
                        </v-col>
                        <v-col cols="1">
                            <CustomInput label="Valor" v-model="payment.valor_total" color="#118B9F" disabled variant="solo" mask="money" />
                        </v-col>
                        <v-col cols="1">
                            <CustomInput label="Data de Vencimento" v-model="payment.data_vencimento" color="#118B9F" disabled variant="solo" />
                        </v-col>
                        <v-col class="ml-10" v-if="payment.selectedOmie">
                            <v-icon color="green">mdi-check</v-icon>
                        </v-col>
                    </v-row>
                    <v-row no-gutters class="ga-2">
                        <v-col cols="4">
                            <CustomInput label="Forma de Pagamento" v-model="payment.tipo_pagamento.nome" color="#118B9F" disabled variant="solo"/>
                        </v-col>
                        <v-col cols="2" v-if="isTED(payment.tipo_pagamento.nome)">
                            <CustomInput label="Banco" v-model="payment.dados_bancarios.banco" color="#118B9F" disabled variant="solo" />
                        </v-col>
                        <v-col cols="2" v-if="isTED(payment.tipo_pagamento.nome)">
                            <CustomInput label="Agência" v-model="payment.dados_bancarios.agencia" color="#118B9F" disabled variant="solo" />
                        </v-col>
                        <v-col cols="2" v-if="isTED(payment.tipo_pagamento.nome)">
                            <CustomInput label="Conta" v-model="payment.dados_bancarios.conta" color="#118B9F" disabled variant="solo" />
                        </v-col>

                        <v-col cols="3" v-if="isPIX(payment.tipo_pagamento.nome)">
                            <CustomInput label="Chave PIX" v-model="payment.dados_bancarios.chave_pix" color="#118B9F" disabled variant="solo" />
                        </v-col>
                        <v-col cols="6" v-if="isBoleto(payment.tipo_pagamento.nome)">
                            <CustomInput label="Código de Barras" v-model="payment.dados_bancarios.codigo_barras" color="#118B9F" disabled variant="solo" />
                        </v-col>
                        <v-col cols="6" v-if="isPagOnline(payment.tipo_pagamento.nome)">
                            <CustomInput label="Link de Pagamento" v-model="payment.dados_bancarios.outhers" color="#118B9F" disabled variant="solo" />
                        </v-col>
                    </v-row>
                    <v-divider color="#118B9F"></v-divider>
                </v-card>

            </v-card>

            <v-row no-gutters align="center" justify="center" class="my-10" v-else-if="notExistPayments">
                <CustomText title="Selecione um cliente primeiro" color="#118B9F" size="20" :bold="true" class="text-center" />
            </v-row>

            <v-row no-gutters align="center" justify="center" class="my-10" v-else>
                <CustomText title="Selecione um cliente primeiro" color="#118B9F" size="20" :bold="true" class="text-center" />
            </v-row>

            <v-btn color="green" class="btn-send" icon size="75" @click="sendOmie" :loading="loading">
                <v-icon>mdi-send</v-icon>
                <v-tooltip text="Enviar OMIE" activator="parent" location="top"></v-tooltip>
            </v-btn>

        </v-form>

    </LayoutForm>
</template>
<script setup>

// * IMPORTS

import { getEmpresa, getPagamentoFinanceiro } from '@api';
import { set } from '~~/node_modules/nuxt/dist/app/compat/capi';
const { $toast } = useNuxtApp()

// * DATA

const clients = ref([])
const payments = ref([])
const loading = ref(false)
const showPayments = ref(false)
const selectedClient = ref(null)
const loadingPayments = ref(false)
const notExistPayments = ref(false)

// * COMPUTEDS

const isTED = (type) => type === 'TED'
const isPIX = (type) => type === 'PIX'
const isBoleto = (type) => type === 'Boleto'
const isPagOnline = (type) => type === 'Pagamento Online'

const title = computed(() => `Pagamentos selecionados: ${countPayments.value}`)

// * METHODS

const getClients = async () => {
    try {
        const { success, message, data } = await getEmpresa()
        
        if(!success) throw new Error(message)

        clients.value = data
        console.log(clients.value)

    } catch (error) {
        console.log(error.message)
        $toast.error('Erro ao buscar clientes')
    }
}

const getPayment = async () => {
    loadingPayments.value = true
    try {
        const { success, message, data } = await getPagamentoFinanceiro()
        
        if(!success) throw new Error(message)

        data.map(payment => {
            payment.data_vencimento = new Date(payment.data_vencimento).toLocaleDateString()
            payment.dados_bancarios = JSON.parse(payment.dados_bancarios)
            payment.selectedOmie = false
        })

        const pagamentos = data.filter(payment => payment.empresa_id === selectedClient.value)

        console.log(pagamentos);

        payments.value = pagamentos

        if(payments.value.length === 0) notExistPayments.value = true
        if(payments.value.length > 0) showPayments.value = true

        console.log(payments.value)

        loadingPayments.value = false

    } catch (error) {
        console.log(error.message)
        $toast.error('Erro ao buscar pagamentos')
    }
}

const selectPayment = (id) => {
    const payment = payments.value.find(payment => payment.id === id.id);
    payment.selectedOmie = !payment.selectedOmie
}

const countPayments = computed(() => payments.value.filter(payment => payment.selectedOmie).length)

const sendOmie = () => {
    loading.value = true
    setTimeout(() => {
        loading.value = false
        $toast.success('Pagamentos enviados com sucesso')
    }, 2000)
}

// * HOOKS

await getClients()

watch(selectedClient, async () => {
    if(selectedClient.value) await getPayment()
})

</script>
<style scoped>

.card-box{
	background-color: white;
	border-radius: 6px;
    margin-bottom: 8px;
}

.row-text{
    margin: 10px;
}

.row-input{
    margin-left: 10px;
}

.card-payment-box{
    background-color: #F5F5F5;
    border-radius: 6px;
    margin: 10px;
    padding: 10px;
}

.btn-send{
    position: fixed;
    bottom: 25px;
    right: 20px;
    padding: 10px 20px;
    font-size: 16px;
    font-weight: bold;
    color: white;
    background-color: #118B9F;

}

</style>