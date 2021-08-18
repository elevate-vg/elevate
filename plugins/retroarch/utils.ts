import { Context } from 'apps/core/src/context'
import { join } from 'path'
import extractZip from 'extract-zip'

import { Platform } from 'libs/types'
import { curry, cond, equals, T } from 'libs/utils'
import { cacheFile } from 'libs/utils/io'

export const buildLibraryObject = (platform: NodeJS.Platform) => (name: string) => {
   const libName = (platform: NodeJS.Platform) => {
      switch (platform) {
         case 'darwin':
            return name + '_libretro.dylib'

         case 'win32':
            return name + '_libretro.dll'

         default:
            return name
      }
   }

   const platformMap = (platform: NodeJS.Platform) => {
      switch (platform) {
         case 'win32':
            return 'windows'
         case 'darwin':
            return 'apple/osx'

         default:
            return platform
      }
   }

   return {
      name: libName(platform),
      uri: `https://buildbot.libretro.com/nightly/${platformMap(platform)}/x86_64/latest/${libName(
         platform,
      )}.zip`,
   }
}

export const getRetroArchExe = (ctx: Context) =>
   cond([
      [
         equals('win32'),
         () => join(ctx.paths.data, 'launchers', 'retroarch', 'RetroArch-Win64', 'retroarch.exe'),
      ],
      [
         equals('darwin'),
         () =>
            join(
               ctx.paths.data,
               'launchers',
               'retroarch',
               'RetroArch.app',
               'Contents',
               'MacOS',
               'RetroArch',
            ),
      ],
      [
         T,
         (platform) => {
            throw new Error(`${platform} not supported`)
         },
      ],
      // @ts-expect-error Ramda asserts a false positive here
   ])(ctx.platform)

// TODO: Allow user to choose library
export const getRetroArchLibPath = curry(
   async (ctx: Context, platform: Platform): Promise<string | undefined> => {
      const lib = buildLibraryObject(process.platform)
      const platformLibraryMap = {
         [Platform.SUPER_NINTENDO_ENTERTAINMENT_SYSTEM as Platform]: lib('snes9x'),
         [Platform.GAME_BOY_ADVANCED as Platform]: lib('mgba'),
      }

      try {
         const { uri, name } = platformLibraryMap[platform]
         const zip = await cacheFile(ctx, uri)

         await extractZip(zip, {
            dir: ctx.paths.cache,
         })

         return join(ctx.paths.cache, name)
      } catch (error) {
         ctx.logger.warn(`Launcher not available for platform: ${platform}`)
      }
   },
)
