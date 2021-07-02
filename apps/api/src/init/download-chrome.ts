import fs, { mkdirSync, existsSync, createWriteStream } from 'fs'
import https from 'https'
import { join } from 'path'
import extractZip from 'extract-zip'
import { promisify } from 'util'
import { baseDir } from '../constants'

const unlinkAsync = promisify(fs.unlink.bind(fs))

const main = async (platform: string) => {
   try {
      const binDir =
         process.env.NODE_ENV !== 'production' ? join(baseDir, `bin`) : join(__dirname, `./bin`)
      mkdirSync(binDir, { recursive: true })

      switch (platform) {
         case 'darwin': {
            const url = `https://storage.googleapis.com/chromium-browser-snapshots/Mac/884014/chrome-mac.zip`
            const chromePath = join(binDir, 'chrome-mac')
            const chromeBinPath = join(chromePath, 'Chromium.app/Contents/MacOS/Chromium')
            const archiveDownloadPath = '/tmp/chrome-mac.zip'

            // TODO: Detecting if node exists by filename only is a bit naive
            if (!existsSync(chromeBinPath)) {
               console.log('Downloading Chrome..')
               if (url.endsWith('.zip')) {
                  https.get(url, (res) => {
                     const filePath = createWriteStream(archiveDownloadPath)
                     res.pipe(filePath)

                     filePath.on('finish', () => {
                        filePath.close()
                        console.log('..Download Completed')
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
            break
         }
      }
   } catch (e) {
      console.error(e)
   }
}

export default main
