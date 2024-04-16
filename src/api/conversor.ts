export async function getFileContent(file: File) {

    const formData = new FormData();
    formData.append('file', file);

    const { success, message, data } = await useApi('/conversor', {
        method: 'POST',
        body: formData
    });
    if (!success) throw new Error(message);

    return data;
}