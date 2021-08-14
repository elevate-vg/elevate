import { extractFull } from 'node-7z'
import https from 'https'
import http from 'http'
import { Context } from './context'
import { chmodSync, createWriteStream, existsSync, renameSync as fsRenameSync } from 'fs'
import { append, applyTo, compose, curry, equals, juxt, when, __ } from 'libs/utils'
import { mkdirSync } from 'fs'
import { join } from 'path'
import { tempName } from 'libs/utils/io'

// prettier-ignore
export const initFns = 
   (ctx: Context) =>
   (platform: NodeJS.Platform) =>
   (fns: any[]) =>
   compose(
      applyTo(platform),
      juxt,
      juxt(fns),
   )(ctx)

export type environment = 'production' | 'development'

export const isFunction = <T>(fn: T) => {
   if (typeof fn === 'function') {
      return true
   }

   return false
}

export const whenProduction = (fn: () => void) => {
   switch (process.env.NODE_ENV as environment) {
      case 'production': {
         return fn()
      }
      default: {
         return
      }
   }
}

// prettier-ignore
export const appendWhenTrue = curry((
    bool: boolean | undefined,
    toAppend: string, 
    arr: string[]) =>
    when(
       () => equals(true, bool), 
       append(toAppend), 
       arr
    ),
)

export const touchDir = (dir: string) => {
   try {
      mkdirSync(dir, { recursive: true })
   } catch (e) {
      // TODO: Better fail support, ex: permissions errors
   }

   return dir
}

export type DownloadObject = {
   output: string
   url: string
   events?: DownloadEvents
}

export enum FileType {
   'EXECUTABLE',
   'ARCHIVE',
}

export type InitDownloadObject = {
   platform: NodeJS.Platform
   filetype: FileType
   // TODO: rename isReady to something better
   isReady: (path: string) => boolean
} & DownloadObject

export type DownloadEvents = {
   onTransferComplete?: (path: string) => void
   onFinish?: (path: string) => void
   onError?: (e: Error) => void
}

export const renameSync = curry((from: string, to: string) => fsRenameSync(from, to))

export const downloadExe = curry(async (ctx: Context, obj: InitDownloadObject) => {
   const path = await download(ctx, obj)
   if (obj.isReady(path)) return obj.output

   chmodSync(path, 0o755)
   renameSync(path, obj.output)

   return obj.output
})

// TODO: Rename downloadArchive... This function both downloads and unarchives
export const downloadArchive = curry(async (ctx: Context, obj: InitDownloadObject) =>
   download(ctx, obj).then((path) => {
      if (obj.isReady(path)) return Promise.resolve(obj.output)

      return new Promise((res, rej) => {
         extractFull(path, obj.output, {
            $bin: join(ctx.paths.cache, 'utils', `7za${ctx.platform === 'win32' ? '.exe' : ''}`),
         })
            .on('end', () => {
               if (typeof obj.events?.onFinish === 'function') {
                  obj.events.onFinish(obj.output)
               }

               res(obj.output)
            })
            .on('error', (e) => rej(e))
      })
   }),
)

// TODO: rename download to something more generic
//   (dont conflict with platform/type specific) HOC downloader functions
export const download = curry(async (ctx: Context, obj: DownloadObject): Promise<string> => {
   touchDir(ctx.paths.temp)
   const tempPath = join(ctx.paths.temp, tempName(obj.url))

   const getProtocolModule = (url: string) => {
      const urlObj = new URL(url)

      switch (urlObj.protocol) {
         case 'http:': {
            return http
         }
         case 'https:': {
            return https
         }
         default: {
            throw new Error('protocol not supported')
         }
      }
   }

   return new Promise((res, rej) => {
      // HACK: Nieve cache check, will fail if DL is incomplete
      if (existsSync(tempPath)) return res(tempPath)

      const writer = createWriteStream(tempPath)

      // prettier-ignore
      getProtocolModule(obj.url)
         .get(obj.url, (res) => {
            res.pipe(writer)
         })

      writer.on('finish', () => {
         writer.close()
         ctx.logger.verbose('Download complete: ' + obj.url)
         obj?.events?.onTransferComplete && obj.events.onTransferComplete(tempPath)
         res(tempPath)
      })

      writer.on('error', (e) => {
         ctx.logger.error('Error: ' + e.message)
         obj?.events?.onError && obj.events.onError(e)
         rej(e)
      })
   })
})

// TODO: rename downloadType to something a bit more idiomatic
export const downloadType = curry(async (ctx: Context, obj: InitDownloadObject) => {
   switch (obj.filetype) {
      case FileType.EXECUTABLE: {
         return downloadExe(ctx, obj)
      }
      case FileType.ARCHIVE: {
         return downloadArchive(ctx, obj)
      }
      default: {
         return download(ctx, obj)
      }
   }
})
