import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getUser: () => ipcRenderer.invoke('os:getUser'),
  openFile: (filePath: any) => ipcRenderer.invoke('os:openFile', filePath),
  copyFilePath: (filePath: any) => ipcRenderer.invoke('os:copyFilePath', filePath),
  reload: () => ipcRenderer.invoke('reload:app', null),
  sendToken: (token: string) => ipcRenderer.invoke('sendToken:app', token),
});