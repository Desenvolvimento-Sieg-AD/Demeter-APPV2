import { getArquivoPagamento } from "~/api";

declare var window: Windows

export default function useOs() {

  const getUser = async () => await window.electronAPI.getUser()

  const openFile = async (filePath: string) => await window.electronAPI.openFile(filePath)

  const openBase64File = async (id: number) => {
    const { $toast } = useNuxtApp();

    try {
      const { success, message, data } = await getArquivoPagamento(id);
      if (!success) throw new Error(message);

      const exists = await window.electronAPI.hasFile(data.caminho);
      if (exists) {
        await window.electronAPI.openFile(data.caminho);
      }
      else if (data.base64) {
        if (!data.tipo_arquivo) throw new Error('Tipo do arquivo não definido');

        const base64String = base64ArrayToString(data.base64.data)
        const base64URL = `data:${data.tipo_arquivo.mime};base64,${base64String}`;
        
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
        throw new Error('Arquivo não encontrado no diretório');
      }
    }
    catch (error) {
      $toast.error(error.message);
      console.error(error);
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