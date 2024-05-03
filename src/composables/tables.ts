interface IColumn {
	title: string;
	value: string;
	type?: string;
	cellSlot?: string;
	format?: Object;
	width?: string | number;
	height?: string;
	fixed?: boolean;
	fixedPosition?: string;
	align?: string;
	sortOrder?: string;
	visible?: boolean;
	sortable?: boolean;
	filterable?: boolean;
	groupable?: boolean;
	searchable?: boolean;
	reorderable?: boolean;
	wholeSearch?: boolean;
	hidable?: boolean;
	falseText?: string;
	trueText?: string;
	allowFilterSelectAll?: boolean;
	searchFilter?: boolean;
	searchFilterExpr?: string;
	searchFilterOptions?: string;
	customFilter?: Function;
}

interface ITables {
	gerencia: IColumn[];
	usuario: IColumn[];
	financeiro: IColumn[];
	historico: IColumn[];
}

const tabelas: ITables = {
	gerencia: [
		{ title: 'Solicit.', value: 'usuario.sigla', sortable: true, filterable: true, visible: true, width: 100 },
		{ title: 'Setor', value: 'setor', sortable: true, filterable: true, visible: true, width: 90 },
		{ title: 'Categ.', value: 'categoria.nome', align: 'center', sortable: true, filterable: true, visible: true },
		{ title: 'Fornecedor', value: 'fornecedor.razao_social', sortable: true, filterable: true, visible: true },
		{ title: 'Apelido Fornecedor', value: 'fornecedor.nome_fantasia', sortable: true, filterable: true, visible: false },
		{ title: 'Tipo Forncedor', value: 'tipo', sortable: true, filterable: true, visible: false },
		{ title: 'Doc.', value: 'documento', sortable: true, filterable: true, visible: false },
		{ title: 'Empresa', value: 'empresa.apelido', sortable: true, filterable: true, visible: true, width: 110 },
		{ title: 'Motivo', value: 'motivo', sortable: true, filterable: true, visible: true },
		{ title: 'Observação', value: 'dados_complementares', sortable: true, filterable: true, visible: false },
		{ title: 'Forma de pagamento', value: 'tipo_pagamento.nome', sortable: true, filterable: true, visible: false },
		{ title: 'Descrição pagamento', value: 'descricao', sortable: true, filterable: true, visible: false },
		{ title: 'Data de vencimento', value: 'data', sortable: true, reorderable: true, filterable: false, visible: true },
		{ title: 'Valor total', value: 'valor_total', sortable: true, filterable: true, visible: true },
		{ title: 'NF', value: 'anexo', sortable: true, filterable: false, visible: true, width: 70 },
		{ title: 'DOC', value: 'doc', sortable: true, filterable: false, visible: true, width: 70 },
		{ title: 'Ações', value: 'actions', width: 120, fixed: true },
	],
	financeiro: [
		{ title: 'Solicit.', value: 'usuario.sigla', sortable: true, filterable: true, visible: true, width: 100 },
		{ title: 'Setor', value: 'setor', sortable: true, filterable: true, visible: true, width: 90 },
		{ title: 'Urgente', value: 'urgente', sortable: true, filterable: true, visible: true, width: 100 },
		{ title: 'Status', value: 'status', sortable: true, filterable: true, visible: true, width: 115 },
		{ title: 'Categ.', value: 'categoria.nome', align: 'center', sortable: true, filterable: true, visible: true },
		{ title: 'Fornecedor', value: 'fornecedor.razao_social', sortable: true, filterable: true, visible: true },
		{ title: 'Apelido Fornecedor', value: 'fornecedor.nome_fantasia', sortable: true, filterable: true, visible: false },
		{ title: 'Tipo Forncedor', value: 'tipo', sortable: true, filterable: true, visible: false },
		{ title: 'Doc.', value: 'documento', sortable: true, filterable: true, visible: false },
		{ title: 'Empresa', value: 'empresa.apelido', sortable: true, filterable: true, visible: true, width: 110 },
		{ title: 'Conta', value: 'conta_empresa.descricao', sortable: true, filterable: true, visible: true },
		{ title: 'Motivo', value: 'motivo', sortable: true, filterable: true, visible: true },
		{ title: 'Observação', value: 'dados_complementares', sortable: true, filterable: true, visible: false },
		{ title: 'Forma de pagamento', value: 'tipo_pagamento.nome', sortable: true, filterable: true, visible: false },
		{ title: 'Descrição pagamento', value: 'descricao', sortable: true, filterable: true, visible: false },
		{ title: 'Data de aprovação', value: 'data_aprovacao', sortable: true, reorderable: true, filterable: false, visible: true },
		{ title: 'Data de vencimento', value: 'data', sortable: true, reorderable: true, filterable: false, visible: true },
		{ title: 'Valor total', value: 'valor_total', sortable: true, filterable: true, visible: true },
		{ title: 'NF', value: 'anexo', sortable: true, filterable: false, visible: true, width: 70 },
		{ title: 'DOC', value: 'doc', sortable: true, filterable: false, visible: true, width: 70 },
		{ title: 'Por lote', value: 'lote', sortable: true, filterable: false, visible: true, width: 70 },
		{ title: 'Ações', value: 'actions', width: 100, fixed: true },
	],
	historico: [
		{ title: 'Solicit.', value: 'usuario.sigla', sortable: true, filterable: true, visible: true, width: 100 },
		{ title: 'Setor', value: 'setor', sortable: true, filterable: true, visible: true, width: 90 },
		{ title: 'Status', value: 'status', sortable: true, filterable: true, visible: true, width: 115 },
		{ title: 'Categ.', value: 'categoria.nome', align: 'center', sortable: true, filterable: true, visible: true },
		{ title: 'Fornecedor', value: 'fornecedor.razao_social', sortable: true, filterable: true, visible: true },
		{ title: 'Apelido Fornecedor', value: 'fornecedor.nome_fantasia', sortable: true, filterable: true, visible: false },
		{ title: 'Tipo Fornecedor', value: 'tipo', sortable: true, filterable: true, visible: false },
		{ title: 'Doc.', value: 'documento', sortable: true, filterable: true, visible: false },
		{ title: 'Empresa', value: 'empresa.apelido', sortable: true, filterable: true, visible: true, width: 110 },
		{ title: 'Conta', value: 'conta_empresa.descricao', sortable: true, filterable: true, visible: true },
		{ title: 'Motivo', value: 'motivo', sortable: true, filterable: true, visible: true },
		{ title: 'Observação', value: 'dados_complementares', sortable: true, filterable: true, visible: false },
		{ title: 'Forma de pagamento', value: 'tipo_pagamento.nome', sortable: true, filterable: true, visible: false },
		{ title: 'Descrição pagamento', value: 'descricao', sortable: true, filterable: true, visible: false },
		{ title: 'Data de aprovação',value: 'data_aprovacao',sortable: true,reorderable: true,filterable: false,visible: true },
		{ title: 'Data de vencimento', value: 'data', sortable: true, reorderable: true, filterable: false, visible: true },
		{ title: 'Valor total', value: 'valor_total', sortable: true, filterable: true, visible: true },
		{ title: 'NF', value: 'anexo', sortable: true, filterable: false, visible: true, width: 70 },
		{ title: 'DOC', value: 'doc', sortable: true, filterable: false, visible: true, width: 80 },
		{ title: 'Por lote', value: 'lote', sortable: true, filterable: false, visible: true, width: 70 },
		{ title: 'Ações', value: 'actions', width: 80, fixed: true },
	],
	usuario: [
		{ title: 'Status', value: 'status', sortable: true, filterable: true, visible: true, width: 115 },
		{ title: 'Categ.', value: 'categoria.nome', align: 'center', sortable: true, filterable: true, visible: true },
		{ title: 'Fornecedor', value: 'fornecedor.razao_social', sortable: true, filterable: true, visible: true },
		{ title: 'Apelido Fornecedor', value: 'fornecedor.nome_fantasia', sortable: true, filterable: true, visible: false },
		{ title: 'Tipo Fornecedor', value: 'tipo', sortable: true, filterable: true, visible: false },
		{ title: 'Doc.', value: 'documento', sortable: true, filterable: true, visible: false },
		{ title: 'Empresa', value: 'empresa.apelido', sortable: true, filterable: true, visible: true, width: 110 },
		{ title: 'Motivo', value: 'motivo', sortable: true, filterable: true, visible: true },
		{ title: 'Observação', value: 'dados_complementares', sortable: true, filterable: true, visible: false },
		{ title: 'Forma de pagamento', value: 'tipo_pagamento.nome', sortable: true, filterable: true, visible: false },
		{ title: 'Descrição pagamento', value: 'descricao', sortable: true, filterable: true, visible: false },
		{ title: 'Data de aprovação', value: 'data_aprovacao', sortable: true, reorderable: true, filterable: false, visible: true },
		{ title: 'Data de vencimento', value: 'data', sortable: true, reorderable: true, filterable: false, visible: true },
		{ title: 'Valor total', value: 'valor_total', sortable: true, filterable: true, visible: true },
		{ title: 'NF', value: 'anexo', sortable: true, filterable: false, visible: true, width: 80 },
		{ title: 'DOC', value: 'doc', sortable: true, filterable: false, visible: true, width: 80 },
		{ title: 'Ações', value: 'actions', width: 120, fixed: true },
	],
};

export const getColumns = (table: string) => {
	return tabelas[table as keyof ITables];
};
