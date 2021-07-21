import type { Platform as PrismaPlatform } from '@prisma/get-platform'
import { enginesVersion } from '@prisma/engines'
import { download } from '@prisma/fetch-engine'
import { existsSync } from 'fs'
import { rootDir } from '../constants'

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

const shouldDownload = (platform: NodeJS.Platform): boolean => {
   switch (platform) {
      case 'win32': {
         return (
            !existsSync(rootDir('bin', 'query-engine-windows.exe')) ||
            !existsSync(rootDir('bin', 'migration-engine-windows.exe'))
         )
      }
      case 'darwin': {
         return (
            !existsSync(rootDir('bin', 'query-engine-darwin')) ||
            !existsSync(rootDir('bin', 'migration-engine-darwin'))
         )
      }
      default:
         return false
   }
}

const main = async (platform: NodeJS.Platform) => {
   try {
      if (shouldDownload(platform)) {
         console.log('Downloading prisma..')
         await download({
            progressCb: (num) => {
               num
            },
            binaryTargets: buildBinaryTargets(process.platform),
            binaries: {
               'query-engine': __dirname,
               'migration-engine': __dirname,
            },
            version: enginesVersion,
         })
         console.log('..complete')
      }
   } catch (e) {
      console.error(e)
   }
}

export default main
