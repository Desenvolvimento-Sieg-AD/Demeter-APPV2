export async function getFornecedor(internacional: boolean = false) {
	try {
		const { success, message, data } = await useApi(`/fornecedor`, {
			query: { internacional },
		});
		if (!success) throw new Error(message);
		return { success, message, data };
	} 
	catch (error) {
		return { success: false, message: error, data: null };
	}
}

export async function getFornecedorByDocumentOrName(documento: any = null, name: any = null, internacional: boolean = false) {
	try {
		const { success, message, data } = await useApi(`/fornecedor/one`, {
			method: 'POST',
			body: JSON.stringify({ documento, name, internacional }),
		});
		if (!success) throw new Error(message);
		return { success, message, data };
	} 
	catch (error) {
		return { success: false, message: error, data: null };
	}
}

export async function getFornecedorById(fornecedor_id: number) {
	try {
		const { success, message, data } = await useApi(`/fornecedor/${fornecedor_id}`);
		if (!success) throw new Error(message);
		return { success, message, data };
	} 
	catch (error) {
		return { success: false, message: error, data: null };
	}
}