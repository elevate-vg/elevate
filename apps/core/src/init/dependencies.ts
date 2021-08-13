import https from 'https'
import http from 'http'
import { Context } from '../context'
import { curry } from 'libs/utils'
import { chmodSync, createWriteStream } from 'fs'
import { dirname } from 'path'
import { touchDir } from '../utils'
import { DependencyList } from './dependencyList'

export type DownloadObject = {
   output: string
   url: string
   events?: DownloadEvents
}

export enum FileType {
   'EXE',
   'ZIP',
}

export type InitDownloadObject = {
   platform: NodeJS.Platform
   filetype: FileType
} & DownloadObject

export type DownloadEvents = {
   onFinish?: () => void
   onError?: (e: Error) => void
}

const downloadExe = curry(async (ctx: Context, obj: DownloadObject) =>
   download(ctx, obj).then((path) => {
      if (typeof path === 'string') chmodSync(path, 755)
      return path
   }),
)

const download = curry(async (ctx: Context, obj: DownloadObject) => {
   touchDir(dirname(obj.output))

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
      const writer = createWriteStream(obj.output)

      // prettier-ignore
      getProtocolModule(obj.url)
         .get(obj.url, (res) => {
            res.pipe(writer)
         })

      writer.on('finish', () => {
         writer.close()
         ctx.logger.verbose('Download complete: ' + obj.url)
         obj?.events?.onFinish && obj.events.onFinish()
         res(obj.output)
      })

      writer.on('error', (e) => {
         ctx.logger.error('Error: ' + e.message)
         obj?.events?.onError && obj.events.onError(e)
         rej(e)
      })
   })
})

export const setupDependencies = curry(async (ctx: Context, dependencyList: DependencyList) => {
   let level = 0
   return (
      dependencyList
         .map((group) => {
            return group.filter((obj) => obj.platform === ctx.platform)
         })
         // @ts-expect-error: Need to type reducer function
         .reduce((accumulatorPromise, group) => {
            return accumulatorPromise.then(async () => {
               ctx.logger.verbose(`Init: Downloading group ${level}`)
               const res = await Promise.all(group.map((obj) => downloadExe(ctx, obj)))
               ctx.logger.verbose(`Init: Downloading group ${level} complete`)
               level = level + 1
               return res
            })
         }, Promise.resolve())
   )
})
