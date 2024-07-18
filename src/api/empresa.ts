export async function getEmpresa() {
	try {
		const { success, message, data } = await useApi(`/empresa`);
		if (!success) throw new Error(message);
		return { success, message, data };
	} 
	catch (error) {
		return { success: false, message: error, data: null };
	}
}

export async function getConta() {
	try {
		const { success, message, data } = await useApi(`/empresa/conta`);
		if (!success) throw new Error(message);
		return { success, message, data };
	} 
	catch (error) {
		return { success: false, message: error, data: null };
	}
}

export async function getCard() {
	try {
		const { success, message, data } = await useApi(`/empresa/conta/cards`);
		if (!success) throw new Error(message);
		return { success, message, data };
	} 
	catch (error) {
		return { success: false, message: error, data: null };
	}
}

export async function getClientByPayment() {
	try {
		const { success, message, data } = await useApi(`/empresa/client-by-payment`);

		if (!success) throw new Error(message)

		return { success, message, data }

	} 
	catch (error) {
		return { success: false, message: error }
	}
}

export async function getContasDisponiveis(empresa_id: number, tipo_pagamento_id: number) {
	try {
		const { success, message, data } = await useApi(`/empresa/${empresa_id}/contas/${tipo_pagamento_id}`);
		if (!success) throw new Error(message);
		return { success, message, data };
	}
	catch (error) {
		return { success: false, message: error, data: null };
	}
}
