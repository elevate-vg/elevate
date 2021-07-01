import { Plugin, Platforms } from '../../libs/types'
import { Response } from 'express'
import { stringArg, extendType } from 'nexus'

export const meta: Plugin.Meta = {
   namespace: '@simonwjackson',
   name: 'hello',
   version: '1.0.0',
}

export const graphql: Plugin.Graphql[] = [
   extendType({
      type: 'Query',
      definition(t) {
         t.string('plugin__simonwjackson__hello', {
            args: { name: stringArg() },
            resolve: (_, { name }) => `Hello ${name || 'World'}!`,
         })
         t.string('hello', {
            args: { name: stringArg() },
            resolve: (_, { name }) => `Hello ${name || 'World2'}!`,
         })
      },
   }),
]

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
