import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getUser: () => ipcRenderer.invoke('os:getUser'),
  openFile: (filePath: any) => ipcRenderer.invoke('os:openFile', filePath),
  copyFilePath: (filePath: any) => ipcRenderer.invoke('os:copyFilePath', filePath)
});