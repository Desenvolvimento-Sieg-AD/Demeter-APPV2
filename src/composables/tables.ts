interface IColumn {
  title: string
  value: string
  type?: string
  cellSlot?: string
  format?: Object
  width?: string | number
  height?: string
  fixed?: boolean
  fixedPosition?: string
  align?: string
  sortOrder?: string
  visible?: boolean
  sortable?: boolean
  filterable?: boolean
  groupable?: boolean
  searchable?: boolean
  reorderable?: boolean
  wholeSearch?: boolean
  hidable?: boolean
  falseText?: string
  trueText?: string
  allowFilterSelectAll?: boolean
  searchFilter?: boolean
  searchFilterExpr?: string
  searchFilterOptions?: string
  customFilter?: Function
}

interface ITables {
  gerencia: IColumn[]
  usuario: IColumn[]
  financeiro: IColumn[]
  historico: IColumn[]
  provisionados: IColumn[]
  setores: IColumn[]
  categorias: IColumn[]
}

const tabelas: ITables = {
  gerencia: [
    { title: 'Solicit.', value: 'usuario.sigla', sortable: true, filterable: true, visible: true, width: 100 },
    { title: 'Setor', value: 'setorReferencia.sigla', sortable: true, filterable: true, visible: true, width: 90 },
    { title: 'Categoria', value: 'categoria.nome', align: 'center', sortable: true, filterable: true, visible: true },
    { title: 'Fornecedor', value: 'fornecedor.razao_social', sortable: true, filterable: true, visible: true },
    { title: 'Internacional', value: 'fornecedor.internacional', filterable: true, visible: false },
    { title: 'Nome Fantasia', value: 'fornecedor.nome_fantasia', sortable: true, filterable: true, visible: false },
    { title: 'Tipo Forncedor', value: 'tipo', sortable: true, filterable: true, visible: false },
    { title: 'Doc.', value: 'documento', sortable: true, filterable: true, visible: false },
    { title: 'Empresa', value: 'empresa.apelido', sortable: true, filterable: true, visible: true, width: 110 },
    { title: 'Conta', value: 'conta_empresa.descricao', sortable: true, filterable: true, visible: false },
    { title: 'Motivo', value: 'motivo', sortable: true, filterable: false, visible: false },
    { title: 'Observação', value: 'dados_complementares', sortable: true, filterable: true, visible: false },
    { title: 'Projeto', value: 'projeto.nome', sortable: true, filterable: true, visible: false },
    { title: 'Forma de pagamento', value: 'tipo_pagamento.nome', sortable: true, filterable: true, visible: false },
    { title: 'Descrição pagamento', value: 'descricao', sortable: true, filterable: true, visible: false },
    { title: 'Vencimento', value: 'data', sortable: true, reorderable: true, filterable: false, visible: true, width: 120 },
    { title: 'Valor', value: 'valor_total', sortable: true, filterable: false, visible: true },
    { title: 'NF', value: 'anexo', filterable: false, visible: true, width: 70 },
    { title: 'DOC', value: 'doc', filterable: false, visible: true, width: 70 },
    { title: 'Ações', value: 'actions', width: 120, fixed: true }
  ],
  financeiro: [
    { title: 'Solicit.', value: 'usuario.sigla', sortable: true, filterable: true, visible: true, width: 100 },
    { title: 'Setor', value: 'setorReferencia.sigla', sortable: true, filterable: true, visible: true, width: 90 },
    { title: 'Status', value: 'movimentacoes_pagamento.status_pagamento', visible: true, filterable: true, width: 150 },
    { title: 'Urgente', value: 'urgente', sortable: true, filterable: true, visible: true, width: 100 },
    { title: 'Categoria', value: 'categoria.nome', align: 'center', sortable: true, filterable: true, visible: true, width: 80   },
    { title: 'Fornecedor', value: 'fornecedor.razao_social', sortable: true, filterable: true, visible: true },
    { title: 'Internacional', value: 'fornecedor.internacional', filterable: true, visible: false, width: 70 },
    { title: 'Nome Fantasia', value: 'fornecedor.nome_fantasia', sortable: true, filterable: true, visible: false },
    { title: 'Tipo Forncedor', value: 'tipo', sortable: true, filterable: true, visible: false },
    { title: 'Doc.', value: 'documento', filterable: true, visible: false },
    { title: 'Empresa', value: 'empresa.apelido', sortable: true, filterable: true, visible: true, width: 110 },
    { title: 'Conta', value: 'conta_empresa.descricao', sortable: true, filterable: true, visible: false },
    { title: 'Motivo', value: 'motivo', sortable: true, filterable: false, visible: false },
    { title: 'Observação', value: 'dados_complementares', sortable: true, filterable: true, visible: false },
    { title: 'Projeto', value: 'projeto.nome', sortable: true, filterable: true, visible: false },
    { title: 'Forma de pagamento', value: 'tipo_pagamento.nome', sortable: true, filterable: true, visible: false },
    { title: 'Descrição pagamento', value: 'descricao', sortable: true, filterable: true, visible: false },
    { title: 'Solicitação', value: 'created_at', sortable: true, filterable: false, visible: true, width: 120 },
    { title: 'Vencimento', value: 'data', sortable: true, reorderable: true, filterable: false, visible: true, width: 120 },
    { title: 'Valor', value: 'valor_total', sortable: true, filterable: false, visible: true },
    { title: 'NF', value: 'anexo',  filterable: false, visible: true, width: 70 },
    { title: 'DOC', value: 'doc', filterable: false, visible: true, width: 70 },
    { title: 'Ações', value: 'actions', width: 120, fixed: true }
  ],
  provisionados: [
    { title: 'Solicit.', value: 'usuario.sigla', sortable: true, filterable: true, visible: true, width: 100 },
    { title: 'Setor', value: 'setorReferencia.sigla', sortable: true, filterable: true, visible: true, width: 90 },
    { title: 'Urgente', value: 'urgente', sortable: true, filterable: true, visible: true, width: 100 },
    { title: 'Categoria', value: 'categoria.nome', align: 'center', sortable: true, filterable: true, visible: true, width: 80   },
    { title: 'Fornecedor', value: 'fornecedor.razao_social', sortable: true, filterable: true, visible: true },
    { title: 'Internacional', value: 'fornecedor.internacional', filterable: true, visible: false, width: 70 },
    { title: 'Nome Fantasia', value: 'fornecedor.nome_fantasia', sortable: true, filterable: true, visible: false },
    { title: 'Tipo Forncedor', value: 'tipo', sortable: true, filterable: true, visible: false },
    { title: 'Doc.', value: 'documento', filterable: true, visible: false },
    { title: 'Empresa', value: 'empresa.apelido', sortable: true, filterable: true, visible: true, width: 110 },
    { title: 'Conta', value: 'conta_empresa.descricao', sortable: true, filterable: true, visible: false },
    { title: 'Motivo', value: 'motivo', sortable: true, filterable: false, visible: false },
    { title: 'Observação', value: 'dados_complementares', sortable: true, filterable: true, visible: false },
    { title: 'Projeto', value: 'projeto.nome', sortable: true, filterable: true, visible: false },
    { title: 'Forma de pagamento', value: 'tipo_pagamento.nome', sortable: true, filterable: true, visible: false },
    { title: 'Descrição pagamento', value: 'descricao', sortable: true, filterable: true, visible: false },
    { title: 'Solicitação', value: 'created_at', sortable: true, filterable: false, visible: true, width: 120 },
    { title: 'Vencimento', value: 'data', sortable: true, reorderable: true, filterable: false, visible: true, width: 120 },
    { title: 'Valor', value: 'valor_total', sortable: true, filterable: false, visible: true },
    { title: 'NF', value: 'anexo',  filterable: false, visible: true, width: 70 },
    { title: 'DOC', value: 'doc', filterable: false, visible: true, width: 70 },
    { title: 'Ações', value: 'actions', width: 100, fixed: true }
  ],
  historico: [
    { title: 'Solicit.', value: 'usuario.sigla', sortable: true, filterable: true, visible: true, width: 100 },
    { title: 'Setor', value: 'setorReferencia.sigla', sortable: true, filterable: true, visible: true, width: 90 },
    { title: 'Status', value: 'movimentacoes_pagamento.status_pagamento', visible: true, filterable: true, width: 150 },
    { title: 'Categoria', value: 'categoria.nome', align: 'center', sortable: true, filterable: true, visible: true },
    { title: 'Fornecedor', value: 'fornecedor.razao_social', sortable: true, filterable: true, visible: true },
    { title: 'Internacional', value: 'fornecedor.internacional', filterable: true, visible: false, width: 70 },
    { title: 'Nome Fantasia', value: 'fornecedor.nome_fantasia', sortable: true, filterable: true, visible: false },
    { title: 'Tipo Fornecedor', value: 'tipo', sortable: true, filterable: true, visible: false },
    { title: 'Doc.', value: 'documento', sortable: true, filterable: true, visible: false },
    { title: 'Empresa', value: 'empresa.apelido', sortable: true, filterable: true, visible: true, width: 110 },
    { title: 'Conta', value: 'conta_empresa.descricao', sortable: true, filterable: true, visible: false },
    { title: 'Motivo', value: 'motivo', sortable: true, filterable: false, visible: false },
    { title: 'Observação', value: 'dados_complementares', sortable: true, filterable: true, visible: false },
    { title: 'Projeto', value: 'projeto.nome', sortable: true, filterable: true, visible: false },
    { title: 'Forma de pagamento', value: 'tipo_pagamento.nome', sortable: true, filterable: true, visible: false },
    { title: 'Descrição pagamento', value: 'descricao', sortable: true, filterable: true, visible: false },
    { title: 'Solicitação', value: 'created_at', sortable: true, filterable: false, visible: true, width: 120 },
    { title: 'Vencimento', value: 'data', sortable: true, reorderable: true, filterable: false, visible: true, width: 120 },
    { title: 'Pagamento', value: 'data_pagamento', sortable: true, reorderable: true, filterable: false, visible: true, width: 120},
    { title: 'Valor', value: 'valor_total', sortable: true, filterable: false, visible: true },
    { title: 'NF', value: 'anexo',  filterable: false, visible: true, width: 70 },
    { title: 'DOC', value: 'doc', filterable: false, visible: true, width: 70 },
    { title: 'Ações', value: 'actions', width: 80, fixed: true }
  ],
  usuario: [
    { title: 'Urgente', value: 'urgente', sortable: true, filterable: true, visible: false, width: 100 },
    { title: 'Status', value: 'movimentacoes_pagamento.status_pagamento', visible: true, filterable: true, width: 150 },
    { title: 'Categoria', value: 'categoria.nome', align: 'center', sortable: true, filterable: true, visible: true },
    { title: 'Fornecedor', value: 'fornecedor.razao_social', sortable: true, filterable: true, visible: true },
    { title: 'Internacional', value: 'fornecedor.internacional', filterable: true, visible: false, width: 70 },
    { title: 'Nome Fantasia', value: 'fornecedor.nome_fantasia', sortable: true, filterable: true, visible: false },
    { title: 'Tipo Fornecedor', value: 'fornecedor.tipo', sortable: true, filterable: true, visible: false },
    { title: 'Doc.', value: 'fornecedor.documento', sortable: true, filterable: true, visible: false },
    { title: 'Empresa', value: 'empresa.apelido', sortable: true, filterable: true, visible: true, width: 110 },
    { title: 'Conta', value: 'conta_empresa.descricao', sortable: true, filterable: true, visible: false },
    { title: 'Motivo', value: 'motivo', sortable: true, filterable: false, visible: false },
    { title: 'Observação', value: 'dados_complementares', sortable: true, filterable: true, visible: false },
    { title: 'Projeto', value: 'projeto.nome', sortable: true, filterable: true, visible: false },
    { title: 'Forma de pagamento', value: 'tipo_pagamento.nome', sortable: true, filterable: true, visible: false },
    { title: 'Descrição pagamento', value: 'descricao', sortable: true, filterable: true, visible: false },
    { title: 'Solicitação', value: 'created_at', sortable: true, filterable: false, visible: true, width: 120 },
    { title: 'Vencimento', value: 'data', sortable: true, reorderable: true, filterable: false, visible: true, width: 120 },
    { title: 'Valor', value: 'valor_total', sortable: true, filterable: false, visible: true },
    { title: 'NF', value: 'anexo',  filterable: false, visible: true, width: 70 },
    { title: 'DOC', value: 'doc', filterable: false, visible: true, width: 70 },
    { title: 'Ações', value: 'actions', width: 120, fixed: true }
  ],
  setores: [
    { title: 'Setor', value: 'nome', sortable: true, filterable: true, visible: true, width: 410 },
    { title: 'Sigla', value: 'sigla', sortable: true, filterable: true, visible: true, width: 410 },
    { title: 'Usuarios', value: 'usuarios.length', visible: true, width: 410},
    { title: 'Categorias', value: 'categorias', visible: true, width: 410, align: 'center' },
    { title: 'Ações', value: 'actions', width: 120, fixed: true}
  ],
  categorias: [
    { title: 'Categoria', value: 'nome', sortable: true, filterable: true, visible: true, width: 350 },
    { title: 'Descrição', value: 'descricao', sortable: true, filterable: true, visible: true, width: 350 },
    { title: 'Grupo', value: 'grupo.nome', sortable: true, filterable: true, visible: true, width: 350 },
    { title: 'Ativo', value: 'ativo', sortable: true, filterable: true, visible: true, width: 150 },
    { title: 'Nacional', value: 'nacional', sortable: true, filterable: true, visible: true, width: 150 },
    { title: 'Internacional', value: 'internacional', sortable: true, filterable: true, visible: true, width: 150 },
    { title: 'Projeto Obrigatório', value: 'requer_projeto', sortable: true, filterable: true, visible: true, width: 150 },
    { title: 'Ações', value: 'actions', width: 120, fixed: true}
  ]
}

export const getColumns = (table: string) => {
  return tabelas[table as keyof ITables]
}
