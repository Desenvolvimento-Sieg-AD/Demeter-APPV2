interface Windows extends Window {
  electronAPI: {
    reload: () => Promise<any>
    sendToken: (token: string) => Promise<any>
    updateAvailable: (callback: (event: IpcRendererEvent, version: string) => void) => void
    getVersion: () => any,
    getUser: () => Promise<any>,
    openFile: (filePath: string) => Promise<any>,
    copyFilePath: (filePath: string) => Promise<any>,
    hasFile: (filePath: string) => Promise<any>,
    sendLink: (link: string) => Promise<any>,
  }
}