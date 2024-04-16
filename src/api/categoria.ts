export async function getCategorias() {
	try {
		const { success, message, data } = await useApi(`/categoria`);
		if (!success) throw new Error(message);
		return { success, message, data };
	} catch (error) {
		return { success: false, message: error, data: null };
	}
}

export async function getCategoriasByGrupo(id: number) {
	try {
		const { success, message, data } = await useApi(`/categoria/${id}/grupo`);
		if (!success) throw new Error(message);

		return { success, message, data };
	} catch (error) {
		return { success: false, message: error };
	}
}

export async function getGrupos() {
	try {
		const { success, message, data } = await useApi(`/categoria/grupo`);
		if (!success) throw new Error(message);

		return { success, message, data };
	} catch (error) {
		return { success: false, message: error, data: null };
	}
}
