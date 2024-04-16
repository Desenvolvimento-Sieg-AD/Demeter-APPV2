export async function getFornecedor() {
	try {
		const { success, message, data } = await useApi(`/fornecedor`);
		if (!success) throw new Error(message);
		return { success, message, data };
	} catch (error) {
		return { success: false, message: error, data: null };
	}
}
