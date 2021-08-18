import { join } from 'path'
import { existsSync } from 'fs'
import { Architecture, LaunchSettingsOptional, Platform } from 'libs/types'
import { compose, mergeLeft, whenTrue } from 'libs/utils'
import { activate } from 'libs/utils/activate'
import { appendWhenTrue, FileType } from 'apps/core/src/utils'
import { launchSettingsDefaults } from 'apps/core/src/launch'
import { getRetroArchExe, getRetroArchLibPath } from './utils'
import { LaunchCommand, Plugin } from 'libs/types/Plugin'

/*********************************
 * Meta Info
 ********************************/

export const meta: Plugin['meta'] = {
   namespace: '@simonwjackson',
   name: 'retroarch',
   version: 'latest',
}

export const launchSettingsPluginDefaults: LaunchSettingsOptional = {
   fullscreen: true,
   activate: true,
}

/*********************************
 * Platform Support
 ********************************/

export const platformSupport: Platform[] = [
   Platform.GAME_BOY_ADVANCED,
   Platform.SUPER_NINTENDO_ENTERTAINMENT_SYSTEM,
]

/*********************************
 * Launcher(s)
 ********************************/
export const launchers: Plugin['launchers'] = {
   name: 'retroarch',
   version: '1.9.7',
   platforms: [Platform.GAME_BOY_ADVANCED, Platform.SUPER_NINTENDO_ENTERTAINMENT_SYSTEM],
   os: ['win32', 'darwin'],
   arch: Architecture.x64,
   launch: async (ctx, config) => {
      const launchSettings = mergeLeft(launchSettingsDefaults, config)
      const command: LaunchCommand = compose(
         appendWhenTrue(launchSettings?.fullscreen || false, '--fullscreen'),
      )([getRetroArchExe(ctx), '-L', await getRetroArchLibPath(ctx, config.platform), config.uri])

      return {
         command,

         /*********************************
          * Launcher / Events
          ********************************/

         onLaunch: (command) => {
            whenTrue(() => activate(`${command.pid}`), config.activate)
         },
         onError: (message) => {
            ctx.logger.error('RetroArch:' + message)
         },
         onExit: (code) => {
            ctx.logger.debug('RetroArch exit:' + code)
         },
      }
   },
}
/*********************************
 * Dependencies
 ********************************/

export const dependencies: Plugin['dependencies'] = [
   (ctx) => ({
      platform: 'darwin',
      filetype: FileType.ARCHIVE,
      url: `https://github.com/elevate-vg/elevate/releases/download/assets/RetroArch-darwin-x64-v1.9.7.zip`,
      output: join(ctx.paths.data, 'launchers', 'retroarch'),
      isReady: () => existsSync(join(ctx.paths.data, 'launchers', 'RetroArch.app')),
   }),
   (ctx) => ({
      platform: 'win32',
      filetype: FileType.ARCHIVE,
      url: `https://buildbot.libretro.com/stable/1.9.7/windows/x86_64/RetroArch.7z`,
      output: join(ctx.paths.data, 'launchers', 'retroarch'),
      isReady: () =>
         existsSync(
            join(ctx.paths.data, 'launchers', 'retroarch', 'RetroArch-Win64', 'retroarch.exe'),
         ),
   }),
]

// TODO: Add patch support
// '--bps="/Users/simonwjackson/Downloads/Super\ Mario\ World\ DX\ Special\ 14-1/Super\ Mario\ World\ DX\ Starring\ Luigi\ \(Special\).bps"',
