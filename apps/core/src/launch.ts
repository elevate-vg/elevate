import { ChildProcessWithoutNullStreams } from 'child_process'

import { Context } from './context'
import { LaunchSettings, LaunchSettingsOptional, Platform } from 'libs/types'
import { cacheFile } from 'libs/utils/io'
import { command, CommandEvents } from 'libs/utils/runner'
import {
   curry,
   map,
   compose,
   applyOver,
   equals,
   prop,
   pipe,
   any,
   ifElse,
   concat,
   is,
   appendTo,
} from 'libs/utils'
import { Launcher, Plugin, SimpleLauncherObject, MyNewLaunchObj } from 'libs/types/Plugin'

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

const hasProp =
   <T>(prop: string) =>
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   (obj: any): obj is T =>
      obj[prop] !== undefined

// TODO: rename this function
export const ensureLaunchFn = async (
   ctx: Context,
   launchSettings: LaunchSettings,
   launch: MyNewLaunchObj,
): Promise<() => ChildProcessWithoutNullStreams> => {
   if (!launch) throw new Error(`Launcher nont implimented`)

   const launchReturn = await launch(ctx, launchSettings)

   if (hasProp<SimpleLauncherObject>('command')(launchReturn)) {
      return () => {
         const { onError, onLaunch, onExit, command: launcherCommand } = launchReturn
         const events = injectEvents(ctx, launchSettings, { onExit, onError, onLaunch })

         return command(ctx, launcherCommand, events)
      }
   }

   return launchReturn
}

const getFirstCompatablePlugin = (plugins: Plugin[], platform: Platform): MyNewLaunchObj => {
   const launcher = plugins
      .map((plugin) => plugin.launchers)
      .filter((launchers): launchers is Launcher | Launcher[] => !!launchers)
      .reduce<Launcher[]>(
         (acc, cur) =>
            ifElse(
               // prettier-ignore
               is(Array),
               concat(acc),
               appendTo(acc),
            )(cur),
         [],
      )
      .find(hasPlatform(platform))

   if (!launcher?.launch) throw new Error(`Platform not supported: ${platform}`)

   return launcher.launch
}

// HACK: dont try to cache when file is local (or uncachable, ex: steam://)
const uriAsLocalPath = (ctx: Context, uri: string) => cacheFile(ctx, uri)

type LaunchFn = (
   ctx: Context,
   plugins: Plugin[],
   launchObj: LaunchSettings,
) => Promise<ChildProcessWithoutNullStreams | undefined>

export const launch: LaunchFn = async (ctx, plugins, settings) => {
   const uri = await uriAsLocalPath(ctx, settings.uri)
   // HACK: launcher selection should be passed in the launch settings
   const plugin = getFirstCompatablePlugin(plugins, settings.platform)
   const run = await ensureLaunchFn(ctx, { ...settings, uri }, plugin)

   return run()
}

// prettier-ignore
const hasPlatform = (platform: Platform) => {
   return pipe(
      // @ts-expect-error: Ramda false positive
      prop('platforms'),
      any(equals(platform)),
   )
}
