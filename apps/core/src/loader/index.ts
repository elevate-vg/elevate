import { Response } from 'express'
import { Context } from '../context'
import theme from './theme'

// Loaders
import graphql from './graphql'
import catalog from './catalog'
import api from './api'
import dependencies from './dependencies'

// Types
import type { Plugin } from 'libs/types/Plugin'
import * as rawPlugins from 'plugins'

const port = parseInt(process.env.PORT || '31348', 10)

export const main = async (ctx: Context) => {
   const normalizePlugin = (plugin: Plugin): Plugin => ({
      graphql: [],
      catalogs: [],
      launchers: [],
      apis: [],
      dependencies: [],
      ...plugin,
   })

   const plugins = Object.values(rawPlugins).map(normalizePlugin)

   await dependencies(ctx, plugins)
   await theme(ctx)
   await graphql(ctx)(plugins)
   await catalog(ctx)(plugins)
   await api(ctx)(plugins)

   return ctx.express
      .all('*', (_, res: Response) => {
         res.send('route not found')
      })
      .listen(port, (err?: unknown) => {
         if (err) throw err
         ctx.logger.info(`Ready on http://localhost:${port}`)
         ctx.logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`)
      })
}

export default main
