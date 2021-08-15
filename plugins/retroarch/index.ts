import { join } from 'path'
import { existsSync } from 'fs'
import { LaunchSettingsOptional, Plugin } from 'libs/types'
import { compose, mergeLeft, whenTrue } from 'libs/utils'
import { command } from 'libs/utils/runner'
import { activate } from 'libs/utils/activate'
import { appendWhenTrue, FileType } from 'apps/core/src/utils'
import { launchSettingsDefaults } from 'apps/core/src/launch'
import { getRetroArchExe, getRetroArchLibPath } from './utils'

export const meta: Plugin.Meta = {
   namespace: '@simonwjackson',
   name: 'retroarch',
   version: 'latest',
}

export const launchSettingsPluginDefaults: LaunchSettingsOptional = {
   fullscreen: true,
   activate: true,
}

export const launch: Plugin.Launch = async (ctx, launchConfig) => {
   const launchSettings = mergeLeft(launchSettingsDefaults, launchConfig)

   // prettier-ignore
   return compose(
         command(ctx),
         appendWhenTrue(launchSettings?.fullscreen || false, '--fullscreen')
      )([
         getRetroArchExe(ctx),
         '-L',
         await getRetroArchLibPath(ctx, launchConfig.platform),
         launchConfig.uri
      ])
}

export const onLaunch: Plugin.OnLaunch = (_, launchConfig, command) => {
   whenTrue(() => activate(`${command.pid}`), launchConfig.activate)
}

// TODO: Add patch support
// '--bps="/Users/simonwjackson/Downloads/Super\ Mario\ World\ DX\ Special\ 14-1/Super\ Mario\ World\ DX\ Starring\ Luigi\ \(Special\).bps"',

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
