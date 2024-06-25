export async function getCategorias() {
  try {
    const { success, message, data } = await useApi(`/categoria`)
    if (!success) throw new Error(message)

    return { success, message, data: data.grupo }
  } catch (error) {
    return { success: false, message: error, data: null }
  }
}

export async function getCategoriaById(id: number) {
  try {
    const { success, message, data } = await useApi(`/categoria/${id}`)
    if (!success) throw new Error(message)

    return { success, message, data }
  } catch (error) {
    return { success: false, message: error }
  }
}

export async function getCategoriasWithGrupo(){
  try {
    const { success, message, data } = await useApi(`/categoria/grupos`)
    if (!success) throw new Error(message)

    return { success, message, data }
  } catch (error) {
    return { success: false, message: error, data: null }
  }
}

export async function getCategoriasUsuario(setor_id: number, internacional: boolean | null, nacional: boolean | null) {
  try {
    const { success, message, data } = await useApi(`/categoria/usuario/${setor_id}`, {
      method: 'POST',
      body: JSON.stringify({ internacional, nacional })
    })
    if (!success) throw new Error(message)

    return { success, message, data }
  } catch (error) {
    return { success: false, message: error, data: null }
  }
}
export async function getCategoriasUsuarioById(id: number) {
  try {
    const { success, message, data } = await useApi(`/categoria/usuario/${id}`)
    if (!success) throw new Error(message)

    return { success, message, data }
  } catch (error) {
    return { success: false, message: error, data: null }
  }
}

export async function getCategoriasByGrupo(id: number) {
  try {
    const { success, message, data } = await useApi(`/categoria/${id}/grupo`)
    if (!success) throw new Error(message)

    return { success, message, data }
  } catch (error) {
    return { success: false, message: error }
  }
}

export async function getGrupos() {
  try {
    const { success, message, data } = await useApi(`/categoria/grupo`)
    if (!success) throw new Error(message)

    return { success, message, data }
  } catch (error) {
    return { success: false, message: error, data: null }
  }
}

export async function getGrupoWithCategoria() {
  try {
    const { success, message, data } = await useApi(`/categoria/grupo/grupo-categoria`)
    if (!success) throw new Error(message)

    return { success, message, data }
  } catch (error) {
    return { success: false, message: error, data: null }
  }
}


export async function existRelationSetorWithEmpresa(setor_id: number, empresa_id: number) {
  try {
    const { success, message, data } = await useApi(`/setor/${setor_id}/${empresa_id}`)
    if (!success) throw new Error(message)

    return { success, message, data }
  } catch (error) {
    return { success: false, message: error }
  }
}

export async function createCategoria(options: { nome: string, descricao: string, grupo_id: number, empresas_id: number[], setores_id: number[] }) {
  try {
    const { success, message, data } = await useApi(`/categoria`, {
      method: 'POST',
      body: JSON.stringify(options)
    })
    if (!success) throw new Error(message)

    return { success, message, data }
  } catch (error) {
    return { success: false, message: error }
  }
}

export async function updateCategoria(id: number, options: { nome: string, descricao: string, grupo_id: number, empresas_id: number[], setores_id: number[] }) {
  try {
    const { success, message, data } = await useApi(`/categoria/${id}`, {
      method: 'PUT',
      body: JSON.stringify(options)
    })
    if (!success) throw new Error(message)

    return { success, message, data }
  } catch (error) {
    return { success: false, message: error }
  }
}