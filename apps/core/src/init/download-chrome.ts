import fs, { mkdirSync, existsSync, createWriteStream } from 'fs'
import https from 'https'
import { join } from 'path'
import extractZip from 'extract-zip'
import { promisify } from 'util'
import { Context } from '../context'

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
            const url = `https://storage.googleapis.com/chromium-browser-snapshots/Mac/884014/chrome-mac.zip`
            const chromePath = join(binDir, 'chrome-mac')
            const chromeBinPath = join(chromePath, 'Chromium.app/Contents/MacOS/Chromium')
            const archiveDownloadPath = '/tmp/chrome-mac.zip'

            // TODO: Detecting if node exists by filename only is a bit naive
            if (!existsSync(chromeBinPath)) {
               ctx.logger.log('log', 'Downloading Chrome..')
               if (url.endsWith('.zip')) {
                  https.get(url, (res) => {
                     const filePath = createWriteStream(archiveDownloadPath)
                     res.pipe(filePath)

                     filePath.on('finish', () => {
                        filePath.close()
                        ctx.logger.log('log', '..Download Completed')
                        extractZip(archiveDownloadPath, { dir: binDir }).then(() =>
                           unlinkAsync(archiveDownloadPath),
                        )
                     })
                  })
               }
            }

            break
         }
         case 'win32': {
            // TODO: Download chromium in windows
            // https://npm.taobao.org/mirrors/electron/13.1.5/electron-v13.1.5-win32-x64.zip
            break
         }
      }
   } catch (e) {
      ctx.logger.log('error', e)
   }
}

export default main
