import { join } from 'path'
import { Context } from 'vm'
import { FileType, InitDownloadObject } from './dependencies'

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

   return [[...sevenZip], [], []] as DependencyList
}
