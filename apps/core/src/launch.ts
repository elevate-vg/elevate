import { Platform } from 'libs/types'
import { createHash } from 'crypto'
import {
   append,
   compose,
   curry,
   mergeLeft,
   path,
   pipe,
   tail,
   tap,
   toString,
   trim,
} from 'libs/utils'
import { Context } from './context'
import * as stream from 'stream'
import { promisify } from 'util'
import { closeSync, createWriteStream, existsSync, mkdirSync, openSync, utimesSync } from 'fs'
import { join } from 'path'
import { ChildProcessWithoutNullStreams, spawn } from 'child_process'
import extractZip from 'extract-zip'

export type LaunchSettingsOptional = {
   fullscreen?: true
   activate?: true
}

export type LaunchSettings = {
   uri: string
   platform: Platform
} & LaunchSettingsOptional

export type Launch = {
   uri: string
   platform: Platform
}

// command to exit ("wait") on PID
// const cmd = isDarwin ?
//   `lsof -p ${grandParentPid} +r 1 &>/dev/null` :
//   `tail --pid=${grandParentPid} -f /dev/null`;

// prettier-ignore
export const activateDarwin = (pid: string) =>
   spawn('osascript', [
      '-e', 
      `tell application "System Events"
          set frontmost of the first process whose unix id is ${pid} to true
       end tell`
   ])

// prettier-ignore
export const activate = (pid: string) => {
   switch (process.platform) {
      case "darwin": {
         return activateDarwin(pid)
      }
      default: {
         console.error("Activate: Platform not supported")
      }
   }
}

export const command = curry((ctx: Context, args: string[]) => {
   ctx.logger.debug(`Running command: ${args.join(' ')}`)
   const cmd = spawn(args[0], tail(args))

   const preLog = pipe(toString, trim)
   const debug = pipe(preLog, ctx.logger.debug)
   const error = pipe(preLog, ctx.logger.error)
   const close = pipe(preLog, (msg) => `exit code: ${msg}`, ctx.logger.debug)
   const errorMessage = pipe(path(['message']), preLog, ctx.logger.error)

   cmd.stdout.on('data', debug)
   cmd.stderr.on('data', error)
   cmd.on('error', errorMessage)
   cmd.on('close', close)

   ctx.logger.debug(`PID: ${cmd.pid}`)

   return cmd
})

const finished = promisify(stream.finished)
const touchFile = (filename: string) => {
   const time = new Date()

   try {
      utimesSync(filename, time, time)
   } catch (err) {
      closeSync(openSync(filename, 'w'))
   }

   return filename
}

const tempName = (name: string) => `${createHash('md5').update(name).digest('hex')}`

const tempNameAtCache = curry((dir: string, uri: string) =>
   compose(
      (dir: string) => join(dir, tempName(uri)),
      tap(() => mkdirSync(dir, { recursive: true })),
   )(dir),
)

const getLocalUri = curry(async (ctx: Context, uri: string) => {
   // TODO: add FTP support
   if (uri.startsWith('http://') || uri.startsWith('https://')) {
      const localPath = tempNameAtCache(ctx.paths.cache, uri)

      if (!existsSync(localPath)) {
         await download(ctx, uri, localPath)
      }

      return localPath
   }

   return uri
})

const getRetroArchLibPath = curry(
   async (ctx: Context, platform: Platform): Promise<string | undefined> => {
      const platformLibraryMap = {
         [Platform.SUPER_NINTENDO_ENTERTAINMENT_SYSTEM as Platform]: {
            name: 'snes9x_libretro.dylib',
            uri: 'http://buildbot.libretro.com/nightly/apple/osx/x86_64/latest/snes9x_libretro.dylib.zip',
         },
         [Platform.GAME_BOY_ADVANCED as Platform]: {
            name: 'mgba_libretro.dylib',
            uri: 'http://buildbot.libretro.com/nightly/apple/osx/x86_64/latest/mgba_libretro.dylib.zip',
         },
      }

      try {
         const zip = await getLocalUri(ctx, platformLibraryMap[platform].uri)

         await extractZip(zip, {
            dir: ctx.paths.cache,
         })

         return join(ctx.paths.cache, platformLibraryMap[platform].name)
      } catch (error) {
         ctx.logger.warn(`Launcher not available for platform: ${platform}`)
      }
   },
)
export const launchSettingsDefaults: LaunchSettingsOptional = {
   fullscreen: true,
   activate: true,
}

const retroArch = curry(
   async (ctx: Context, launchConfig: LaunchSettings): Promise<ChildProcessWithoutNullStreams> => {
      const launchSettings = mergeLeft(launchSettingsDefaults, launchConfig)

      const line = compose((arr: string[]) => {
         if (launchSettings.fullscreen) {
            return append('--fullscreen', arr)
         }

         return arr
      })([
         // TODO: Cache RetroArch
         '/Applications/RetroArch.app/Contents/MacOS/RetroArch',
         '-L',
         await getRetroArchLibPath(ctx, launchConfig.platform),
         // '--bps="/Users/simonwjackson/Downloads/Super\ Mario\ World\ DX\ Special\ 14-1/Super\ Mario\ World\ DX\ Starring\ Luigi\ \(Special\).bps"',
         launchConfig.uri,
      ])

      const cmd = command(ctx, line)

      if (launchConfig.activate) activateDarwin(`${cmd.pid}`)

      return cmd
   },
)

// prettier-ignore
export const launch = curry(
   async (ctx: Context, obj: Launch):
   Promise<ChildProcessWithoutNullStreams | undefined> => {
      const uri = await getLocalUri(ctx, obj.uri)

      return retroArch(ctx, {
         uri,
         platform: obj.platform
      })
   })

// prettier-ignore
const download = curry(
   (ctx: Context, uri: string, name: string): 
   PromiseLike<string | void> => {
      const createFileWriter = (name: string) => compose(createWriteStream, touchFile)(name)
      const writer = createFileWriter(name)

      ctx.logger.http(`Downloading: ${uri}`)

      return ctx
         .axios({
            method: 'get',
            responseType: 'stream',
            url: uri,
         })
         .then(async (response) => {
            response.data.pipe(writer)
            return finished(writer)
         })
   }
)

export default launch
