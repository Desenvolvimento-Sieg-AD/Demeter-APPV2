<template>
    <CustomHeader title="Enviar pagamentos - OMIE" />
    <LayoutForm>
        
        <v-form ref="form">

            <v-card class="card-box" flat>

                <v-row no-gutters class="row-text">
				    <CustomText title="Cliente" color="#118B9F" size="20" :bold="true" />
                </v-row>
                
                <v-row no-gutters class="row-input-header">
                    <v-col cols="5">
                        <CustomInput label="Selecione o cliente" type="autocomplete" v-model="selectedClient" :items="clients" itemValue="id" itemTitle="apelido" variant="solo-filled" />
                    </v-col>
                    <v-col class="text-header mb-5">
                        <v-divider vertical color="#118B9F"></v-divider>
                        <CustomText :title="paymentsCountTitle" color="#118B9F" size="16" :bold="true" />
                    </v-col>
                </v-row>

                <v-row no-gutters>
                  
                </v-row>

            </v-card>

            <LayoutLoading v-if="loadingPayments" />

            <v-card class="card-box" flat v-else-if="showPayments">

                <v-row no-gutters class="row-text" justify="space-between">
                    <CustomText title="Pagamentos" color="#118B9F" size="20" :bold="true" />
                    <div>
                        <v-btn color="green" variant="text" v-if="hasPaymentSuccessFul" @click="sendPaidPayments">
                            Pagar
                            <v-tooltip text="Pagar os pagamentos que foram lançados com sucesso" activator="parent" location="top"></v-tooltip>
                        </v-btn>
                        <v-chip color="#F68A1A" text="Pagamentos aprovados pela gerência"></v-chip>
                    </div>

                </v-row>

                <v-card :class="{'card-payment-box': true, 'selected-box': payment.selectedOmie}" flat v-for="(payment, index) in payments" :key="`${payment}-${index}`" @click="selectPayment(payment.id)" :disabled="payment.identificacao_externa">
                    
                    <v-row no-gutters class="ga-2 mb-3">
                        <v-col cols="4">
                            <CustomInput label="Fornecedor" v-model="payment.fornecedor.razao_social" color="#118B9F" disabled hide-details/>
                        </v-col>
                        <v-col cols="1">
                            <CustomInput label="Valor" v-model="payment.valor_total" color="#118B9F" disabled mask="money" hide-details />
                        </v-col>
                        <v-col cols="1">
                            <CustomInput label="Data de Vencimento" v-model="payment.data_vencimento" color="#118B9F" disabled hide-details />
                        </v-col>
                        <v-col class="icon-box">

                            <div class="d-flex align-center justify-space-between">

                                <div class="mr-3">
                                    <v-chip v-if="sentWithSuccess(payment)" color="green" text="Enviado pro Omie"></v-chip>
                                    <v-chip v-if="sentAndError(payment)" color="red" text="Erro ao enviar pro Omie"></v-chip>
                                </div>

                                <div>
                                    <v-icon class="mr-2" :key="payment.id" color="primary">
                                        {{ paymentSelectedOrNot(payment.selectedOmie) }}
                                    </v-icon>
                                        <v-tooltip text="Selecionar pagamento" activator="parent" location="top"/>
                                    </div>
                                <div>

                                    <v-btn flat icon @click.stop="editPayment(payment.id)" variant="plain" color="primary" size="40">
                                        <v-icon>mdi-pencil</v-icon>
                                        <v-tooltip text="Editar pagamento" activator="parent" location="top" />
                                    </v-btn>

                                    <v-btn flat icon @click.stop="cancelPayment([payment.id])" variant="plain" color="red" size="40">
                                        <v-icon>mdi-cancel</v-icon>
                                        <v-tooltip text="Cancelar pagamento" activator="parent" location="top" />
                                    </v-btn>

                                </div>
                            </div>
                        </v-col>
                    </v-row>
                    <v-row no-gutters class="ga-2 mb-3">
                        <v-col cols="4">
                            <CustomInput label="Forma de Pagamento" v-model="payment.tipo_pagamento.nome" color="#118B9F" disabled hide-details/>
                        </v-col>
                        <v-col cols="2" v-if="isTED(payment.tipo_pagamento.nome)">
                            <CustomInput label="Banco" v-model="payment.dados_bancarios.banco" color="#118B9F" disabled hide-details/>
                        </v-col>
                        <v-col cols="2" v-if="isTED(payment.tipo_pagamento.nome)">
                            <CustomInput label="Agência" v-model="payment.dados_bancarios.agencia" color="#118B9F" disabled hide-details/>
                        </v-col>
                        <v-col cols="2" v-if="isTED(payment.tipo_pagamento.nome)">
                            <CustomInput label="Conta" v-model="payment.dados_bancarios.conta" color="#118B9F" disabled hide-details/>
                        </v-col>

                        <v-col cols="3" v-if="isPIX(payment.tipo_pagamento.nome)">
                            <CustomInput label="Chave PIX" v-model="payment.dados_bancarios.chave_pix" color="#118B9F" disabled hide-details/>
                        </v-col>
                        <v-col cols="6" v-if="isBoleto(payment.tipo_pagamento.nome)">
                            <CustomInput label="Código de Barras" v-model="payment.dados_bancarios.codigo_barras" color="#118B9F" disabled hide-details/>
                        </v-col>
                        <v-col cols="6" v-if="isPagOnline(payment.tipo_pagamento.nome)">
                            <CustomInput label="Link de Pagamento" v-model="payment.dados_bancarios.outhers" color="#118B9F" disabled hide-details/>
                        </v-col>
                    </v-row>
                    <v-row class="mb-3">
                        <v-col cols="4" v-if="payment.enviado_externo && payment.retorno_externo.codigo_status !== '0'">
                            <CustomInput v-model="payment.retorno_externo.codigo_status" :backgroundColor="typeReturn(payment)" readonly hide-details/>
                        </v-col>
                        <v-col cols="6" v-if="payment.enviado_externo">
                            <CustomInput v-model="payment.retorno_externo.descricao_status" :backgroundColor="typeReturn(payment)" readonly hide-details/>
                        </v-col>
                    </v-row>
                    <v-divider color="#118B9F"></v-divider>
                </v-card>

            </v-card>

            <v-row no-gutters align="center" justify="center" class="my-10" v-else-if="notExistPayments">
                <CustomText title="Não existe pagamentos nesse cliente" color="#118B9F" size="20" :bold="true" class="text-center" />
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

import dayjs from '#build/dayjs.imports.mjs';
import { getEmpresa, getClientByPayment, getPagamentoByClient, sendPaymentsToOmie, postStatus } from '@api';
const { $toast } = useNuxtApp()
const router = useRouter();

// * DATA

const clients = ref([])
const payments = ref([])
const loading = ref(false)
const countPayments = ref(0)
const showPayments = ref(false)
const selectedClient = ref(null)
const loadingPayments = ref(false)
const notExistPayments = ref(false)

// * COMPUTEDS

const paymentsCountTitle = computed(() => `Pagamentos selecionados: ${countPayments.value}`)
const hasPaymentSuccessFul = computed(() => payments.value.some(payment => payment.enviado_externo && payment.identificacao_externa))

// * METHODS

const isPIX = (type) => type === 'PIX'
const isTED = (type) => type === 'TED'
const isBoleto = (type) => type === 'Boleto'
const isPagOnline = (type) => type === 'Pagamento Online'

const editPayment = (id) => router.push({ path: '../novo/pagamento', query: { id }});
const sentAndError = (payment) => payment.enviado_externo && !payment.identificacao_externa
const sentWithSuccess = (payment) => payment.enviado_externo && payment.identificacao_externa

const getClients = async () => {
    try {
        const { success, message, data } = await getClientByPayment()
        
        if(!success) throw new Error(message)

        clients.value = data

    } catch (error) {
        console.log(error.message)
        $toast.error('Erro ao buscar clientes')
    }
}

const getPayment = async () => {
    loadingPayments.value = true;
    showPayments.value = false;
    notExistPayments.value = false;

    try {

        const {success, message, data} = await getPagamentoByClient(selectedClient.value);
        
        if (!success) throw new Error(message);

        data.forEach(payment => {
            payment.data_vencimento = new Date(payment.data_vencimento).toLocaleDateString();
            payment.dados_bancarios = typeof payment.dados_bancarios === 'string' ? JSON.parse(payment.dados_bancarios) : payment.dados_bancarios;
            payment.retorno_externo = typeof payment.retorno_externo === 'string' ? JSON.parse(payment.retorno_externo) : payment.retorno_externo;
            payment.selectedOmie = false;
        });
        
        payments.value = data;
        showPayments.value = payments.value.length > 0;
        notExistPayments.value = payments.value.length === 0;
        loadingPayments.value = false;

    } catch (error) {
        console.error(error.message);  
        $toast.error('Erro ao buscar pagamentos');
    }
}

const selectPayment = (id) => {
    const payment = payments.value.find(payment => payment.id === id);
    payment.selectedOmie = !payment.selectedOmie
    countPayments.value = payments.value.filter(payment => payment.selectedOmie).length 
}

const paymentSelectedOrNot = (selected) => {
    if(selected) return 'mdi-checkbox-marked'
    return 'mdi-checkbox-blank-outline'
}

const typeReturn = (payment) => {
    if(payment.enviado_externo && !payment.identificacao_externa) return '#e75c51'
    else return 'green' 
}

const sendOmie = async () => {
    loading.value = true;

    let errorCount = 0;
    let successCount = 0;
    const paymentsToSend = payments.value.filter(payment => payment.selectedOmie);

    for await (const payment of paymentsToSend) {
        try {
            const response = await sendPaymentsToOmie(payment.id);
            if (!response.data.success) throw new Error(response.message);
            successCount++;
        } catch (error) {
            errorCount++;
            console.error(error.message);
        }
    }

    await getPayment();
    loading.value = false;

    if (errorCount === 0) {
        $toast.success('Todos os pagamentos foram enviados com sucesso');
    } else {
        $toast.error(`Alguns pagamentos falharam. Sucessos: ${successCount}, Falhas: ${errorCount}`);
    }

}

const sendPaidPayments = async () => {
    loading.value = true;

    const paymentsToSend = payments.value
        .filter(payment => payment.enviado_externo && payment.identificacao_externa)
        .map(payment => payment.id)
  
    try {
        const { success, message } = await postStatus({ id: paymentsToSend, status: 6 });

        if (!success) throw new Error(message);

        $toast.success('Pagamentos pagos com sucesso');

        await getPayment();

    } catch (error) {
        console.error(error.message);
        $toast.error('Erro ao pagar pagamentos');
    }

    loading.value = false;
}

const cancelPayment = async (id) => {
    try {
        const { success, message } = await postStatus({ id, status: 7 });

        if (!success) throw new Error(message);

        $toast.success('Pagamento cancelado com sucesso');

        await getPayment();

    } catch (error) {
        console.error(error.message);
        $toast.error('Erro ao cancelar pagamento');
    }
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

.icon-box{
    display: flex;
    justify-content: end;
    align-items: center;
}

.text-header{
    display: flex;
    justify-content: center;
    align-items: center;
    margin-left: 750px;
    }

.row-input-header{
    margin-left: 10px;
    display: flex;
    justify-content: space-evenly;
    align-items: center;
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

.selected-box{
    background-color: #5d82882a;
}

</style>