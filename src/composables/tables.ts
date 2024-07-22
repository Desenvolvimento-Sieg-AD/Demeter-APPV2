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
    { title: 'Setor', value: 'setor_referencia.nome', sortable: true, filterable: true, visible: true, width: 90 },
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
    { title: 'Setor', value: 'setor_referencia.nome', sortable: true, filterable: true, visible: true, width: 90 },
    { title: 'Status', value: 'movimentacoes_pagamento[0].status_pagamento.nome', visible: true, filterable: true, width: 150 },
    { title: 'Urgente', value: 'urgente', sortable: true, filterable: true, visible: true, width: 100 },
    { title: 'Categoria', value: 'categoria.nome', align: 'center', sortable: true, filterable: true, visible: true },
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
    { title: 'NF', value: 'anexo', filterable: false, visible: true, width: 70 },
    { title: 'DOC', value: 'doc', filterable: false, visible: true, width: 70 },
    { title: 'Ações', value: 'actions', width: 120, fixed: true }
  ],
  provisionados: [
    { title: 'Solicit.', value: 'usuario.sigla', sortable: true, filterable: true, visible: true, width: 100 },
    { title: 'Setor', value: 'setor_referencia.nome', sortable: true, filterable: true, visible: true, width: 90 },
    { title: 'Urgente', value: 'urgente', sortable: true, filterable: true, visible: true, width: 100 },
    { title: 'Categoria', value: 'categoria.nome', align: 'center', sortable: true, filterable: true, visible: true },
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
    { title: 'NF', value: 'anexo', filterable: false, visible: true, width: 70 },
    { title: 'DOC', value: 'doc', filterable: false, visible: true, width: 70 },
    { title: 'Ações', value: 'actions', width: 100, fixed: true }
  ],
  historico: [
    { title: 'Solicit.', value: 'usuario.sigla', sortable: true, filterable: true, visible: true, width: 100 },
    { title: 'Setor', value: 'setor_referencia.nome', sortable: true, filterable: true, visible: true, width: 90 },
    { title: 'Status', value: 'movimentacoes_pagamento[0].status_pagamento.nome', visible: true, filterable: true, width: 150 },
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
    { title: 'Pagamento', value: 'data_pagamento', sortable: true, reorderable: true, filterable: false, visible: true, width: 120 },
    { title: 'Valor', value: 'valor_total', sortable: true, filterable: false, visible: true },
    { title: 'NF', value: 'anexo', filterable: false, visible: true, width: 70 },
    { title: 'DOC', value: 'doc', filterable: false, visible: true, width: 70 },
    { title: 'Ações', value: 'actions', width: 80, fixed: true }
  ],
  usuario: [
    { title: 'Urgente', type: 'boolean', value: 'urgente', sortable: true, filterable: true, visible: false, width: 100 },
    { title: 'Status', type: 'text', value: 'movimentacoes_pagamento[0].status_pagamento.nome', visible: true, filterable: true, width: 150 },
    { title: 'Categoria', type: 'text', value: 'categoria.nome', align: 'center', sortable: true, filterable: true, visible: true },
    { title: 'Fornecedor', type: 'text', value: 'fornecedor.razao_social', sortable: true, filterable: true, visible: true },
    { title: 'Internacional', type: 'boolean', value: 'fornecedor.internacional', filterable: true, visible: false, width: 70 },
    { title: 'Nome Fantasia', type: 'text', value: 'fornecedor.nome_fantasia', sortable: true, filterable: true, visible: false },
    { title: 'Tipo Fornecedor', type: 'text', value: 'fornecedor.tipo', sortable: true, filterable: true, visible: false },
    { title: 'Doc.', value: 'fornecedor.documento', sortable: true, filterable: true, visible: false },
    { title: 'Empresa', type: 'text', value: 'empresa.apelido', sortable: true, filterable: true, visible: true, width: 110 },
    { title: 'Conta', type: 'text', value: 'conta_empresa.descricao', sortable: true, filterable: true, visible: false },
    { title: 'Motivo', type: 'text', value: 'motivo', sortable: true, filterable: false, visible: false },
    { title: 'Observação', type: 'text', value: 'dados_complementares', sortable: true, filterable: true, visible: false },
    { title: 'Projeto', type: 'text', value: 'projeto.nome', sortable: true, filterable: true, visible: false },
    { title: 'Forma de pagamento', type: 'text', value: 'tipo_pagamento.nome', sortable: true, filterable: true, visible: false },
    { title: 'Descrição pagamento', type: 'text', value: 'descricao', sortable: true, filterable: true, visible: false },
    { title: 'Solicitação', type: 'text', value: 'created_at', sortable: true, filterable: false, visible: true, width: 120 },
    { title: 'Vencimento', type: 'text', value: 'data', sortable: true, reorderable: true, filterable: false, visible: true, width: 120 },
    { title: 'Valor', type: 'text', value: 'valor_total', sortable: true, filterable: false, visible: true },
    { title: 'NF', type: 'text', value: 'anexo', filterable: false, visible: true, width: 70 },
    { title: 'DOC', type: 'text', value: 'doc', filterable: false, visible: true, width: 70 },
    { title: 'Ações', type: 'text', value: 'actions', width: 120, fixed: true }
  ],
  setores: [
    { title: 'Setor', value: 'nome', sortable: true, filterable: true, visible: true },
    { title: 'Sigla', value: 'sigla', sortable: true, filterable: true, visible: true },
    { title: 'Usuarios', value: 'usuarios.length', visible: true },
    { title: 'Categorias', value: 'categorias', visible: true, align: 'center' },
    { title: 'Ações', value: 'actions', width: 120, fixed: true }
  ],
  categorias: [
    { title: 'Categoria', value: 'nome', sortable: true, filterable: true, visible: true },
    { title: 'Descrição', value: 'descricao', sortable: true, filterable: true, visible: true },
    { title: 'Grupo', value: 'grupo.nome', sortable: true, filterable: true, visible: true },
    { title: 'Ativo', value: 'ativo', sortable: true, filterable: true, visible: true },
    { title: 'Nacional', value: 'nacional', sortable: true, filterable: true, visible: true },
    { title: 'Internacional', value: 'internacional', sortable: true, filterable: true, visible: true },
    { title: 'Requer Proj.', value: 'requer_projeto', sortable: true, filterable: true, visible: true },
    { title: 'Ações', value: 'actions', width: 120, fixed: true }
  ]
}

export const getColumns = (table: string) => {
  return tabelas[table as keyof ITables]
}
