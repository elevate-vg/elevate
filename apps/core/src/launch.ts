import { ChildProcessWithoutNullStreams } from 'child_process'

import { Context } from './context'
import { LaunchSettings, LaunchSettingsOptional, Platform } from 'libs/types'
import { cacheFile } from 'libs/utils/io'
import {
   launch as retroArchLaunch,
   onLaunch as onRetroArchLaunch,
   onExit as onRetroArchExit,
   onError as onRetroArchError,
} from 'plugins/retroarch'
import { command } from 'libs/utils/runner'
import { curry } from 'ramda'

// command to exit ("wait") on PID
// const cmd = isDarwin ?
//   `lsof -p ${grandParentPid} +r 1 &>/dev/null` :
//   `tail --pid=${grandParentPid} -f /dev/null`;

export const launchSettingsDefaults: LaunchSettingsOptional = {
   fullscreen: true,
   activate: true,
}

export type Launch = (
   ctx: Context,
   launchObj: LaunchSettings,
) => Promise<ChildProcessWithoutNullStreams | undefined>

export const launch: Launch = async (ctx, launchSettings) => {
   const uri = await cacheFile(ctx, launchSettings.uri)

   // HACK: Quick fix to achieve launching POC. This only supports RetroArch
   switch (launchSettings.platform) {
      case Platform.NINTENDO_ENTERTAINMENT_SYSTEM as Platform:
      case Platform.SUPER_NINTENDO_ENTERTAINMENT_SYSTEM as Platform:
      case Platform.GAME_BOY_ADVANCED as Platform: {
         const toLaunch = await retroArchLaunch(ctx, {
            ...launchSettings,
            uri,
         })

         const curriedEvents = Object.fromEntries(
            Object.entries({
               onLaunch: onRetroArchLaunch,
               onExit: onRetroArchExit,
               onError: onRetroArchError,
            }).map(([key, value]) => {
               return [key, curry(value)(ctx, launchSettings)]
            }),
         )

         if (Array.isArray(toLaunch)) {
            return command(ctx, toLaunch, curriedEvents)
         } else {
            return toLaunch()
         }
      }
   }
}
