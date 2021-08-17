import { ChildProcessWithoutNullStreams } from 'child_process'

import { Context } from './context'
import { LaunchSettings, LaunchSettingsOptional, Platform } from 'libs/types'
import { cacheFile } from 'libs/utils/io'
import * as retroArchPlugin from 'plugins/retroarch'
import { command, CommandEvents } from 'libs/utils/runner'
import {
   curry,
   map,
   compose,
   applyOver,
   equals,
   find,
   path,
   prop,
   pipe,
   any,
   tryCatch,
} from 'libs/utils'
import { Launch } from 'libs/types/Plugin'

// command to exit ("wait") on PID
// const cmd = isDarwin ?
//   `lsof -p ${grandParentPid} +r 1 &>/dev/null` :
//   `tail --pid=${grandParentPid} -f /dev/null`;

export const launchSettingsDefaults: LaunchSettingsOptional = {
   fullscreen: true,
   activate: true,
}

// prettier-ignore
const injectEvents = (ctx: Context, launchSettings: LaunchSettings, events: CommandEvents) =>             
   compose(
      applyOver([ctx, launchSettings]),
      map(curry),
   )(events)

// TODO: rename this function
export const ensureLaunchFn = async (
   ctx: Context,
   launchSettings: LaunchSettings,
   launchFn: Launch,
): Promise<() => ChildProcessWithoutNullStreams> => {
   const launchReturn = await launchFn(ctx, launchSettings)

   if (Array.isArray(launchReturn)) {
      return () => {
         const { onError, onLaunch, onExit } = retroArchPlugin
         const events = injectEvents(
            ctx,
            launchSettings,
            // @ts-expect-error: Need a typing for partially aplied events
            { onExit, onError, onLaunch },
         )

         return command(ctx, launchReturn, events)
      }
   }

   return launchReturn
}

export type Launcher = (
   ctx: Context,
   launchObj: LaunchSettings,
) => Promise<ChildProcessWithoutNullStreams | undefined>

const getFirstLaunchFn = (platform: Platform): Launch => {
   const plugin = find(hasPlatform(platform), [retroArchPlugin])

   if (!plugin) throw new Error(`Platform not supported: ${platform}`)
   return plugin.launch
}
// HACK: dont try to cache when file is local (or uncachable, ex: steam://)
const uriAsLocalPath = (ctx: Context, uri: string) => cacheFile(ctx, uri)

export const launch: Launcher = async (ctx, launchSettings) => {
   const uri = await uriAsLocalPath(ctx, launchSettings.uri)
   // HACK: launcher selection should be passed in the launch settings
   const firstLaunchFn = getFirstLaunchFn(launchSettings.platform)
   const run = await ensureLaunchFn(ctx, { ...launchSettings, uri }, firstLaunchFn)

   return run()
}

const hasPlatform = (platform: Platform) => {
   return pipe(
      // @ts-expect-error: Ramda false positive
      prop('platformSupport'),
      any(equals(platform)),
   )
}

// Above function should map over plugins and (for now) return the first plugin that supports the platform
// Need a typing for partially aplied events (see above)
