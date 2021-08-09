import { ChildProcessWithoutNullStreams } from 'child_process'

import { Context } from './context'
import { Launch, LaunchSettingsOptional, Platform } from 'libs/types'
import { curry } from 'libs/utils'
import { cacheFile } from 'libs/utils/io'
import { launch as retroArchLaunch, onLaunch as onRetroArchLaunch } from 'plugins/retroarch'

// command to exit ("wait") on PID
// const cmd = isDarwin ?
//   `lsof -p ${grandParentPid} +r 1 &>/dev/null` :
//   `tail --pid=${grandParentPid} -f /dev/null`;

export const launchSettingsDefaults: LaunchSettingsOptional = {
   fullscreen: true,
   activate: true,
}

export const launch = curry(
   async (ctx: Context, launchObj: Launch): Promise<ChildProcessWithoutNullStreams | undefined> => {
      const uri = await cacheFile(ctx, launchObj.uri)

      // HACK: Quick fix to achieve launching POC. This only supports RetroArch
      switch (launchObj.platform) {
         case Platform.SUPER_NINTENDO_ENTERTAINMENT_SYSTEM as Platform:
         case Platform.GAME_BOY_ADVANCED as Platform: {
            const theProcess = await retroArchLaunch(ctx, {
               ...launchObj,
               uri,
            })

            ctx.logger.info(`onLauch callback: ${'RetroArch'}`)
            // TODO: Return something here
            onRetroArchLaunch(ctx, launchObj, theProcess)

            return theProcess
         }
      }
   },
)
