import * as path from 'path'
import * as os from 'os'
import { app, BrowserWindow, session } from 'electron'
import singleInstance from './singleInstance'
import dynamicRenderer from './dynamicRenderer'
import titleBarActionsModule from './modules/titleBarActions'
import updaterModule from './modules/updater'
import osModule from './modules/os'

// Initilize
// =========
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'
const isProduction = process.env.NODE_ENV !== 'development'
const platform: 'darwin' | 'win32' | 'linux' = process.platform as any
const architucture: '64' | '32' = os.arch() === 'x64' ? '64' : '32'
const headerSize = 32
const modules = [titleBarActionsModule, updaterModule, osModule]

// Initialize app window
// =====================
function createWindow() {
  console.log('System info', { isProduction, platform, architucture })
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 1024,
    minWidth: 1024,
    minHeight: 676,
    backgroundColor: '#FFF',
    webPreferences: {
      devTools: true,
      nodeIntegration: true,
      contextIsolation: false,
      // preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'hiddenInset',
    autoHideMenuBar: false,
    transparent: false,
    // frame: platform === 'darwin',
    frame: true, // <= Remove this line if you wanted to implement your own title bar
    titleBarOverlay: platform === 'darwin' && { height: headerSize },
    title: 'SIEG Pagamentos',
    icon: path.join(__dirname, '../..', 'public', 'favicon.ico')
  })

  if (process.env.VITE_DEV_SERVER_URL) mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
	else mainWindow.loadFile(path.join('.output/public/', 'index.html'));

  // Lock app to single instance
  if (singleInstance(app, mainWindow)) return

  // Open the DevTools.
  mainWindow.webContents.openDevTools({mode: 'detach'})

  return mainWindow
}

// App events
// ==========
app.whenReady().then(async () => {
  if (!isProduction) {
    try { 
      await session.defaultSession.loadExtension(path.join(__dirname, '../..', '__extensions', 'vue-devtools'))
    } 
    catch (err) {
      console.log('[Electron::loadExtensions] An error occurred: ', err)
    }
  }

  const mainWindow = createWindow()
  if (!mainWindow) return

  if (process.env.VITE_DEV_SERVER_URL) mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
	else mainWindow.loadFile(path.join('.output/public/', 'index.html'));

  // Load renderer process
  dynamicRenderer(mainWindow)

  // Initialize modules
  console.log('-'.repeat(30) + '\n[+] Loading modules...')
  modules.forEach((module) => {
    try {
      module(mainWindow)
    } 
    catch (err: any) {
      console.log('[!] Module error: ', err.message || err)
    }
  })

  console.log('[!] Loading modules: Done.' + '\r\n' + '-'.repeat(30))

  app.on('activate', function () {
    // if (BrowserWindow.getAllWindows().length === 0) createWindow()

    mainWindow.show()

    // Lock app to single instance
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
