import type { IpcRendererEvent } from 'electron'

declare var window: Windows

export default function useElectron() {
  const actions = {
    reload: () => window.electronAPI.reload(),
    sendToken: (token: string) => window.electronAPI.sendToken(token),
    updateAvailable: async (callback: (event: IpcRendererEvent, version: string) => void) => window.electronAPI.updateAvailable(callback),
    getVersion: (event: IpcRendererEvent) => window.electronAPI.getVersion()
  }

  return { actions }
}
