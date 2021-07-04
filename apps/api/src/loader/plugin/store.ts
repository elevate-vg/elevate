import type { Response, Request } from 'express'
import type Plugin from 'libs/types/Plugin'
import { trace } from 'console'
import { Context } from '../../context'

export default (ctx: Context) => (plugins: Plugin[]) =>
   ctx.express.get('/~/:namespace/:name/store/:store', async (req: Request, res: Response) => {
      const stores = plugins
         .filter((plugin) => plugin.meta.namespace === req.params.namespace)
         .find((plugin) => plugin.meta.name === req.params.name)?.stores

      const store = (stores || []).find((store) => store.name === req.params.store)

      try {
         const searchResults = await store?.search(ctx)({
            query: req?.query?.query as string,
         })
         res.json(searchResults)
      } catch (e) {
         trace(e)
         res.json({ issue: 'Plugin issue or not found', error: e.message })
      }
   })
