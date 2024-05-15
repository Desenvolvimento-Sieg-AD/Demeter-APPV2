import * as path from 'path'
import { autoUpdater } from 'electron-updater'
import * as os from 'os'
import { app, BrowserWindow, ipcMain, ipcRenderer, webContents } from 'electron'
import singleInstance from './singleInstance'
import dynamicRenderer from './dynamicRenderer'
import titleBarActionsModule from './modules/titleBarActions'
import updaterModule from './modules/updater'
import osModule from './modules/os'
import log from 'electron-log';
import axios from 'axios'

// ? AUTO UPDATE CONFIG

autoUpdater.logger = log;
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;
autoUpdater.disableWebInstaller = true;

(autoUpdater.logger as typeof log).transports.file.level = 'info'

log.transports.file.resolvePathFn = () => path.join('A:/Dev TI/Demeter', './logs/main.log');

const caminho_log = 'A:/Dev TI/Demeter/logs/main.log';

function sendStatusToWindow(text: string, teste?: any) {
  log.info(text, teste);
  if (mainWindow) mainWindow.webContents.send('message', text, teste);
  else console.log('Main window is not available');
}

// Initilize

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'

let globalVersion  = ''
let mainWindow: BrowserWindow
let tokenAPI = ''

const isProduction = process.env.NODE_ENV !== 'development'
const platform: 'darwin' | 'win32' | 'linux' = process.platform as any
const architucture: '64' | '32' = os.arch() === 'x64' ? '64' : '32'
const headerSize = 32
const modules = [titleBarActionsModule, updaterModule, osModule]

let readyToInstall = false;

// Initialize app window
// =====================

function createWindow() {

  console.log('System info', { isProduction, platform, architucture })

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 1024,
    minWidth: 1024,
    minHeight: 676,
    backgroundColor: '#FFF',
    webPreferences: {
      devTools: !isProduction,
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'hiddenInset',
    autoHideMenuBar: true,
    transparent: false,
    // frame: platform === 'darwin',
    frame: true, // <= Remove this line if you wanted to implement your own title bar
    titleBarOverlay: platform === 'darwin' && { height: headerSize },
    title: 'SIEG Pagamentos',
    icon: path.join(__dirname, '../..', 'public', 'favicon.ico')
  })

  mainWindow.maximize()

  // Lock app to single instance
  if (singleInstance(app, mainWindow)) return

  // Open the DevTools.
 
  mainWindow.webContents.openDevTools({ mode: 'detach' })

  return mainWindow
}

// App events
// ==========
app.whenReady().then(async () => {
  
  mainWindow = createWindow() || new BrowserWindow();

  if (!mainWindow) return

  // Load renderer process
  dynamicRenderer(mainWindow)

  // Initialize modules
  console.log('-'.repeat(30) + '\n[+] Loading modules...')

  modules.forEach((module) => {
    try {

      if (mainWindow) module(mainWindow)

    } catch (err: any) {
      console.log('[!] Module error: ', err.message || err)
    }
  })

  console.log('[!] Loading modules: Done.' + '\r\n' + '-'.repeat(30))

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    // if (BrowserWindow.getAllWindows().length === 0) createWindow()
    mainWindow.show()
  })

})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.handle('reload:app', () => {
  mainWindow?.reload()
})

ipcMain.handle('sendToken:app', (event, token) => {
  tokenAPI = token
})

app.on('ready', function()  {
	autoUpdater.checkForUpdatesAndNotify();
});

autoUpdater.setFeedURL({
  provider: "github",

  owner: "Desenvolvimento-Sieg-AD",
  repo: "Demeter-APPV2",
  private: false,
  token: process.env.GITHUB_TOKEN
});

autoUpdater.on('checking-for-update', () => {
	sendStatusToWindow('Checking for update... Please wait...');
});

autoUpdater.on('update-available', (info) => {
	sendStatusToWindow('Update available.');
});

autoUpdater.on('update-not-available', (info) => {
	sendStatusToWindow('Update not available.', info);
});

autoUpdater.on('error', async (err) => {
	await sendStatusToDEV('Erro ao atualizar', globalVersion, err.message)
	sendStatusToWindow('Error in auto-updater. ' + err);
});

autoUpdater.on('download-progress', async (progressObj) => {
    let log_message = `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${Number(progressObj.percent)}%`;
    log_message += ` (${Number(progressObj.transferred)}/${Number(progressObj.total)})`;
    sendStatusToWindow(log_message);
});

autoUpdater.on('update-downloaded', async (info) => {
    globalVersion = info.version;  

    sendStatusToWindow('Update downloaded');

    mainWindow?.webContents.send('update:readyToInstall', info);

    readyToInstall = true;

	  await sendStatusToDEV('Atualização realizada com sucesso', globalVersion);

    if (readyToInstall) {

      mainWindow?.webContents.send('updateAvailable', true, info.version);
      setTimeout(() => {
          autoUpdater.quitAndInstall(false, true);
          log.info('Quit and install...');
        }, 5000);

    }

});

ipcMain.on('check-for-update', () => {
	autoUpdater.checkForUpdates();
});

async function sendStatusToDEV(resultado: string, versao_atualizada: string, mensagem?: string){
	try {

		const url = 'http://192.168.1.43:8000/api/public/auto-updater';
		const headers = { 'Content-Type': 'application/json', Authorization: `${tokenAPI}` };

		const response = await axios.post(url, {
				resultado,
				caminho_log,
				versao_atualizada,
				mensagem_atualizacao: mensagem ? mensagem : '',
				sigla: os.userInfo().username,
				versao_anterior: app.getVersion(),
				data_atualizacao: new Date().toLocaleDateString(),
			}, { headers })

		if (response.status !== 200) {
			log.info(`Error sending status to DEV: ${response.status}`);
		}

	} catch (error) {
		log.info('Error in sendStatusToDEV', error);
	}
}

