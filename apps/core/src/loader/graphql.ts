import { ApolloServer } from 'apollo-server-express'
import { arg, extendType, makeSchema, nonNull } from 'nexus'

import { Catalog, CatalogResult, CatalogSearch, Graphql, Plugin } from 'libs/types/Plugin'
import { Context } from '../context'
import { types } from 'libs/graphql'
import { applyTo, compose, concat, curry, map, tap } from 'libs/utils'
import { rootDir } from '../constants'

// prettier-ignore
const searchCatalogs = 
   (catalogs: Catalog[]) =>
   (ctx: Context) =>
   async (args: CatalogSearch): Promise<CatalogResult> => {
      const result = await map(catalog => catalog.search(ctx)(args), catalogs)
      return result.reduce(async (acc = [], cur = []) => 
         concat(await acc, await cur)
     , [])
   }

// prettier-ignore
const getCatalogs = (plugins: Plugin[]): Catalog[] =>
   plugins
      .map(({ catalogs = [] }) => catalogs)
      .reduce((acc = [], cur = []) => [
         ...acc,
         ...cur
      ], [])

// prettier-ignore
const getExternalGraphqlTypes = 
   (plugins: Plugin[]): Graphql[] =>
   plugins.reduce<Graphql[]>((acc, { graphql = [] }) => (
      [...acc, ...graphql]
   ), [])

export const main =
   (ctx: Context) =>
   async (plugins: Plugin[] = []) => {
      // prettier-ignore
      const msg = 
         curry(((message: string, value: unknown) =>
            tap(() => ctx.logger.log('info', message))(value)
         ))

      try {
         const catalogQuery = extendType({
            type: 'Query',
            definition(t) {
               t.list.field('catalog', {
                  type: 'Entry',
                  args: {
                     query: nonNull(
                        arg({
                           type: 'String',
                           description: 'Search query',
                        }),
                     ),
                  },
                  // @ts-ignore
                  resolve: async (_, args) =>
                     compose(
                        applyTo(args),
                        // @ts-ignore: Incorrect Ramda type issue
                        applyTo(ctx),
                        msg('Searching catalogs', searchCatalogs),
                        msg('Gathering catalogs', getCatalogs),
                        // @ts-ignore: Incorrect Ramda type issue
                     )(plugins),
               })
            },
         })

         const schema = makeSchema({
            prettierConfig: rootDir('prettier.config.js'),
            shouldGenerateArtifacts: process.env.NODE_ENV !== 'production',
            types: [catalogQuery, ...types, ...getExternalGraphqlTypes(plugins)],
            features: {
               abstractTypeStrategies: {
                  isTypeOf: true,
               },
            },
            outputs: {
               schema: rootDir('libs/types/schema.graphql'),
               typegen: rootDir('libs/types/Nexus.ts'),
            },
         })

         const apollo = new ApolloServer({
            schema,
            context: ctx,
            tracing: true,
            introspection: true, //environment.apollo.introspection,
            playground: true, //environment.apollo.playground
         })

         apollo.applyMiddleware({ app: ctx.express })

         ctx.logger.info(`🚀 Graphql server started..`)
      } catch (e) {
         ctx.logger.log('error', e)
      }

      return ctx.express
   }

export default main
