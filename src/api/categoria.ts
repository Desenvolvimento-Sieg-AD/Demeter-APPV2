export async function getCategorias() {
  try {
    const { success, message, data } = await useApi(`/categoria`)
    if (!success) throw new Error(message)

    return { success, message, data: data.grupo }
  } catch (error) {
    return { success: false, message: error, data: null }
  }
}

export async function getCategoriasUsuario(setor_id: number, internacional: boolean = false) {
  try {
    const { success, message, data } = await useApi(`/categoria/usuario/${setor_id}`, {
      method: 'POST',
      body: JSON.stringify({ internacional })
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

    const grupos = data.map((g: any) => {
      return g.grupo
    })

    return { success, message, grupos }
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