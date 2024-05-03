export async function getEmpresa() {
	try {
		const { success, message, data } = await useApi(`/empresa`);
		if (!success) throw new Error(message);
		return { success, message, data };
	} catch (error) {
		return { success: false, message: error, data: null };
	}
}

export async function getConta() {
	try {
		const { success, message, data } = await useApi(`/empresa/conta`);
		if (!success) throw new Error(message);
		return { success, message, data };
	} catch (error) {
		return { success: false, message: error, data: null };
	}
}

export async function getClientByPayment(){
	try {
		const { success, message, data } = await useApi(`/empresa/clientByPayment`);

		if (!success) throw new Error(message)

		return { success, message, data }

	} catch (error) {
		return { success: false, message: error}
	}
}
