import { PrismaClient } from '@prisma/client'
import * as hello from 'plugins/hello-world'

const prisma = new PrismaClient()

// Loaders
import graphql from './graphql'
import store from './store'
import theme from './theme'
import api from './api'

// Types
import type { Plugin } from 'libs/types/Plugin'
import { Context } from '../../context'

const normalizePlugin = (plugin: Plugin): Plugin => ({
   themes: [],
   graphql: [],
   stores: [],
   launchers: [],
   apis: [],
   ...plugin,
})

export default async (ctx: Context) => {
   const plugins = [hello].map(normalizePlugin)

   // TODO: Remove this query
   prisma.user.findMany().then(console.log)

   await graphql(ctx)(plugins)
   await store(ctx)(plugins)
   await api(ctx)(plugins)
   await theme(ctx)()

   return ctx.express
}
