/* eslint-disable camelcase */
interface PagamentoUpdate {
  conta_id: number
  empresa_id: number
  categoria_id: number
  grupo_id: number
}

interface StatusManage {
  id: Number[]
  status: number
  justificativa: string
  justificativaCliente: string
  justificativaFinanceiro: string
  ambos: boolean
  lote: boolean
  cancelamento: boolean
}

export async function getPagamentoTipo() {
  try {
    const { success, message, data } = await useApi(`/pagamento/tipo`)
    if (!success) throw new Error(message)
    return { success, message, data }
  } catch (error) {
    return { success: false, message: error, data: null }
  }
}

export async function getPagamentoByScope(scope: string) {
  try {
    const { success, message, data } = await useApi(`/pagamento/scope/${scope}`)
    if (!success) throw new Error(message)
    return { success, message, data }
  } catch (error) {
    return { success: false, message: error, data: null }
  }
}

export async function getProjects(search: string) {
  try {
    const { success, message, data } = await useApi(`/pagamento/projetos`, {
      method: 'POST',
      body: { search }
    })
    if (!success) throw new Error(message)

    return { success, message, data }
  } catch (error) {
    return { success: false, message: error, data: null }
  }
}

export async function createProjectAPI(nome: string){
  try{
    const { success, message, data } = await useApi(`/projeto`, {
      method: 'POST',
      body: { nome }
    })

    if (!success) throw new Error(message)

    return { success, message, data }

  } catch (error) {
    return { success: false, message: error, data: null }
  }
}

export async function getOnePayment(id: number, scope: string) {
  try {
    const { success, message, data } = await useApi(`/pagamento/${scope}/${id}`)
    if (!success) throw new Error(message)

    return { success, message, data }
  } catch (error) {
    return { success: false, message: error, data: null }
  }
}

export async function getPagamentoByClient(client_id: number) {
  try {
    const { success, message, data } = await useApi(`/pagamento/cliente/${client_id}`)

    if (!success) throw new Error(message)

    return { success, message, data }
  } catch (error) {
    return { success: false, message: error, data: null }
  }
}

export async function postPagamento(formData: FormData) {
  try {
    const { success, message, data } = await useApi(`/pagamento/`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    if (!success) throw new Error(message)
    return { success, message, data }
  } catch (error) {
    return { success: false, message: error, data: null }
  }
}

export async function sendPaymentsToOmie(payment_id: number) {
  const { success, message, data } = await useApi(`/pagamento/omie`, {
    method: 'POST',
    body: { payment_id }
  })

  return { success, message, data }
}

export async function existNFEqual(numero_nf: string, fornecedor_id: string) {
  try {
    const { success, message, data } = await useApi(`/pagamento/nf`, {
      method: 'POST',
      body: {
        numero_nf,
        fornecedor_id
      }
    })

    if (!success) throw new Error(message)

    return { success, message, data, exist: data.exist }
  } catch (error) {
    return { success: false, message: error, data: null }
  }
}

export async function postUpload(formData: FormData, id: Number) {
  try {
    const { success, message, data } = await useApi(`/pagamento/upload/${id}`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    if (!success) throw new Error(message)
    return { success, message, data }
  } catch (error) {
    return { success: false, message: error, data: null }
  }
}

export async function postStatus(status: StatusManage) {
  try {
    const { success, message, data } = await useApi(`/pagamento/pagamento/status`, {
      method: 'POST',
      body: status
    })

    if (!success) throw new Error(message)
    return { success, message, data }
  } catch (error) {
    return { success: false, message: error, data: null }
  }
}

export async function updatePagamento(id: Number, payload: PagamentoUpdate) {
  try {
    const { success, message, data } = await useApi(`/pagamento/${id}`, {
      method: 'PUT',
      body: payload,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    if (!success) throw new Error(message)
    return { success, message, data }
  } catch (error) {
    return { success: false, message: error, data: null }
  }
}
export async function alterCountAll(ids: Number[], conta_id: Number, empresa_id: Number) {
  try {
    const { success, message, data } = await useApi(`/pagamento/alterCounts`, {
      method: 'POST',
      body: { conta_id, empresa_id, ids }
    })

    if (!success) throw new Error(message)
    return { success, message, data }
  } catch (error) {
    return { success: false, message: error, data: null }
  }
}

export async function omie(send: any) {
  try {
    const { success, message, data } = await useApi(`/pagamento/omie`, {
      method: 'POST',
      body: send
    })

    if (!success) throw new Error(message)
    return { success, message, data }
  } catch (error) {
    return { success: false, message: error, data: null }
  }
}

export async function getPagamentoById(id: Number) {
  try {
    const { success, message, data } = await useApi(`/pagamento/${id}`)
    if (!success) throw new Error(message)

    return { success, message, data }
  } catch (error) {
    return { success: false, message: error, data: null }
  }
}

export async function getTiposChavePix() {
  try {
    const { success, message, data } = await useApi(`/public/tipo-chave-pix`)
    if (!success) throw new Error(message)

    return { success, message, data }
  } catch (error) {
    return { success: false, message: error, data: null }
  }
}
