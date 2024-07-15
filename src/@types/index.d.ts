interface Windows extends Window {
  electronAPI: {
    reload: () => Promise<any>
    sendToken: (token: string) => Promise<any>
    updateAvailable: (callback: (event: IpcRendererEvent, version: string) => void) => void
    getVersion: () => any,
    getUser: () => Promise<any>,
    openFile: (filePath: string) => Promise<any>,
    openBase64File: (base64: number[]) => void,
    copyFilePath: (filePath: string) => Promise<any>,
    sendLink: (link: string) => Promise<any>,
  }
}