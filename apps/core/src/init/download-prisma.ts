import type { Platform as PrismaPlatform } from '@prisma/get-platform'
import type { Context } from '../context'
import { enginesVersion } from '@prisma/engines'
import { download } from '@prisma/fetch-engine'
import { join } from 'path'
import { mkdirSync, existsSync } from 'fs'

// prettier-ignore
const buildBinaryTargets = 
   (platform: NodeJS.Platform): PrismaPlatform[] => {
   switch (platform) {
      case 'win32': {
         return ['windows']
      }
      case 'darwin': {
         return ['darwin']
      }
      default:
         return []
   }
}

const shouldDownload =
   (root: string) =>
   (platform: NodeJS.Platform): boolean => {
      switch (platform) {
         case 'win32': {
            return (
               !existsSync(join(root, 'query-engine-windows.exe')) ||
               !existsSync(join(root, 'migration-engine-windows.exe'))
            )
         }
         case 'darwin': {
            return (
               !existsSync(join(root, 'query-engine-darwin')) ||
               !existsSync(join(root, 'migration-engine-darwin'))
            )
         }
         default:
            return false
      }
   }

// prettier-ignore
const main = 
   (ctx: Context) => 
   async (platform: NodeJS.Platform) => {
   try {
      const binDir = join(ctx.paths.data, 'bin', 'prisma')
      mkdirSync(binDir, { recursive: true })

      if (shouldDownload(binDir)(platform)) {
         ctx.logger.http('Prisma: Downloading')
         await download({
            progressCb: (num) => {
               num
            },
            binaryTargets: buildBinaryTargets(process.platform),
            binaries: {
               'query-engine': binDir,
               'migration-engine': binDir,
            },
            version: enginesVersion,
         })
         ctx.logger.http('Prisma: Download complete')
      }
   } catch (e) {
      ctx.logger.error(  e)
   }
}

export default main
