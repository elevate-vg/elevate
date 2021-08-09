import { Context } from 'apps/core/src/context'
import { join } from 'path'
import { ChildProcessWithoutNullStreams } from 'child_process'
import extractZip from 'extract-zip'

import { LaunchSettings, LaunchSettingsOptional, Platform } from 'libs/types'
import { curry, equals, compose as compose, mergeLeft, when, whenTrue } from 'libs/utils'
import { cacheFile } from 'libs/utils/io'
import { command } from 'libs/utils/runner'
import { activate } from 'libs/utils/activate'
import { appendWhenTrue } from 'apps/core/src/utils'
import { launchSettingsDefaults } from 'apps/core/src/launch'

export const launchSettingsPluginDefaults: LaunchSettingsOptional = {
   fullscreen: true,
   activate: true,
}

export const buildLibraryObject = (platform: NodeJS.Platform) => (name: string) => {
   const platformMap = (platform: NodeJS.Platform) => {
      switch (platform) {
         case 'win32':
            return 'windows'
         default:
            return platform
      }
   }

   return {
      name,
      uri: `https://buildbot.libretro.com/nightly/${platformMap(
         platform,
      )}/x86_64/latest/${name}.zip`,
   }
}

const getRetroArchLibPath = curry(
   async (ctx: Context, platform: Platform): Promise<string | undefined> => {
      const lib = buildLibraryObject(process.platform)
      const platformLibraryMap = {
         [Platform.SUPER_NINTENDO_ENTERTAINMENT_SYSTEM as Platform]: lib('snes9x_libretro.dylib'),
         [Platform.GAME_BOY_ADVANCED as Platform]: lib('mgba_libretro.dylib'),
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

export const launch = curry(
   async (ctx: Context, launchConfig: LaunchSettings): Promise<ChildProcessWithoutNullStreams> => {
      const launchSettings = mergeLeft(launchSettingsDefaults, launchConfig)

      // TODO: Cache RetroArch
      const retroArchCommands = [
         'C:\\Users\\simonwjackson\\Downloads\\RetroArch\\retroarch.exe',
         '-L',
         (await getRetroArchLibPath(ctx, launchConfig.platform)) || '',
         launchConfig.uri || '',
      ]

      // prettier-ignore
      return compose(
         command(ctx),
         appendWhenTrue(launchSettings?.fullscreen || false, '--fullscreen')
      )(retroArchCommands)
   },
)

// prettier-ignore
export const onLaunch = curry((
   _,
   launchConfig: LaunchSettings,
   command: ChildProcessWithoutNullStreams
) => {
   whenTrue(() => activate(`${command.pid}`), launchConfig.activate)
})

// TODO: Add patch support
// '--bps="/Users/simonwjackson/Downloads/Super\ Mario\ World\ DX\ Special\ 14-1/Super\ Mario\ World\ DX\ Starring\ Luigi\ \(Special\).bps"',
