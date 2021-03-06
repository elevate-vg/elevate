import { ApolloServer } from 'apollo-server-express'
import { arg, extendType, makeSchema, nonNull } from 'nexus'

import { Catalog, CatalogResult, CatalogSearch, Graphql, Plugin } from 'libs/types/Plugin'
import { Context } from '../context'
import { types } from 'libs/graphql'
import { compose, concat, map } from 'libs/utils'
import { rootDir } from '../constants'
import { launch } from '../launch'

type SearchCatalog = (ctx: Context, args: CatalogSearch) => CatalogResult
type SearchCatalogs = (catalogs: Catalog[]) => SearchCatalog

// prettier-ignore
const searchCatalogs: SearchCatalogs =
   (catalogs) =>
   (ctx, args) => {
      const result = map(catalog => catalog.search(ctx)(args), catalogs)

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
      const { info } = ctx.logger.tap

      try {
         const launchQuery = extendType({
            type: 'Query',
            definition(t) {
               t.field('launch', {
                  type: 'Int',
                  args: {
                     platform: nonNull(
                        arg({
                           type: 'Platform',
                           description: 'Software platform',
                        }),
                     ),
                     uri: nonNull(
                        arg({
                           type: 'String',
                           description: 'URI of software',
                        }),
                     ),
                  },
                  resolve: async (_, args) => {
                     const cmd = await launch(ctx, plugins, args)

                     return cmd?.pid || null
                  },
               })
            },
         })

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
                  resolve: async (_, args) =>
                     compose(
                        (search: SearchCatalog) => search(ctx, args),
                        info('Searching catalogs', searchCatalogs),
                        info('Gathering catalogs', getCatalogs),
                        // searchCatalogs,
                        // getCatalogs,
                     )(plugins),
               })
            },
         })

         const schema = makeSchema({
            prettierConfig: rootDir('prettier.config.js'),
            shouldGenerateArtifacts: process.env.NODE_ENV !== 'production',
            types: [catalogQuery, launchQuery, ...types, ...getExternalGraphqlTypes(plugins)],
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

         ctx.logger.info(`Graphql server started`)
      } catch (e) {
         ctx.logger.error(e)
      }

      return ctx.express
   }

export default main
