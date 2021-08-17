import { join } from 'path'
import { existsSync } from 'fs'
import { LaunchSettingsOptional, Platform, Plugin } from 'libs/types'
import { compose, mergeLeft, whenTrue } from 'libs/utils'
import { activate } from 'libs/utils/activate'
import { appendWhenTrue, FileType } from 'apps/core/src/utils'
import { launchSettingsDefaults } from 'apps/core/src/launch'
import { getRetroArchExe, getRetroArchLibPath } from './utils'

/*********************************
 * Meta Info
 ********************************/

export const meta: Plugin.Meta = {
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
 * Launcher
 ********************************/

export const launch: Plugin.Launch = async (ctx, launchConfig) => {
   const launchSettings = mergeLeft(launchSettingsDefaults, launchConfig)

   // prettier-ignore
   return compose(
      appendWhenTrue(launchSettings?.fullscreen || false, '--fullscreen')
   )([
      getRetroArchExe(ctx),
      '-L',
      await getRetroArchLibPath(ctx, launchConfig.platform),
      launchConfig.uri
   ])
}

/*********************************
 * Launcher / Events
 ********************************/

export const onLaunch: Plugin.OnLaunch = (_, config, command) => {
   whenTrue(() => activate(`${command.pid}`), config.activate)
}

export const onError: Plugin.OnError = (_, __, message) => {
   console.log('error', message)
}

export const onExit: Plugin.OnExit = (_, __, code) => {
   console.log('code', code)
}

/*********************************
 * Dependencies
 ********************************/

export const dependencies: Plugin.Dependency[] = [
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
      isReady: () => existsSync(join(ctx.paths.data, 'launchers', 'retroarch', 'retroarch.exe')),
   }),
]

// TODO: Add patch support
// '--bps="/Users/simonwjackson/Downloads/Super\ Mario\ World\ DX\ Special\ 14-1/Super\ Mario\ World\ DX\ Starring\ Luigi\ \(Special\).bps"',
