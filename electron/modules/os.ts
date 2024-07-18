import { BrowserWindow, shell, clipboard, ipcMain } from 'electron'
import os from 'os';
import { existsSync } from 'fs';

export default (mainWindow: BrowserWindow) => {
  const user = () => os.userInfo()

  const openFile = async (filePath: string) => {
    try {
      await shell.openPath(filePath)
      return { success: true }
    } 
	catch (err) {
      console.error('Erro ao abrir arquivo:', err)
      return { success: false, message: err }
    }
  }

  const hasFile = (filePath: string) => {
    try {
      return existsSync(filePath)
    }
    catch (err) {
      console.error('Erro ao verificar arquivo:', err)
      return false
    }
  }

  const copyFilePath = async (filePath: string) => {
    try {
      
      clipboard.writeText(filePath)
      return { success: true }
    } 
    catch (err) {
      console.error('Erro ao copiar caminho do arquivo:', err)
      return { success: false, message: err }
    }
  }

  ipcMain.handle('os:getUser', async () => {
    return user()
  })

  ipcMain.handle('os:openFile', async (_event, filePath: string) => {
    return await openFile(filePath)
  })

  ipcMain.handle('os:copyFilePath', async (_event, filePath: string) => {
    return await copyFilePath(filePath)
  })

  ipcMain.handle('os:hasFile', async (_event, filePath: string) => {
    return hasFile(filePath)
  })
}
