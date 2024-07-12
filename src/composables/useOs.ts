interface Windows extends Window {
  electronAPI: {
    getUser: () => Promise<any>,
    openFile: (filePath: string) => Promise<any>,
    openBase64File: (base64: number[]) => void,
    copyFilePath: (filePath: string) => Promise<any>,
    sendLink: (link: string) => Promise<any>,
  }
}

declare var window: Windows

const { $toast } = useNuxtApp();

export default function useOs() {

  const getUser = async () => {
    return await window.electronAPI.getUser()
  }

  const openFile = async (filePath: string) => {
    return await window.electronAPI.openFile(filePath)
  }

  const openBase64File = async (pagamento: any, tipo_anexo_id: number) => {
    try {

      const anexo = pagamento.anexos_pagamento.find((anexo: any) => tipo_anexo_id == anexo.tipo_anexo_id);
      if (!anexo) return $toast.error('Anexo não encontrado');
    
      if (!anexo.base64 || !anexo.tipo_arquivo) return $toast.error('Arquivo não encontrado');
  
      // Converta o array de inteiros para uma string
      const base64String = String.fromCharCode(...anexo.base64.data);
      
      const base64URL = `data:${anexo.tipo_arquivo.mime};base64,${base64String}`;
      
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(
          `<iframe src="${base64URL}" frameborder="0" style="border:0; top:0; left:0; bottom:0; right:0; width:100%; height:100%;" allowfullscreen></iframe>`
        );
      } else {
        console.error('Não foi possível abrir uma nova janela.');
      }
    }
    catch (error) {
      console.error('Erro ao abrir o arquivo:', error);
      $toast.error('Não foi possível abrir o arquivo');
    }
  }

  const copyFilePath = async (filePath: string) => {
    return await window.electronAPI.copyFilePath(filePath)
  }

  const sendLink = async (link: string) => {
    return await window.electronAPI.sendLink(link)
  }

  return { getUser, openFile, openBase64File, copyFilePath, sendLink }
}