import type { Application, Response, Request } from 'express'
import puppeteer from 'puppeteer'
import type Plugin from 'libs/types/Plugin'

export default (server: Application) => (plugins: Plugin[]) =>
   server.get('/~/:namespace/:name/store/:store', async (req: Request, res: Response) => {
      const stores = plugins
         .filter((plugin) => plugin.meta.namespace === req.params.namespace)
         .find((plugin) => plugin.meta.name === req.params.name)?.stores

      const store = (stores || []).find((store) => store.name === req.params.store)

      try {
         // @ts-ignore
         const searchResults = await store?.search({ puppeteer })({ query: req?.query?.query })
         res.json(searchResults)
      } catch (e) {
         res.json({ issue: 'Plugin issue or not found', error: e.message })
      }
   })
