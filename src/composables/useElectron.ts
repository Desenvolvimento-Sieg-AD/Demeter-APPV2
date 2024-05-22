import type { IpcRendererEvent } from "electron"

interface Windows extends Window {
  electronAPI: {
    reload: () => Promise<any>,
    sendToken: (token: string) => Promise<any>,
    updateAvailable: (callback: (event: IpcRendererEvent, version: string) => void) => void,
  }
}

declare var window: Windows

export default function useElectron() {
  const actions = {
    reload: () =>  window.electronAPI.reload(),
    sendToken: (token: string) => window.electronAPI.sendToken(token),
    updateAvailable: async (callback: (event: IpcRendererEvent, version: string) => void) => window.electronAPI.updateAvailable(callback),
  }

  return { actions }
}
