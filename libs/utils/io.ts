import { tap, curry, compose } from './index'
import { join } from 'path'
import { createHash } from 'crypto'
import fs, {
   openSync,
   createWriteStream,
   existsSync,
   mkdirSync,
   utimesSync,
   closeSync,
   promises as fsP,
} from 'fs'
import { promisify } from 'util'
import * as stream from 'stream'
import { Context } from 'apps/core/src/context'

export const tempName = (name: string) => `${createHash('md5').update(name).digest('hex')}`

export const tempNameAtCache = curry((dir: string, uri: string) =>
   compose(
      (dir: string) => join(dir, tempName(uri)),
      tap(() => mkdirSync(dir, { recursive: true })),
   )(dir),
)

export const cacheFile = curry(async (ctx: Context, uri: string) => {
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

// prettier-ignore
export const download = curry(
   async (ctx: Context, uri: string, name: string): 
   Promise<string | void> => {
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

export const touchFile = (filename: string) => {
   const time = new Date()

   try {
      utimesSync(filename, time, time)
   } catch (err) {
      closeSync(openSync(filename, 'w'))
   }

   return filename
}

export const finished = promisify(stream.finished)

export const copyDir = async (src: string, dest: string) => {
   await fsP.mkdir(dest, { recursive: true })
   const entries = await fsP.readdir(src, { withFileTypes: true })

   for (const entry of entries) {
      const srcPath = join(src, entry.name)
      const destPath = join(dest, entry.name)

      entry.isDirectory() ? await copyDir(srcPath, destPath) : await fsP.copyFile(srcPath, destPath)
   }
}

export const unlinkAsync = promisify(fs.unlink.bind(fs))
