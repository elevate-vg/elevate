import { existsSync, rmSync } from 'fs'
import { join } from 'path'
import { Context } from 'vm'
import { FileType, InitDownloadObject, renameSync } from '../utils'

export type DependencyList = [
   Base: InitDownloadObject[],
   Core: InitDownloadObject[],
   Plugins: InitDownloadObject[],
]

// TODO: Find a way to advertize entrypoint(s) (exe, etc)
export default (ctx: Context) => {
   const sevenZip = [
      {
         platform: 'darwin',
         filetype: FileType.EXECUTABLE,
         url: 'https://raw.githubusercontent.com/develar/7zip-bin/master/mac/x64/7za',
         output: join(ctx.paths.cache, 'utils', '7za'),
         isReady: () => existsSync(join(ctx.paths.cache, 'utils', '7za')),
      },
      {
         platform: 'win32',
         filetype: FileType.EXECUTABLE,
         url: 'https://raw.githubusercontent.com/develar/7zip-bin/master/win/x64/7za.exe',
         output: join(ctx.paths.cache, 'utils', '7za.exe'),
         isReady: () => existsSync(join(ctx.paths.cache, 'utils', '7za.exe')),
      },
   ] as InitDownloadObject[]

   const electron = [
      {
         platform: 'win32',
         filetype: FileType.ARCHIVE,
         url: `https://npm.taobao.org/mirrors/electron/13.1.5/electron-v13.1.5-win32-x64.zip`,
         output: join(ctx.paths.cache, 'utils', 'electron-mac'),
         isReady: () => existsSync(join(ctx.paths.cache, 'utils', 'electron/electron.exe')),
         events: {
            onFinish: (path) => {
               // TODO: Copy base electron template (mac)
               // copySync(
               //    join(__dirname, `./assets/electron`),
               //    join(containerDir, 'Electron.app/Contents/Resources/app'),
               // )
            },
         },
      },
      {
         platform: 'darwin',
         filetype: FileType.ARCHIVE,
         url: `https://cdn.npm.taobao.org/dist/electron/13.1.5/electron-v13.1.5-darwin-x64.zip`,
         output: join(ctx.paths.cache, 'utils', 'electron-mac'),
         isReady: () => existsSync(join(ctx.paths.cache, 'utils', 'Electron.app')),
         events: {
            onFinish: (path) => {
               renameSync(
                  join(path, 'Electron.app'),
                  join(ctx.paths.cache, 'utils', 'Electron.app'),
               )
               rmSync(join(path, 'electron-mac'), { recursive: true, force: true })
               // TODO: Copy base electron template (mac)
               // const appTemplateFrom = join(__dirname, `./assets/electron`)
               // const appTemplateDest = join(containerDir, 'Electron.app/Contents/Resources/app')
            },
         },
      },
   ] as InitDownloadObject[]

   const chromium = [
      {
         platform: 'win32',
         filetype: FileType.ARCHIVE,
         url: 'https://storage.googleapis.com/chromium-browser-snapshots/Win/884014/chrome-win.zip',
         output: join(ctx.paths.cache, 'utils', 'chrome'),
         isReady: () => existsSync(join(ctx.paths.cache, 'utils', 'chromium', 'chrome.exe')),
      },
      {
         platform: 'darwin',
         filetype: FileType.ARCHIVE,
         url: `https://storage.googleapis.com/chromium-browser-snapshots/Mac/884014/chrome-mac.zip`,
         output: join(ctx.paths.cache, 'utils', 'chrome'),
         isReady: () => existsSync(join(ctx.paths.cache, 'utils', 'Chromium.app')),
         events: {
            onFinish: (path) => {
               renameSync(
                  join(path, 'chrome-mac/Chromium.app'),
                  join(ctx.paths.cache, 'utils', 'Chromium.app'),
               )
               rmSync(join(path, 'chrome-mac'), { recursive: true, force: true })
            },
         },
      },
   ] as InitDownloadObject[]

   return [[...sevenZip], [...chromium, ...electron], []] as DependencyList
}
