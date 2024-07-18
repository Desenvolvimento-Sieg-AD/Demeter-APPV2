interface IUpdateCategoriaSetor {
  setor_id: number,
  categorias: any[]
}

export async function getSetoresPadrao() {
    try {
      const { success, message, data } = await useApi(`/setor/`)
      if (!success) throw new Error(message)
      return { success, message, data }
    } 
	catch (error) {
      return { success: false, message: error, data: null }
    }
  }

export async function getSetoresCategorias() {
    try {
      const { success, message, data } = await useApi(`/setor/setores-categoria/`)
      if (!success) throw new Error(message)
      return { success, message, data }
    } 
	catch (error) {
      return { success: false, message: error, data: null }
    }
}

export async function getSetor (id: number) {
    try {
        const { success, message, data } = await useApi(`/setor/${id}`)
        if (!success) throw new Error(message)
        return { success, message, data }
    } 
	catch (error) {
        return { success: false, message: error, data: null }
    }
}

export async function updateCategoriaSetor (options: IUpdateCategoriaSetor) {
    try {
        const { success, message } = await useApi(`/setor/setores-categoria`,
          {
            method: 'PUT',
            body: JSON.stringify(options)
          }
        )
        if (!success) throw new Error(message)
        return { success, message }
    } 
	catch (error) {
        return { success: false, message: error }
    }
}