import { join } from 'path'
import puppeteer, { Puppeteer } from 'puppeteer-core'
import { baseDir } from '../constants'

// TODO: Generate type for this monkey patch
const getChromePath = () => {
   switch (process.env.NODE_ENV) {
      case 'production': {
         switch (process.platform) {
            case 'win32': {
               // TODO: Is this the correct path
               return './bin/chromium/chrome.exe'
            }
            case 'darwin': {
               return './bin/chromium/Chromium.app/Contents/MacOS/Chromium'
            }
         }
         break
      }
      default: {
         switch (process.platform) {
            case 'win32': {
               return join(
                  baseDir,
                  // TODO: Is this the correct path
                  './bin/chromium/chrome.exe',
               )
            }
            case 'darwin': {
               return join(baseDir, './bin/chromium/Chromium.app/Contents/MacOS/Chromium')
            }
         }
         break
      }
   }
}

const createPuppeteer = (): Puppeteer => {
   // @ts-ignore
   puppeteer._launch = puppeteer.launch

   // @ts-ignore
   puppeteer.launch = (opts: puppeteer.LaunchOptions) => {
      // @ts-ignore
      return puppeteer._launch({
         ...opts,
         executablePath: getChromePath(),
      })
   }

   // @ts-ignore
   return puppeteer
}

export default createPuppeteer()
