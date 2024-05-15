interface Windows extends Window {
  electronAPI: {
    getUser: () => Promise<any>,
    openFile: (filePath: string) => Promise<any>,
    copyFilePath: (filePath: string) => Promise<any>
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

  const copyFilePath = async (filePath: string) => {
    return await window.electronAPI.copyFilePath(filePath)
  }

  return { getUser, openFile, copyFilePath }
}