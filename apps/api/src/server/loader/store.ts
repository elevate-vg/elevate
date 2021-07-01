import type { Application, Response, Request } from 'express'
import puppeteer from 'puppeteer-core'
import type Plugin from 'libs/types/Plugin'
import { trace } from 'console'
import { join } from 'path'

const projectRoot = join(__dirname, '../../../../../')

const getPuppeteer = () => {
   switch (process.env.NODE_ENV) {
      case 'production': {
         switch (process.platform) {
            case 'win32': {
               // TODO: Is this the correct path
               return './bin/chrome-win/chrome.exe'
            }
            case 'darwin': {
               return './bin/chrome-mac/Chromium.app/Contents/MacOS/Chromium'
            }
         }
         break
      }
      default: {
         switch (process.platform) {
            case 'win32': {
               return join(
                  projectRoot,
                  // TODO: Is this the correct path
                  './bin/chrome-win/chrome.exe',
               )
            }
            case 'darwin': {
               return join(projectRoot, './bin/chrome-mac/Chromium.app/Contents/MacOS/Chromium')
            }
         }
         break
      }
   }
}

// TODO: Generate type for this monkey patch
// TODO: Refactor into separate file
const myPuppet = () => {
   // @ts-ignore
   puppeteer._launch = puppeteer.launch

   // @ts-ignore
   puppeteer.launch = (opts: puppeteer.LaunchOptions) => {
      // @ts-ignore
      return puppeteer._launch({
         ...opts,
         executablePath: getPuppeteer(),
      })
   }

   return puppeteer
}

export default (server: Application) => (plugins: Plugin[]) =>
   server.get('/~/:namespace/:name/store/:store', async (req: Request, res: Response) => {
      const stores = plugins
         .filter((plugin) => plugin.meta.namespace === req.params.namespace)
         .find((plugin) => plugin.meta.name === req.params.name)?.stores

      const store = (stores || []).find((store) => store.name === req.params.store)

      try {
         // @ts-ignore
         const searchResults = await store?.search({ puppeteer: myPuppet() })({
            // @ts-ignore
            query: req?.query?.query,
         })
         res.json(searchResults)
      } catch (e) {
         trace(e)
         res.json({ issue: 'Plugin issue or not found', error: e.message })
      }
   })
