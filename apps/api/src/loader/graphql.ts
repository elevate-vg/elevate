import { ApolloServer } from 'apollo-server-express'
import { arg, extendType, makeSchema, nonNull } from 'nexus'

import { join } from 'path'
import { Catalog, Graphql, Plugin } from 'libs/types/Plugin'
import { Context } from '../context'
import { types } from 'libs/graphql'

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
                  // prettier-ignore
                  // @ts-ignore
                  resolve: async (_, args) => 
                    // HACK: Only referencing first catalog
                    getCatalogs(plugins)?.[0]
                      ?.search(ctx)(args),
               })
            },
         })

         const schema = makeSchema({
            // prettier-ignore
            types: [
               catalogQuery,
               ...types, 
               ...getExternalGraphqlTypes(plugins)
            ],
            features: {
               abstractTypeStrategies: {
                  isTypeOf: true,
               },
            },
            outputs:
               process.env.NODE_ENV === 'production'
                  ? {}
                  : {
                       schema: join(__dirname, '../../../../libs/types/schema.graphql'),
                       typegen: join(__dirname, '../../../../libs/types/Nexus.ts'),
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

         console.log(`🚀 Graphql server started..`)
      } catch (e) {
         console.error(e)
      }

      return ctx.express
   }

export default main
