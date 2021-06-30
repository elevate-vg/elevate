/* eslint-disable @typescript-eslint/no-var-requires */
const { createWriteStream, mkdirSync } = require('fs')
const archiver = require('archiver')
const { join } = require('path')
const replace = require("replace-in-file")

const distDir = join(__dirname, '../dist')
const pkgDir = join(__dirname, `../pkg`)
const assetDir = join(__dirname, `../assets/all`)

mkdirSync(pkgDir, { recursive: true })

const main = (platform) => {
   const assetPlatformDir = join(__dirname, `../assets/${platform}`)

   switch (platform) {
      case 'darwin': {
         // TODO: Use actual version in filename
         const output = createWriteStream(join(pkgDir, 'elevate-v1.0.0-darwin-x64.tar.gz'))

         const archive = archiver('tar', {
            gzip: true,
         })

         output.on('close', function () {
            console.log(archive.pointer() + ' total bytes')
            console.log('archiver has been finalized and the output file descriptor has closed.')
         })

         archive.on('error', function (err) {
            throw err
         })

         archive.pipe(output)

         // append files from a sub-directory, putting its contents at the root of archive
         archive.directory(distDir, false)
         archive.directory(assetPlatformDir, false)
         archive.directory(assetDir, false)
         return archive.finalize()
      }
      case 'win':
      default: {
         // TODO: Use actual version in filename
         const output = createWriteStream(join(pkgDir, 'elevate-v1.0.0-win-x64.zip'))
         const archive = archiver('zip')

         output.on('close', function () {
            console.log(archive.pointer() + ' total bytes')
            console.log('archiver has been finalized and the output file descriptor has closed.')
         })

         archive.on('error', function (err) {
            throw err
         })

         archive.pipe(output)

         // append files from a sub-directory, putting its contents at the root of archive
         archive.directory(distDir, false)
         archive.directory(assetPlatformDir, false)
         archive.directory(assetDir, false)
         return archive.finalize()
      }
   }
}

module.exports = main

// HACK: Prisma is using an undocumented node module
//       Webpack fails to compile without this
;(async () => {
   try {
      const results = await replace({
         files: join(distDir, './server.js'),
         from: /e.exports=_http_common/g,
         to: 'e.exports=require("_http_common")',
       })

      main('win')
      main('darwin')
    }
    catch (error) {
      console.error('Error occurred:', error);
    }
})()

