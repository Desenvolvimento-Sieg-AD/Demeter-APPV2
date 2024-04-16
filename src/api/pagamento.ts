interface PagamentoUpdate {
	conta_id: number;
	empresa_id: number;
	categoria_id: number;
	grupo_id: number;
}

export async function getPagamentoTipo() {
	try {
		const { success, message, data } = await useApi(`/pagamento/tipo`);
		if (!success) throw new Error(message);
		return { success, message, data };
	} catch (error) {
		return { success: false, message: error, data: null };
	}
}

export async function getPagamentoPorUsuario() {
	try {
		const { success, message, data } = await useApi(`/pagamento/usuario/usuarioScope`);
		if (!success) throw new Error(message);
		return { success, message, data };
	} catch (error) {
		return { success: false, message: error, data: null };
	}
}

export async function getProjects() {
	try {
		const { success, message, data } = await useApi(`/pagamento/projetos`);
		if (!success) throw new Error(message);
		return { success, message, data };
	} catch (error) {
		return { success: false, message: error, data: null };
	}
}

export async function getPagamento() {
	try {
		const { success, message, data } = await useApi(`/pagamento/scope/geralScope`);
		if (!success) throw new Error(message);

		return { success, message, data };
	} catch (error) {
		return { success: false, message: error, data: null };
	}
}

export async function findOnePayment(id: number){
	try {
		const { success, message, data } = await useApi(`/pagamento/financeiroScope/${id}`);
		if (!success) throw new Error(message);

		return { success, message, data };
	} catch (error) {
		return { success: false, message: error, data: null };
	}
}

export async function getPagamentoGerencia() {
	try {
		const { success, message, data } = await useApi(`/pagamento/scope/gerenciaScope`);
		if (!success) throw new Error(message);

		return { success, message, data };
	} catch (error) {
		return { success: false, message: error, data: null };
	}
}

export async function getPagamentoFinanceiro() {
	try {
		const { success, message, data } = await useApi(`/pagamento/scope/financeiroScope`);

		if (!success) throw new Error(message);
		return { success, message, data };
	} catch (error) {
		return { success: false, message: error, data: null };
	}
}

export async function postPagamento(formData: FormData) {
	try {
		const { success, message, data } = await useApi(`/pagamento/`, {
			method: 'POST',
			body: formData,
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});

		if (!success) throw new Error(message);
		return { success, message, data };
	} catch (error) {
		return { success: false, message: error, data: null };
	}
}

export async function existNFEqual(numero_nf: string, fornecedor_id: string){
	try {
		const { success, message, data, } = await useApi(`/pagamento/nf`, {
			method: 'POST',
			body: {
				numero_nf,
				fornecedor_id
			}
		})

		if (!success) throw new Error(message);

		return { success, message, data, exist: data.exist}

	} catch (error) {
		return { success: false, message: error, data: null };
	}
}

export async function postUpload(formData: FormData, id: Number) {
	try {
		const { success, message, data } = await useApi(`/pagamento/upload/${id}`, {
			method: 'POST',
			body: formData,
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});

		if (!success) throw new Error(message);
		return { success, message, data };
	} catch (error) {
		return { success: false, message: error, data: null };
	}
}

export async function postStatus(status: {
	id: Number[];
	status: number;
	justificativa: string;
	justificativaCliente: string;
	justificativaFinanceiro: string;
	ambos: boolean;
	lote: boolean;
}) {
	try {
		const { success, message, data } = await useApi(`/pagamento/pagamento/status`, {
			method: 'POST',
			body: status,
		});

		if (!success) throw new Error(message);
		return { success, message, data };
	} catch (error) {
		return { success: false, message: error, data: null };
	}
}

export async function updatePagamento(id: Number, payload: PagamentoUpdate) {
	try {
		const { success, message, data } = await useApi(`/pagamento/${id}`, {
			method: 'POST',
			body: payload,
		});

		if (!success) throw new Error(message);
		return { success, message, data };
	} catch (error) {
		return { success: false, message: error, data: null };
	}
}
export async function alterCountAll(ids: Number[], conta_id: Number, empresa_id: Number) {
	try {
		const { success, message, data } = await useApi(`/pagamento/alterCounts`, {
			method: 'POST',
			body: { conta_id, empresa_id, ids },
		});

		if (!success) throw new Error(message);
		return { success, message, data };
	} catch (error) {
		return { success: false, message: error, data: null };
	}
}

export async function omie(send: any) {
	try {
		const { success, message, data } = await useApi(`/pagamento/omie`, {
			method: 'POST',
			body: send,
		});

		if (!success) throw new Error(message);
		return { success, message, data };
	} catch (error) {
		return { success: false, message: error, data: null };
	}
}

export async function getPagamentoById(id: Number) {
	try {
		const { success, message, data } = await useApi(`/pagamento/${id}`);
		if (!success) throw new Error(message);

		return { success, message, data };
	} catch (error) {
		return { success: false, message: error, data: null };
	}
}

export async function getTiposChavePix(){
	try {
		const { success, message, data } = await useApi(`/public/tipo-chave-pix`);
		if (!success) throw new Error(message);

		return { success, message, data };
	} 
	catch (error) {
		return { success: false, message: error, data: null };
		
	}
}
