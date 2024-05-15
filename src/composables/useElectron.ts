interface Windows extends Window {
  electronAPI: {
    reload: () => Promise<any>,
    sendToken: (token: string) => Promise<any>
  }
}

declare var window: Windows

export default function useElectron() {
  // ========================
  const actions = {
    reload: () =>  window.electronAPI.reload(),
    sendToken: (token: string) => window.electronAPI.sendToken(token)
  }

  return { actions }
}
