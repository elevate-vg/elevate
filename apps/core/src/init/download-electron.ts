import fs, { mkdirSync, existsSync, createWriteStream, promises as fsP } from 'fs'
import https from 'https'
import { join } from 'path'
import extractZip from 'extract-zip'
import { promisify } from 'util'
import { Context } from '../context'

const copyDir = async (src: string, dest: string) => {
   await fsP.mkdir(dest, { recursive: true })
   const entries = await fsP.readdir(src, { withFileTypes: true })

   for (const entry of entries) {
      const srcPath = join(src, entry.name)
      const destPath = join(dest, entry.name)

      entry.isDirectory() ? await copyDir(srcPath, destPath) : await fsP.copyFile(srcPath, destPath)
   }
}

const unlinkAsync = promisify(fs.unlink.bind(fs))

// prettier-ignore
const main = 
   (ctx: Context) => 
   async (platform: NodeJS.Platform) => {
   try {
      const binDir = join(ctx.paths.data, 'bin')
      mkdirSync(binDir, { recursive: true })

      switch (platform) {
         case 'darwin': {
            // TODO: Find faster CDN for electron download
            const url = `https://cdn.npm.taobao.org/dist/electron/13.1.5/electron-v13.1.5-darwin-x64.zip`
            const containerDir = join(binDir, 'electron')
            const bin = join(containerDir, 'Electron.app/Contents/MacOS/Electron')
            const appTemplateFrom = join(__dirname, `./assets/electron`)
            const appTemplateDest = join(containerDir, 'Electron.app/Contents/Resources/app')
            const archive = '/tmp/electron.zip'

            // TODO: Detecting if node exists by filename only is a bit naive
            if (!existsSync(bin)) {
               ctx.logger.log('info', 'Downloading Electron..')
               https.get(url, (res) => {
                  const filePath = createWriteStream(archive)
                  res.pipe(filePath)

                  filePath.on('finish', () => {
                     filePath.close()
                     ctx.logger.log('info', '..Download Completed')
                     extractZip(archive, { dir: containerDir })
                        .then(() => unlinkAsync(archive))
                        .then(() => {
                           if (existsSync(appTemplateFrom)) {
                              if (!existsSync(appTemplateDest)) {
                                 ctx.logger.log('info', 'Installing electron template..')
                                 copyDir(appTemplateFrom, appTemplateDest)
                              }
                           }
                        })
                  })
               })
            }

            break
         }
         case 'win32': {
            // TODO: Download electron in windows
            break
         }
      }
   } catch (e) {
      ctx.logger.log('error', e)
   }
}

export default main
