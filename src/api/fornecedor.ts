export async function getFornecedor() {
	try {
		const { success, message, data } = await useApi(`/fornecedor`);
		if (!success) throw new Error(message);
		return { success, message, data };
	} catch (error) {
		return { success: false, message: error, data: null };
	}
}


export async function getFornecedorByDocumentOrName(documento?: string, name?: string) {
	try {
		const { success, message, data } = await useApi(`/fornecedor/one`, {
			method: 'POST',
			body: JSON.stringify({ documento, name }),
		});
		if (!success) throw new Error(message);
		return { success, message, data };
	} catch (error) {
		return { success: false, message: error, data: null };
	}
}