import { Response } from 'express'
import { Context } from '../context'
import theme from './theme'

// Loaders
import graphql from './plugin/graphql'
import library from './plugin/library'
import api from './plugin/api'

// Types
import type { Plugin } from 'libs/types/Plugin'

// Plugins
import * as hello from 'plugins/hello-world'

const normalizePlugin = (plugin: Plugin): Plugin => ({
   graphql: [],
   libraries: [],
   launchers: [],
   apis: [],
   ...plugin,
})

const port = parseInt(process.env.PORT || '31348', 10)

const plugins = [hello].map(normalizePlugin)

export const main = async (ctx: Context) => {
   await theme(ctx)
   await graphql(ctx)(plugins)
   await library(ctx)(plugins)
   await api(ctx)(plugins)

   return ctx.express
      .all('*', (_, res: Response) => {
         res.send('route not found')
      })
      .listen(port, (err?: unknown) => {
         if (err) throw err
         console.log(
            `> Ready on http://localhost:${port} - env ${process.env.NODE_ENV || 'development'}`,
         )
      })
}

export default main
