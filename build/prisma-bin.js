const { mkdirSync, writeFileSync, chmodSync } = require('fs')
const { join } = require('path')
const ncc = require('@vercel/ncc')
const replace = require("replace-in-file")

const input = join(__dirname, '../node_modules/prisma/build/index.js')
const outputDir = join(__dirname, '../dist/bin/prisma')
const output = join(outputDir, 'prisma.js')

ncc(input, {
   minify: true,
   sourceMapRegister: false,
}).then(async ({ code }) => {
   mkdirSync(outputDir, { recursive: true })
   writeFileSync(output, code)
   chmodSync(output, '755')
   
   await replace({
      files: output,
      from: /e.exports=_http_common/g,
      to: 'e.exports=require("_http_common")',
   })

   await replace({
      files: output,
      from: /\.\.\/package.json/g,
      to: '../../package.json',
   })
})

