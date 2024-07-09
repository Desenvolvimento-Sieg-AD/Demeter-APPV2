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

export default function useOs() {

  const getUser = async () => {
    return await window.electronAPI.getUser()
  }

  const openFile = async (filePath: string) => {
    return await window.electronAPI.openFile(filePath)
  }

  const openBase64File = async (base64Array: number[]) => {
    // Converta o array de inteiros para uma string
    const base64String = String.fromCharCode(...base64Array);
    
    const base64URL = `data:application/pdf;base64,${base64String}`;
    return window.open(base64URL);
  };  

  const copyFilePath = async (filePath: string) => {
    return await window.electronAPI.copyFilePath(filePath)
  }

  const sendLink = async (link: string) => {
    return await window.electronAPI.sendLink(link)
  }

  return { getUser, openFile, openBase64File, copyFilePath, sendLink }
}