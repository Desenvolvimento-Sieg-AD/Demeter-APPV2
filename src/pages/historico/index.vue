<template>
  <div>
    <LayoutForm>
      
      <CustomTable
        :columns="colums"
        :items="pagamentos"
        :actions="actions"
        :loading="loading"
        scrolling="standard"
        allow-search
        store-state
        key-stored="pagamentos-historico-table"
        :noDataText="'Não há registros de pagamentos'"
        allowColumnResizing
        choose-columns
        allow-column-reordering
        :allowed-page-sizes="[5, 10, 15, 25]"
        :page-size="25"
        companiesFilter
        pager
        height="calc(100vh - 170px)"
      >
      <template #[`item-usuario.sigla`]="{ data: { data: item } }">
          <div>
            <v-tooltip :text="item.usuario.nome" activator="parent" location="bottom" />
            {{ item.usuario.sigla }}
          </div>
        </template>

        <template #item-categoria="{ data: { data: item } }">
          <div class="d-flex align-center justify-center text-center">
            {{ item.categoria.nome }}
          </div>
        </template>

        <template #item-tipo="{ data: { data: item } }">
          <div class="d-flex align-center justify-center text-center">
            {{ item.fornecedor.tipo === 'juridico' ? 'Jurídico' : 'Físico' }}
          </div>
        </template>
        <template #item-movimentacoes_pagamento[0].status_pagamento.nome="{ data: { data: item } }">
          <div class="d-flex align-center justify-center text-center">
            <v-chip :color="item.movimentacoes_pagamento[0]?.status_pagamento?.cor">
              <p class="font-weight-bold">
                {{ item.movimentacoes_pagamento[0]?.status_pagamento?.label }}
              </p>
            </v-chip>
          </div>
        </template>

        <template #item-documento="{ data: { data: item } }">
          <div class="d-flex align-center justify-center text-center">
            {{ defineDocument(item.fornecedor.tipo, item.fornecedor.documento) }}
          </div>
        </template>

        <template #item-anexo="{ data: { data: item } }">
          <div class="d-flex align-center justify-center text-center">
            <div v-if="notaFiscal(item.anexos_pagamento)">
              <v-icon @click="openBase64File(notaFiscal(item.anexos_pagamento).id)" color="blue" class="cursor-pointer"> mdi-paperclip </v-icon>
              <v-tooltip text="Abrir Nota Fiscal" activator="parent" location="top" />
            </div>

            <div v-else>
              <v-icon disabled color="gray"> mdi-paperclip </v-icon>
              <v-tooltip text="Sem Nota Fiscal" activator="parent" location="top" />
            </div>
          </div>
        </template>

        <template #item-doc="{ data: { data: item } }">
          <div class="d-flex align-center justify-center text-center">
            <div v-if="documentoAnexo(item.anexos_pagamento)">
              <v-icon @click="openBase64File(documentoAnexo(item.anexos_pagamento).id)" color="blue" class="cursor-pointer"> mdi-paperclip </v-icon>
              <v-tooltip text="Abrir Anexo" activator="parent" location="top" />
            </div>

            <div v-else>
              <v-icon disabled color="gray">mdi-paperclip</v-icon>
              <v-tooltip text="Sem Anexo" activator="parent" location="top" />
            </div>
          </div>
        </template>

        <template #item-data_vencimento="{ data: { data: item } }">
          <div class="d-flex align-center justify-center text-center">
            {{ formatDate(item.data_vencimento) }}
          </div>
        </template>

        <template #item-data_pagamento="{ data: { data: item } }">
          <div class="d-flex align-center justify-center text-center">
            {{ formatDate(item.data_pagamento) }}
          </div>
        </template>

        <template #item-data_aprovacao="{ data: { data: item } }">
          <div class="d-flex align-center justify-center text-center">
            {{ formatDate(item.movimentacoes_pagamento[0].data_inicio) }}
          </div>
        </template>

        <template #item-created_at="{ data: { data: item } }">
          <div class="template">
            {{ formatDate(item.created_at) }}
          </div>
        </template>

        <template #item-valor_total="{ data: { data: item } }">
          <div class="d-flex align-center justify-center text-center">
            {{ formatCurrency(item.valor_total) }}
          </div>
        </template>

        <template #[`item-setor_referencia.nome`]="{ data: { data: item } }">
          <div class="d-flex align-center justify-center text-center">
            <v-tooltip :text="item.setor_referencia.nome" activator="parent" location="bottom" />
            {{ item.setor_referencia.sigla }}
          </div>
        </template>

        <template #[`#item-empresa.apelido`]="{ data: { data: item } }">
          <div class="d-flex align-center justify-center text-center">
            <v-tooltip :text="item.empresa.nome" activator="parent" location="bottom" />
            {{ item.empresa.apelido }}
          </div>
        </template>

      </CustomTable>
    </LayoutForm>
    <LazyModalPagamento v-model:enable="enableModal" :id="itemView.id" />
  </div>
</template>

<script setup>
import { getPagamentoByScope } from '~/api';

const { $toast } = useNuxtApp()
const { openBase64File } = useOs()

const colums = getColumns('historico')
const pagamentos = ref([])
const loading = ref(false)
const enableModal = ref(false)
const itemView = ref({})

const actions = computed(() => [
  {
    icon: 'mdi-eye',
    tooltip: 'Ver detalhes',
    click: (item) => {
      itemView.value = item
      enableModal.value = true
    },
    active: true,
    type: 'padrao',
    name: 'ver'
  }
])

const notaFiscal = (anexos) => anexos.find((anexo) => anexo.tipo_anexo_id === 3)

const documentoAnexo = (anexos) => anexos.find((anexo) => anexo.tipo_anexo_id === 4)

const defineDocument = (tipo, documento) => (tipo === 'juridico' ? maskCnpj(documento) : maskCpf(documento))

const getPagamentos = async () => {
  loading.value = true;

  try {
    const { success, message, data } = await getPagamentoByScope('geral')
    if (!success) throw new Error(message)
  
    pagamentos.value = data
  }
  catch (error) {
    console.error(error)
    $toast.error('Erro ao buscar pagamentos')
  }

  loading.value = false
}

getPagamentos()
</script>

<style scoped>
.btn-container {
  display: flex;
  justify-content: flex-end;
  margin: 10px 0;
}

.custom-btn {
  margin-right: 10px;
}
</style>
