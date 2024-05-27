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
  compression: 'normal',
  nsis: {
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: 'SIEG Pagamentos',
    deleteAppDataOnUninstall: true,
    artifactName: '${productName}-Setup-${version}.${ext}',
    installerIcon: '.output/public/icon.ico',
    uninstallerIcon: '.output/public/icon.ico',
    installerHeaderIcon: '.output/public/icon.ico',
    installerSidebar: '.output/public/logo-maior.bmp',
    uninstallerSidebar: '.output/public/logo-maior.bmp',
  },
  publish: [
    {
      provider: "github",
      owner: "Desenvolvimento-Sieg-AD",
      repo: "Demeter-APPV2",
      releaseType: "release"
    }
  ],

  removePackageScripts: true,
  nodeGypRebuild: false,
  buildDependenciesFromSource: false, // default: false
  directories: {
    output: '.output'
  },
  publish: {
    provider: 'github',
  },
  win: {
    artifactName: '${productName}-Setup-${version}.${ext}',
    icon: '.output/public/icon.ico',
    publish: [
      {

        repo: "Demeter-APPV2",
        provider: 'github',
        owner: 'Desenvolvimento-Sieg-AD',
        releaseType: 'release',
      }
    ],
    target: [
      {
        target: 'portable',
        arch: ['x64']
      },
      {
        target: 'nsis',
        arch: ['x64']
      }
    ]
  },
  portable: {
    artifactName: '${productName}-Portable-${version}.${ext}'
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
    config: options,
    // publish: 'always', // ? Config to publish the build
  })
  .then((result) => {
    console.log('----------------------------')
    console.log('Platform:', platform)
    console.log('Output:', JSON.stringify(result, null, 2))
  }).catch((error) => {
    console.error('Error:', error)
  })
