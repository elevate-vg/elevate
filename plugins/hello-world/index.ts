import { Plugin, Platforms } from 'libs/types'
import { Response } from 'express'

export const meta: Plugin.Meta = {
   namespace: '@simonwjackson',
   name: 'hello',
   version: '1.0.0',
}

export const launchers: Plugin.Launcher[] = [
   {
      name: 'snes9x',
      platforms: [Platforms.SuperNintendo],
      os: [Platforms.Windows10],
      launch: ({ gamePath, launcherPath }) => {
         return `${launcherPath} --file ${gamePath}`
      },
   },
]

export const stores: Plugin.Store[] = [
   {
      name: 'steam',
      platforms: [Platforms.Windows10, Platforms.MacOS],
      search:
         ({ puppeteer }) =>
         async ({ query }) => {
            const browser = await puppeteer.launch()
            const page = await browser.newPage()

            await page.goto('https://example.com')

            const dimensions = await page.evaluate(() => {
               return {
                  width: document.documentElement.clientWidth,
                  height: document.documentElement.clientHeight,
                  deviceScaleFactor: window.devicePixelRatio,
               }
            })

            await browser.close()

            return {
               ...meta,
               data: {
                  hello: true,
                  dimensions,
                  query,
               },
            }
         },
   },
]

export const apis: Plugin.Api[] = [
   {
      name: 'tracks',
      fn: (server) => {
         server.get('/:trackId', (_, res: Response) => {
            res.json({ username: 'Flavio' })
         })

         return server
      },
   },
]
