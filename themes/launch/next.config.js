/* eslint-disable @typescript-eslint/no-var-requires */
const { join } = require('path')
module.exports = {
   reactStrictMode: true,
   assetPrefix: './',
   webpack: (config) => {
      config.module.rules.forEach((rule) => {
         if (rule.test && rule.test.toString().includes('tsx|ts')) {
            // prettier-ignore
            rule.include = [
               ...rule.include,
               join(__dirname, '../../libs/utils'),
               join(__dirname, '../../libs/useGamepads')
            ]
         }
      })
      return config
   },
}
