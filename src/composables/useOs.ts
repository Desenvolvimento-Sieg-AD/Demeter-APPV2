export default function useOs() {
  const electron = window.require('electron')

  const getUser = async () => {
    return await electron.ipcRenderer.invoke('os:getUser')
  }

  const openFile = async (filePath: string) => {
    return await electron.ipcRenderer.invoke('os:openFile', filePath)
  }

  const copyFilePath = async (filePath: string) => {
    return await electron.ipcRenderer.invoke('os:copyFilePath', filePath)
  }

  return { getUser, openFile, copyFilePath }
}