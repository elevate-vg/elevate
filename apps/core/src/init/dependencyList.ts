import { existsSync, rmSync } from 'fs'
import { join } from 'path'
import { Context } from 'vm'
import { FileType, InitDownloadObject, renameSync } from '../utils'

export type DependencyList = [
   Base: InitDownloadObject[],
   Core: InitDownloadObject[],
   Plugins: InitDownloadObject[],
]

export default (ctx: Context) => {
   const sevenZip = [
      {
         platform: 'darwin',
         filetype: FileType.EXE,
         url: 'https://raw.githubusercontent.com/develar/7zip-bin/master/mac/x64/7za',
         output: join(ctx.paths.cache, 'utils', '7za'),
      },
      {
         platform: 'win32',
         filetype: FileType.EXE,
         url: 'https://raw.githubusercontent.com/develar/7zip-bin/master/win/x64/7za.exe',
         output: join(ctx.paths.cache, 'utils', '7za.exe'),
      },
   ] as InitDownloadObject[]

   // url: `https://npm.taobao.org/mirrors/electron/13.1.5/electron-v13.1.5-win32-x64.zip`,

   const chromium = [
      {
         platform: 'win32',
         filetype: FileType.ZIP,
         url: 'https://storage.googleapis.com/chromium-browser-snapshots/Win/884014/chrome-win.zip',
         output: join(ctx.paths.cache, 'utils', 'chrome'),
         isReady: () => existsSync(join(ctx.paths.cache, 'utils', 'chromium', 'chrome.exe')),
         events: {
            onFinish: (path) => {
               renameSync(join(path, 'chromium'), join(ctx.paths.cache, 'utils', 'chromium'))
               rmSync(join(path, 'chrome-win'), { recursive: true, force: true })
            },
         },
      },
      {
         platform: 'darwin',
         filetype: FileType.ZIP,
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

   return [[...sevenZip], [...chromium], []] as DependencyList
}
