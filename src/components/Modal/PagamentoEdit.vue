<template>
  <Modal v-model:enable="enableValue" :actions="actions" title="Editar Pagamento" width="auto">
    <template #content>
      <LayoutLoading v-if="loading" />

      <div v-else-if="pagamento">
        <LayoutTitle title="Dados do Pagamento" :margin="false" >
          <div>
            <v-chip v-if="pagamento.urgente" text="Urgente" color="red" variant="tonal" class="mr-1" />
            <v-chip v-if="pagamento.privado" text="Privado" color="purple" variant="tonal" class="mr-1" />
            <v-chip v-if="fornecedor.internacional" text="Internacional" color="blue" variant="tonal" class="mr-1" />
            <v-chip :color="ultimaMovimentacao.status_pagamento.cor" :text="ultimaMovimentacao.status_pagamento.nome" variant="tonal" />
          </div>
        </LayoutTitle>

        <v-alert type="warning" icon="mdi-alert" density="compact" variant="tonal" >
          {{ ultimaMovimentacao.justificativa ?? ultimaMovimentacao.justificativa_solicitante }}
        </v-alert>

        <v-divider class="my-4"  />

        <v-row align="center" style="max-height: calc(100vh - 620px); overflow-y: auto">
          <v-col cols="3">
            <CustomInput disabled label="Solicitante" hide-details v-model="pagamento.usuario.sigla" />
          </v-col>

          <v-col cols="3" >
            <CustomInput disabled label="Setor Referência" hide-details v-model="pagamento.setor_referencia.nome" />
          </v-col>

          <v-col cols="3" >
            <CustomInput type="autocomplete" required itemValue="id" itemTitle="nome" :items="setores" label="Setor Solicitante" :itemProps="setorProps" hide-details v-model="pagamento.setor_solicitante.nome" />
          </v-col>

          <v-col cols="3">
            <CustomInput disabled type="datetime" label="Data Solicitação" hide-details v-model="pagamento.data_solicitacao" />
          </v-col>

          <v-divider class="mx-3 my-1" />

          <v-col cols="3">
            <CustomInput type="autocomplete" required itemValue="id" itemTitle="apelido" :items="empresas" label="Empresa Pagadora" hide-details v-model="pagamento.empresa_id" />
          </v-col>

          <v-col cols="4">
            <CustomInput type="autocomplete" required itemValue="id" itemTitle="nome" :items="grupos" label="Grupo" hide-details v-model="grupo_id" />
          </v-col>

          <v-col cols="5">
            <CustomInput type="autocomplete" required itemValue="id" itemTitle="nome" :items="selectedCategories" label="Categoria" hide-details v-model="pagamento.categoria_id" />
          </v-col>

          <v-divider class="mx-3 my-1" />

          <!-- Nacional -->

          <v-col cols="9" v-if="!isInternacional">
            <CustomInput disabled label="Fornecedor" :items="fornecedores" hide-details v-model="fornecedor.razao_social" />
          </v-col>

          <v-col cols="3" v-if="!isInternacional">
            <CustomInput disabled label="Documento" hide-details v-model="documentoFormatado" :value="documentoFormatado" />
          </v-col>

          <v-col cols="3" v-if="!isInternacional">
            <CustomInput label="Número NF" hide-details v-model="pagamento.numero_nf" />
          </v-col>

          <v-col cols="9" v-if="!isInternacional">
            <CustomInput label="Chave de Acesso" hide-details v-model="pagamento.chave_nf" />
          </v-col>

          <!-- Internacional -->

          <v-col cols="7" v-if="isInternacional">
            <CustomInput disabled label="Fornecedor" :items="fornecedores" hide-details v-model="fornecedor.razao_social" />
          </v-col>
          
          <v-col cols="5" v-if="isInternacional">
            <CustomInput :label="isInternacional ? 'Invoice' : 'Número NF'" hide-details v-model="pagamento.numero_nf" />
          </v-col>

          <v-col cols="12"> 
            <CustomInput type="autocomplete" :required="requer_projeto" itemValue="id" itemTitle="nome" :items="projetos" label="Projeto" hide-details v-model="pagamento.projeto_id" />
          </v-col>
          
          <v-divider class="mx-3 my-1" />

          <!-- Valores e Vigências -->

          <v-col v-if="isInternacional" cols="3">
            <CustomInput disabled label="Valor em Dólar" hide-details mask="money" currency="USD" v-model="pagamento.valor_total_dolar" />
          </v-col>

          <v-col cols="3">
            <CustomInput label="Valor" hide-details mask="money" v-model="pagamento.valor_total" />
          </v-col>

          <v-col :cols="isInternacional ? '3' : '6'">

          </v-col>

          <v-col cols="3">
            <CustomInput type="date" label="Vencimento" hide-details v-model="pagamento.data_vencimento" />
          </v-col>

          <!-- Forma de Pagamento -->

          <v-col cols="3">
            <CustomInput type="select" required itemValue="id" itemTitle="nome" :items="tiposPagamento" label="Forma de Pagamento" hide-details v-model="pagamento.tipo_id" />
          </v-col>

          <!-- Cartão -->

          <v-col cols="3" v-if="pagamento.tipo_id == 5 || pagamento.tipo_id == 6">
            <CustomInput type="select" required itemValue="id" itemTitle="descricao" :items="empresaCartoes" label="Conta" hide-details v-model="pagamento.conta_id" />
          </v-col>

          <!-- PIX -->

          <v-col v-if="pagamento.tipo_id == 1" cols="3">
            <CustomInput type="autocomplete" required itemValue="id" itemTitle="nome" :items="tiposChavePix" label="Tipo de Chave" hide-details v-model="pagamento.tipo_chave_pix_id" />
          </v-col>

          <v-col v-if="pagamento.tipo_id == 1 && pagamento.tipo_chave_pix_id" cols="6">
            <CustomInput label="Chave Pix" required hide-details v-model="pagamento.dados_bancarios.chave_pix" />
          </v-col>

          <!-- TED -->

          <v-col cols="3" v-if="pagamento.tipo_id == 2">
            <CustomInput label="Banco" required hide-details v-model="pagamento.dados_bancarios.banco" />
          </v-col>

          <v-col cols="2" v-if="pagamento.tipo_id == 2">
            <CustomInput label="Agência" required hide-details v-model="pagamento.dados_bancarios.agencia" />
          </v-col>

          <v-col cols="3" v-if="pagamento.tipo_id == 2">
            <CustomInput label="Conta" required hide-details v-model="pagamento.dados_bancarios.conta" />
          </v-col>

          <v-col cols="1" v-if="pagamento.tipo_id == 2">
            <CustomInput label="Conta" required hide-details v-model="pagamento.dados_bancarios.digito" />
          </v-col>

          <!-- Boleto -->

          <v-col v-if="pagamento.tipo_id == 3" cols="9">
            <CustomInput label="Código de Barras" required hide-details v-model="pagamento.dados_bancarios.outhers" />
          </v-col>

          <!-- Pagamento Online -->

          <v-col v-if="pagamento.tipo_id == 4" cols="9">
            <CustomInput label="Link do pagamento online" required hide-details v-model="pagamento.dados_bancarios.outhers" />
          </v-col>
          
          <!-- Dinheiro -->

          <v-col v-if="pagamento.tipo_id == 7" cols="9">
            <CustomInput label="Descrição do Pagamento" required hide-details v-model="pagamento.dados_bancarios.outhers" />
          </v-col>

          <v-divider class="mx-4 my-1" />

          <!-- Motivo -->

          <v-col cols="12">
            <CustomInput type="textarea" disabled label="Motivo do Pagamento" hide-details :rows="2" v-model="pagamento.motivo" />
          </v-col>

          <v-col v-if="pagamento.urgente">
            <CustomInput disabled label="Justificativa Urgência" hide-details v-model="pagamento.justificativa_urgente" />
          </v-col>

        </v-row>

        <v-divider class="mt-6 mb-2" v-if="pagamento?.anexos_pagamento?.length > 0" />

        <LayoutTitle title="Arquivos" :margin="false"/>

        <v-row align="start" justify="start" class="mb-2 d-flex flex-wrap mr-2" no-gutters v-if="pagamento?.anexos_pagamento?.length > 0" style="height: 70px; overflow-y: auto">
          
          <v-card flat color="bgtertiary" @click="openBase64File(arquivoNF)" class="d-flex flex-row align-center ma-2" width="300px" height="52px" v-if="arquivoNF">
            <v-icon color="primary" class="mx-2">mdi-file-document</v-icon>
            <v-card-text>
              <h3>Nota Fiscal</h3>
            </v-card-text>
            <v-btn icon @click.stop="copyFilePath(arquivoNF.caminho)" flat color="transparent" class="ml-auto">
              <v-icon color="primary" class="cursor-pointer">mdi-content-copy</v-icon>
              <v-tooltip text="Copiar local do arquivo" activator="parent" location="top" />
            </v-btn>
            <v-tooltip :text="`Abrir arquivo ${arquivoNF.nome}`" activator="parent" location="bottom" />
          </v-card>

          <v-card flat color="bgtertiary" @click="uploadFile('nf')" class="d-flex flex-row align-center ma-2" width="300px" height="52px" v-else>
            <v-icon color="green" class="mx-2">mdi-file-document-plus</v-icon>
            <v-card-text>
              <h3>Adicionar Nota Fiscal</h3>
            </v-card-text>
            <v-icon color="green" class="mx-2">
              mdi-plus
            </v-icon>
            <v-tooltip text="Incluir Nota Fiscal" activator="parent" location="bottom" />
          </v-card>

          <v-card flat color="bgtertiary" @click="openBase64File(arquivoPagamento)" class="d-flex flex-row align-center ma-2" width="300px" height="52px" v-if="arquivoPagamento">
            <v-icon color="primary" class="mx-2">mdi-file-document</v-icon>
            <v-card-text>
              <h3>Arquivo anexo</h3>
            </v-card-text>
            <v-btn icon @click.stop="copyFilePath(arquivoPagamento.caminho)" flat color="transparent" class="ml-auto">
              <v-icon color="primary" class="cursor-pointer">mdi-content-copy</v-icon>
              <v-tooltip text="Copiar local do arquivo" activator="parent" location="top" />
            </v-btn>
            <v-tooltip :text="`Abrir arquivo ${arquivoPagamento.nome}`" activator="parent" location="bottom" />
          </v-card>

          <v-card flat color="bgtertiary" @click="uploadFile('doc')" class="d-flex flex-row align-center ma-2" width="300px" height="52px" v-else>
            <v-icon color="green" class="mx-2">mdi-file-document-plus</v-icon>
            <v-card-text>
              <h3>Adicionar Arquivo</h3>
            </v-card-text>
            <v-icon color="green" class="mx-2">
              mdi-plus
            </v-icon>
            <v-tooltip text="Incluir Arquivo Anexo" activator="parent" location="bottom" />
          </v-card>

        </v-row>
      </div>
    </template>
  </Modal>
</template>

<script setup>
//* IMPORTS

import { getEmpresa, getPagamentoById, getSetoresPadrao, existRelationSetorWithEmpresa, getGrupos, getPagamentoTipo, getTiposChavePix, getCard, getFornecedorById, getCategoriasUsuario, postUpload, updatePagamento } from '~/api';
const { $toast } = useNuxtApp()
const { openBase64File, copyFilePath } = useOs()
const dayjs = useDayjs()

//* PROPS

const props = defineProps({
  id: { type: Number },
  enable: { type: Boolean, default: false },
  pagamento: { type: Object, default: null }
})

//* EMITS

const emit = defineEmits(['update:enable', 'getPagamento']);

//* DATA

const pagamento = ref(null);
const fornecedor = ref({
  id: null,
  razao_social: null,
  documento: null,
  tipo: null,
  internacional: false
});
const grupo_id = ref(null);
const arquivoNF = ref(null);
const arquivoPagamento = ref(null);
const arquivoNovo = ref(null);
const loading = ref(false);

const setores = ref([]);
const grupos = ref([]);
const tiposPagamento = ref([]);
const empresas = ref([]);
const empresaCartoes = ref([]);
const tiposChavePix = ref([]);
const categorias = ref([]);
const projetos = ref([]);
const fornecedores = ref([]);

//* COMPUTED

const enableValue = computed({
  get: () => props.enable,
  set: (value) => emit('update:enable', value)
})

const ultimaMovimentacao = computed(() => {
  if (!pagamento.value) return null
  return pagamento.value.movimentacoes_pagamento.find((mov) => !mov.data_fim)
})

const documentoFormatado = computed(() => {
  if (!fornecedor.value.documento || !fornecedor.value.documento) return null;

  if (fornecedor.value.tipo === 'juridico' && fornecedor.value.documento) return maskCnpj(fornecedor.value.documento)
  return maskCpf(fornecedor.value.documento)
})

const isInternacional = computed(() => fornecedor.value.internacional);

const selectedCategories = computed(() => categorias.value.filter((categoria) => categoria.grupo_id === grupo_id.value));

const requer_projeto = computed(() => {
  if (!pagamento?.value?.setor_id) return false;
  if (!setores.value) return false;

  const setor = setores.value.find((setor) => setor.id === pagamento.value.setor_id);
  return setor?.requer_projeto ?? false;
})

//* METHODS

const actions = computed(() => [
  {
    title: 'Fechar',
    icon: 'mdi-close',
    tooltip: 'Fechar',
    type: 'cancel',
    loading: loading.value,
    click: () => enableValue.value = false
  },
  {
    title: 'Salvar',
    icon: 'mdi-content-save',
    tooltip: 'Salvar',
    type: 'submit',
    loading: loading.value,
    click: () => update()
  }
])

//* GETTERS

const getPagamento = async () => {
  try {
    loading.value = true;

    const [{ data: dtSetor }, { data: dtGrupo }, { data: dtPagamentoTipo }, { data: dtEmpresa }, { data: dtCard }, { data: dtTiposChavePix }] = await Promise.all([
      getSetoresPadrao(),
      getGrupos(),
      getPagamentoTipo(),
      getEmpresa(),
      getCard(),
      getTiposChavePix()
    ]);

    setores.value = dtSetor;
    grupos.value = dtGrupo;
    tiposPagamento.value = dtPagamentoTipo;
    empresas.value = dtEmpresa;
    empresaCartoes.value = dtCard;
    tiposChavePix.value = dtTiposChavePix;

    const { success, message, data } = await getPagamentoById(props.id);
    if (!success) throw new Error(message);

    pagamento.value = data;
    fornecedor.value = data.fornecedor;
    grupo_id.value = data.categoria.grupo_id;

    arquivoNF.value = data.anexos_pagamento.find((anexo) => anexo.tipo_anexo_id === 3);
    arquivoPagamento.value = data.anexos_pagamento.find((anexo) => anexo.tipo_anexo_id === 4);
    pagamento.value.data_solicitacao = dayjs(pagamento.value.created_at).format('YYYY-MM-DD HH:mm:ss');

    console.log(arquivoNF.value);
    console.log(arquivoPagamento.value);

    await getCategorias();
    await existRelation();

    loading.value = false;
  } 
  catch (error) {
    $toast.error('Erro ao buscar pagamento');
    enableValue.value = false;
  }
}

const getCategorias = async () => {
  try {
    if (!pagamento?.value?.setor_id) return;

    const { success, message, data } = await getCategoriasUsuario(pagamento.value.setor_id, !fornecedor?.value?.internacional ?? null, true);
    if (!success) throw new Error(message);

    const tempGrupos = [];

    for (const categoria of data) {
      if (!tempGrupos.find((grupo) => grupo.id === categoria.grupo_id)) {
        tempGrupos.push({
          id: categoria.grupo_id,
          nome: categoria.grupo.nome
        })
      }
    }

    grupos.value = tempGrupos.sort((a, b) => a.nome.localeCompare(b.nome));
    categorias.value = data;
  } 
  catch (error) {
    console.error('Erro ao buscar categorias:', error)
    $toast.error('Erro ao buscar categorias')
  }
}

const existRelation = async () => {
  try {
    if (!pagamento?.value?.empresa_id) return;
    if (!setores.value) return;

    for await (const setor of setores.value) {
      const { data } = await existRelationSetorWithEmpresa(setor.id, pagamento.value.empresa_id)

      setor.disabled = false
      if (!data) setor.disabled = true
    }
  } 
  catch (error) {
    console.error(error)
    $toast.error('Erro ao verificar relação entre setor e empresa')
  }
}

// SETTERS

const uploadFile = async (tipo) => {
  try {
    throw new Error('Função não implementada');

    const { success, message, data } = await openDialogFile();
    if (!success) throw new Error(message);

    const formData = new FormData();
    formData.append(tipo, arquivoNovo.value);
    formData.append('tipo_anexo_id', tipo === 'nf' ? 3 : 4);
    formData.append('pagamento_id', pagamento.value.id);

    const { success: successUpload, message: messageUpload } = await postUpload(pagamento.value.id, formData);
    if (!successUpload) throw new Error(messageUpload);

    $toast.success('Arquivo anexado com sucesso');
    getPagamento();
  } 
  catch (error) {
    $toast.error('Erro ao anexar arquivo');
  }
}

const update = async () => {
  loading.value = true;

  try {
    const payload = {};

    for (const key in pagamento.value) {
      if (key === 'dados_bancarios') {
        payload.dados_bancarios = pagamento.value.dados_bancarios;
        console.log(payload.dados_bancarios);
        continue;
      }
      
      if (typeof pagamento.value[key] === 'object') continue;

      payload[key] = pagamento.value[key];
    }

    const { success, message } = await updatePagamento(pagamento.value.id, payload);
    if (!success) throw new Error(message);

    $toast.success('Pagamento atualizado com sucesso');
    getPagamento();
    emit('getPagamento');

  } 
  catch (error) {
    $toast.error('Erro ao atualizar pagamento');
  }

  loading.value = false;
}

//* INPUT PROPS

const setorProps = (item) => {
  return { disabled: item.disabled, subtitle: item.disabled ? 'Setor não relacionado com a empresa' : '' }
}





//* WATCHERS

watch(() => props.enable, (value) => { 
  if (value) getPagamento();
})

watch(() => pagamento?.value?.fornecedor_id, async (value) => {
  if (!value) {
    fornecedor.value = {
      id: null,
      razao_social: null,
      documento: null,
      tipo: null,
      internacional: false
    };
    return;
  }

  const { data } = await getFornecedorById(value);
  fornecedor.value = data;
})

// watch(() => fornecedor.internacional, getCategorias, { immediate: true })

watch(() => pagamento?.value?.empresa_id, existRelation)

</script>
