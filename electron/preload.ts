import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getUser: () => ipcRenderer.invoke('os:getUser'),
  openFile: (filePath: any) => ipcRenderer.invoke('os:openFile', filePath),
  copyFilePath: (filePath: any) => ipcRenderer.invoke('os:copyFilePath', filePath),
  reload: () => ipcRenderer.invoke('reload:app', null),
  sendToken: (token: string) => ipcRenderer.invoke('sendToken:app', token),
  sendLink: (link: string) => ipcRenderer.invoke('sendLink:app', link),
  updateAvailable: (callback: any) => ipcRenderer.on('updateAvailable:app', (event: IpcRendererEvent, version: string) => callback(event, version))
});