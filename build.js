// eslint-disable-next-line @typescript-eslint/no-var-requires
const builder = require('electron-builder')
const Platform = builder.Platform

/**
 * @type {import('electron-builder').Configuration}
 */
const options = {
  appId: 'com.sieg.pagamentos',
  productName: 'SIEG Pagamentos',
  compression: 'maximum',
  removePackageScripts: true,
  nodeGypRebuild: false,
  buildDependenciesFromSource: false,
  directories: {
    output: '.output'
  },
  win: {
    artifactName: '${productName}-Setup-${version}.${ext}',
    // icon: 'public/favicon.ico',
    target: [
      {
        target: 'portable',
        arch: ['x64', 'ia32']
      },
      {
        target: 'nsis',
        arch: ['x64', 'ia32']
      }
    ]
  },
  portable: {
    artifactName: '${productName}-Portable-${version}.${ext}'
  },
  linux: {
    maintainer: 'Your Name',
    desktop: {
      StartupNotify: 'false',
      Encoding: 'UTF-8',
      MimeType: 'x-scheme-handler/deeplink'
    },
    target: ['AppImage', 'rpm', 'deb']
  }
}

const platform = 'WINDOWS'

builder.build({
  targets: Platform[platform].createTarget(),
  config: options
}).then((result) => {
  console.log('----------------------------')
  console.log('Platform:', platform)
  console.log('Output:', JSON.stringify(result, null, 2))
})
