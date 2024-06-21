import { BrowserWindow, ipcMain, app } from 'electron'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'
import { userInfo } from 'os'
import { join } from 'path'
import axios from 'axios'

// Logger
// ======
autoUpdater.logger = log
autoUpdater.autoDownload = true
autoUpdater.autoInstallOnAppQuit = true
autoUpdater.disableWebInstaller = true
;(autoUpdater.logger as typeof log).transports.file.level = 'info'

log.transports.file.resolvePathFn = () => join('C:/Projetos/Demeter-APPV2', './logs/main.log')

const caminho_log = 'C:/Projetos/Demeter-APPV2/logs/main.log'

// Module
// ======
export default (mainWindow: BrowserWindow) => {
  const isMac = process.platform === 'darwin'
  if (isMac) {
    autoUpdater.autoDownload = false
    autoUpdater.autoInstallOnAppQuit = false
  }

  // Helpers
  // =======
  let readyToInstall = false
  let globalVersion = ''

  function sendUpdaterStatus(...args: any[]) {
    log.info('Updater status changed', args)
    mainWindow.webContents.send('updater:statusChanged', args)
  }

  autoUpdater.setFeedURL({
    provider: 'github',
    owner: 'Desenvolvimento-Sieg-AD',
    repo: 'Demeter-APPV2',
    private: false,
    token: process.env.GITHUB_TOKEN
  })

  autoUpdater.on('checking-for-update', () => {
    sendUpdaterStatus('check-for-update')
  })

  autoUpdater.on('update-available', (_info) => {
    sendUpdaterStatus('update-available')
  })

  autoUpdater.on('update-not-available', (_info) => {
    sendUpdaterStatus('update-not-available')
  })

  autoUpdater.on('error', async (_err) => {
    await sendStatusToDEV('Erro ao atualizar', globalVersion, _err.message)
    sendUpdaterStatus('update-error', _err)
  })

  autoUpdater.on('download-progress', async (progressObj) => {
    let log_message = `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${Number(progressObj.percent)}%`
    log_message += ` (${Number(progressObj.transferred)}/${Number(progressObj.total)})`
    sendUpdaterStatus('downloading', progressObj)
  })

  autoUpdater.on('update-downloaded', async (info) => {
    globalVersion = info.version

    sendUpdaterStatus('Update downloaded')

    mainWindow?.webContents.send('update:readyToInstall', info)

    readyToInstall = true

    await sendStatusToDEV('Atualização realizada com sucesso', globalVersion)

    if (readyToInstall) {
      mainWindow?.webContents.send('updateAvailable', true, info.version)
      setTimeout(() => {
        autoUpdater.quitAndInstall(false, true)
        log.info('Quit and install...')
      }, 5000)
    }
  })

  // IPC Listeners
  // =============
  ipcMain.handle('updater:check', async (_event) => {
    return await autoUpdater.checkForUpdates()
  })

  ipcMain.handle('updater:quitAndInstall', (_event) => {
    if (!readyToInstall) return
    autoUpdater.quitAndInstall()
  })

  autoUpdater.checkForUpdates()

  console.log('[-] MODULE::updater Initialized')

  async function sendStatusToDEV(resultado: string, versao_atualizada: string, mensagem?: string) {
    try {
      const url = 'http://localhost:8000/api/public/auto-updater'

      const token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwic2lnbGEiOiJCU0MiLCJub21lIjoiQnJlbm5vIEVkdWFyZG8gZGUgU291emEgQ29zdGEiLCJlbWFpbCI6ImJzY0BzaWVnLWFkLmNvbS5iciIsInNldG9yIjp7ImlkIjoyLCJub21lIjoiTGljaXRhw6fDo28iLCJleGliaXJfcHJvamV0b3MiOnRydWV9LCJpYXQiOjE3MTUyODM2NzMsImV4cCI6MTcxNzg3NTY3M30.8N9uPGd8d5Zrkrb6OVCMb2hLVUtIc-eSc7avqzILmBg'
      const headers = { 'Content-Type': 'application/json', Authorization: `${token}` }

      const response = await axios.post(
        url,
        {
          resultado,
          caminho_log,
          versao_atualizada,
          mensagem_atualizacao: mensagem ? mensagem : '',
          sigla: userInfo().username,
          versao_anterior: app.getVersion(),
          data_atualizacao: new Date().toLocaleDateString()
        },
        { headers }
      )

      if (response.status !== 200) {
        log.info(`Error sending status to DEV: ${response.status}`)
      }
    } catch (error) {
      log.info('Error in sendStatusToDEV', error)
    }
  }
}
