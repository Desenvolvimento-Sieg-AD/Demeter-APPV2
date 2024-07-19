export const getProjetoByID = async (id: string) => {
  try {
    const { success, message, data } = await useApi(`/projeto/${id}`)
    if (!success) throw new Error(message)

    return { success, message, data }
  } 
	catch (error) {
    return { success: false, message: error, data: null }
  }
}