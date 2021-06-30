/* eslint-disable @typescript-eslint/no-var-requires */
var tar = require('tar-stream')
var zlib = require('zlib')
const { chmodSync, createWriteStream, mkdirSync, readFileSync, writeFileSync, existsSync } = require('fs')
const { join } = require('path')
const request = require('request')
const unzipper = require('unzipper')

const version = readFileSync(join(__dirname, '../.nvmrc'), { encoding: 'utf8', flag: 'r' })

const getExt = (platform) => {
   switch (platform) {
      case 'darwin':
         return 'tar.gz'
      case 'win':
      default:
         return 'zip'
   }
}

const main = async (platform) => {
   const base = `node-${version}-${platform}-x64`
   const filename = `${base}.${getExt(platform)}`
   const url = `https://nodejs.org/dist/${version}/${filename}`

   try {
      const assetDir = join(__dirname, `../assets/${platform}`)
      mkdirSync(assetDir, { recursive: true })

      switch (platform) {
         case 'darwin': {
            const nodePath = join(assetDir, 'node')

            // TODO: Detecting if node exists by filename only is a bit naive
            if (existsSync(nodePath)){
               var extract = tar.extract()
               var chunks = []

               extract.on('entry', function (header, stream, next) {
                  if (header.name == 'node-v14.16.0-darwin-x64/bin/node') {
                     stream.on('data', function (chunk) {
                        chunks.push(chunk)
                     })
                  }

                  stream.on('end', function () {
                     next()
                  })

                  stream.resume()
               })

               extract.on('finish', function () {
                  if (chunks.length) {
                     var data = Buffer.concat(chunks)
                     const name = nodePath
                     writeFileSync(name, data)
                     chmodSync(name, '755')
                  }
               })

               return request(url).pipe(zlib.createGunzip()).pipe(extract)
            }

            break
         }
         case 'win':
         default: {
            const nodePath = join(assetDir, 'node.exe')
            // TODO: Detecting if node exists by filename only is a bit naive
            if (existsSync(nodePath)){
               const zip = request(url).pipe(unzipper.Parse({ forceStream: true }))

               for await (const entry of zip) {
                  const fileName = entry.path

                  if (fileName === `${base}/node.exe`) {
                     entry.pipe(createWriteStream(nodePath))
                  } else {
                     entry.autodrain()
                  }
               }
            }

            break
         }
      }
   } catch (e) {
      console.error(e)
   }
}

main('darwin')
main('win')
