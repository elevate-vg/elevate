/* eslint-disable @typescript-eslint/no-var-requires */
const { createWriteStream, mkdirSync } = require('fs')
const archiver = require('archiver')
const { join } = require('path')

const distDir = join(__dirname, '../dist')
const pkgDir = join(__dirname, `../pkg/`)

mkdirSync(pkgDir, { recursive: true })

const main = (platform) => {
   const assetDir = join(__dirname, `../assets/${platform}`)

   switch (platform) {
      case 'darwin': {
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
         archive.directory(assetDir, false)
         return archive.finalize()
      }
      case 'win':
      default: {
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
         archive.directory(assetDir, false)
         return archive.finalize()
      }
   }
}

module.exports = main
// main(process.argv.slice(2)[0])
main('win')
main('darwin')
