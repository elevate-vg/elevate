import { PrismaClient } from '@prisma/client'
import * as hello from '../../../../../plugins/hello-world'

const prisma = new PrismaClient()

// Loaders
import store from './store'
import theme from './theme'
import api from './api'

// Types
import type { Plugin } from 'libs/types/Plugin'
import type { Application } from 'express'

const normalizePlugin = (plugin: Plugin): Plugin => ({
   themes: [],
   stores: [],
   launchers: [],
   apis: [],
   ...plugin,
})

export default (server: Application) => {
   const plugins = [hello].map(normalizePlugin)

   prisma.user.findMany().then(console.log)

   store(server)(plugins)
   theme(server)()
   api(server)(plugins)

   return server
}
