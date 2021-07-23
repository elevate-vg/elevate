// import type { Platform as PrismaPlatform } from '@prisma/get-platform'
import type { Context } from '../context'
// import { enginesVersion } from '@prisma/engines'
// import { download } from '@prisma/fetch-engine'
import { join } from 'path'
// import {
//    // mkdirSync,
//    existsSync,
// } from 'fs'

import { spawn } from 'child_process'
import { whenProduction } from '../utils'

// const buildBinaryTargets =
//    (platform: NodeJS.Platform): PrismaPlatform[] => {
//    switch (platform) {
//       case 'win32': {
//          return ['windows']
//       }
//       case 'darwin': {
//          return ['darwin']
//       }
//       default:
//          return []
//    }
// }

// const shouldDownload =
//    (root: string) =>
//    (platform: NodeJS.Platform): boolean => {
//       switch (platform) {
//          case 'win32': {
//             return (
//                !existsSync(join(root, 'query-engine-windows.exe')) ||
//                !existsSync(join(root, 'migration-engine-windows.exe'))
//             )
//          }
//          case 'darwin': {
//             return (
//                !existsSync(join(root, 'query-engine-darwin')) ||
//                !existsSync(join(root, 'migration-engine-darwin'))
//             )
//          }
//          default:
//             return false
//       }
//    }

const main = (ctx: Context) => async () => {
   try {
      // HACK: This forces a db upgrade.
      // Potential data loss.
      whenProduction(() => {
         ctx.logger.info('Database migration starting')
         const prismaForceMigrate = spawn(
            join(__dirname, 'node'),
            //  '/Users/simonwjackson/.nvm/versions/node/v14.16.0/bin/node',
            [
               // '/private/tmp/elevate-v1.0.0-darwin-x64/bin/prisma/prisma.js',
               join(__dirname, 'bin/prisma/prisma.js'),
               'db',
               'push',
               '--schema',
               join(__dirname, 'schema.prisma'),
               // '/private/tmp/elevate-v1.0.0-darwin-x64/schema.prisma',
               '--skip-generate',
            ],
            {
               env: {
                  DATABASE_URL: `file:${join(ctx.paths.data, 'elevate.db')}`,
               },
               //    shell: true,
            },
         )

         prismaForceMigrate.on('close', (code) => {
            if (code === 0) {
               ctx.logger.info('Database migration (forced) successful')
            } else {
               ctx.logger.error(`Database migration (forced) failed: Error code ${code}`)
            }
         })

         prismaForceMigrate.stdout.on('data', (data) => {
            const trimmed = `${data}`.trim()
            if (trimmed) ctx.logger.verbose(trimmed)
         })

         prismaForceMigrate.stderr.on('data', (data) => {
            const trimmed = `${data}`.trim()
            if (trimmed) ctx.logger.error(trimmed)
         })

         prismaForceMigrate.on('error', (error) => {
            const trimmed = `${error.message}`.trim()
            if (trimmed) ctx.logger.error(trimmed)
         })
      })

      // TODO: revive this code when prisma has an API to do migrations
      // const binDir = join(ctx.paths.data, 'bin', 'prisma')
      // mkdirSync(binDir, { recursive: true })

      // if (shouldDownload(binDir)(platform)) {
      //    ctx.logger.http('Prisma: Downloading')
      //    await download({
      //       progressCb: (num) => {
      //          num
      //       },
      //       binaryTargets: buildBinaryTargets(process.platform),
      //       binaries: {
      //          'query-engine': binDir,
      //          'migration-engine': binDir,
      //       },
      //       version: enginesVersion,
      //    })
      //    ctx.logger.http('Prisma: Download complete')
      // }
   } catch (e) {
      ctx.logger.error(e)
   }
}

export default main
