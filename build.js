// eslint-disable-next-line @typescript-eslint/no-var-requires
const { build } = require('electron-builder')
const builder = require('electron-builder')
const Platform = builder.Platform

/**
 * @type {import('electron-builder').Configuration}
 */
const options = {
  appId: 'com.sieg.pagamentos',
  productName: 'SIEG Pagamentos',
  // protocols: {
  // name: 'Your deeplink',
  // - Don't forget to set `MimeType: "x-scheme-handler/deeplink"` for `linux.desktop` entry!
  // schemes: ['deeplink']
  // },
  // - Electron auto-updater config
//   owner: SIEG AD - Tecnologia
// repo: 'https://github.com/Desenvolvimento-Sieg-AD/Demeter-APPV2',
// provider: github
  publish: [
    {
      provider: 'github',
      owner: 'SIEG AD - Tecnologia',
      repo: 'https://github.com/Desenvolvimento-Sieg-AD/Demeter-APPV2',
    },
  ],
  // ],

  // "store" | "normal" | "maximum" - For testing builds, use 'store' to reduce build time significantly.
  compression: 'maximum',
  removePackageScripts: true,

  nodeGypRebuild: false,
  buildDependenciesFromSource: false,

  directories: {
    output: 'sieg-pagamentos'
  },
  win: {
    // eslint-disable-next-line no-template-curly-in-string
    artifactName: '${productName}-Setup-${version}.${ext}',
    icon: 'electron/assets/favicon.ico',
    target: [
      {
        target: 'nsis',
        arch: ['x64', 'ia32']
      }
    ]
  },
  nsis: {
    deleteAppDataOnUninstall: true
  },
  mac: {
    category: 'public.app-category.entertainment',
    hardenedRuntime: false,
    gatekeeperAssess: false,
    target: [
      {
        target: 'default',
        arch: ['x64', 'arm64']
      }
    ]
  },
  linux: {
    maintainer: 'SIEG AD - Tecnologia',
    desktop: {
      StartupNotify: 'false',
      Encoding: 'UTF-8',
      MimeType: 'x-scheme-handler/deeplink'
    },
    target: ['AppImage', 'rpm', 'deb']
  }
}

const platform = 'WINDOWS' // "MAC" | "LINUX" | "WINDOWS" - Change this to build for other platforms
builder
  .build({
    targets: Platform[platform].createTarget(),
    config: options
  })
  .then((result) => {
    console.log('----------------------------')
    console.log('Platform:', platform)
    console.log('Output:', JSON.stringify(result, null, 2))
  })
