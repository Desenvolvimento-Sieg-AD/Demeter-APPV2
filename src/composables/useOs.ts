declare var window: Windows

export default function useOs() {

  const getUser = async () => await window.electronAPI.getUser()

  const openFile = async (filePath: string) => await window.electronAPI.openFile(filePath)

  const openBase64File = async (arquivo: any) => {
    const { $toast } = useNuxtApp();

    try {

      const exists = await window.electronAPI.hasFile(arquivo.caminho);
      if (exists) {
        await window.electronAPI.openFile(arquivo.caminho);
      }
      else if (arquivo.base64) {
        if (!arquivo.tipo_arquivo) throw new Error('Tipo do arquivo não definido');

        const base64String = base64ArrayToString(arquivo.base64.data)
        const base64URL = `data:${arquivo.tipo_arquivo.mime};base64,${base64String}`;
        
        const newWindow = window.open();
        if (newWindow) {
          newWindow.document.write(
            `<iframe src="${base64URL}" frameborder="0" style="border:0; top:0; left:0; bottom:0; right:0; width:100%; height:100%;" allowfullscreen></iframe>`
          );
        } 
        else {
          throw new Error('Não foi possível abrir o arquivo');
        }
      }
      else {
        throw new Error('Arquivo não encontrado');
      }
    }
    catch (error) {
      $toast.error('Não foi possível abrir o arquivo');
      console.error('Erro ao abrir o arquivo:', error.message);
    }
  }


  const copyFilePath = async (filePath: string) => await window.electronAPI.copyFilePath(filePath)

  const sendLink = async (link: string) => await window.electronAPI.sendLink(link)

  return { getUser, openFile, openBase64File, copyFilePath, sendLink }
}

const base64ArrayToString = (byteArray: any) => {
  let result = '';
  const chunkSize = 5000; // Tamanho do chunk para evitar o erro

  for (let i = 0; i < byteArray.length; i += chunkSize) {
    const chunk = byteArray.slice(i, i + chunkSize);
    result += String.fromCharCode(...chunk);
  }

  return result;
}