declare var window: Windows

export default function useOs() {

  const getUser = async () => await window.electronAPI.getUser()

  const openFile = async (filePath: string) => await window.electronAPI.openFile(filePath)

  const openBase64File = async (arquivo: any) => {
    const { $toast } = useNuxtApp();

    try {
      
      if (arquivo.base64) {
        if (!arquivo.tipo_arquivo) return $toast.error('Tipo de arquivo não encontrado');

        const base64String = String.fromCharCode(...arquivo.base64.data);
        const base64URL = `data:${arquivo.tipo_arquivo.mime};base64,${base64String}`;
        
        const newWindow = window.open();
        if (newWindow) {
          newWindow.document.write(
            `<iframe src="${base64URL}" frameborder="0" style="border:0; top:0; left:0; bottom:0; right:0; width:100%; height:100%;" allowfullscreen></iframe>`
          );
        } 
        else {
          console.error('Não foi possível abrir uma nova janela.');
        }
      }
      else {
        const newWindow = window.open(arquivo.caminho);
      }
    }
    catch (error) {
      $toast.error('Não foi possível abrir o arquivo');
      console.error('Erro ao abrir o arquivo:', error);
    }
  }


  const copyFilePath = async (filePath: string) => await window.electronAPI.copyFilePath(filePath)

  const sendLink = async (link: string) => await window.electronAPI.sendLink(link)

  return { getUser, openFile, openBase64File, copyFilePath, sendLink }
}