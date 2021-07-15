import { ApolloServer } from 'apollo-server-express'
import { makeSchema } from 'nexus'

import { join } from 'path'
import { Graphql, Plugin } from 'libs/types/Plugin'
import { Context } from '../context'
// import { has, allPass } from 'ramda'
import { types } from 'libs/graphql'

// prettier-ignore
// const getLibraries = (plugins: Plugin[]): Library[] =>
//    plugins
//       .map(({ libraries = [] }) => libraries)
//       .reduce((acc = [], cur = []) => [
//          ...acc,
//          ...cur
//       ], [])

// prettier-ignore
const getExternalGraphqlTypes = (plugins: Plugin[]): Graphql[]  =>
   plugins.reduce<Graphql[]>((acc, { graphql = [] }) => (
      [...acc, ...graphql]
   ), [])

export const main =
   (ctx: Context) =>
   async (plugins: Plugin[] = []) => {
      try {
         // const LibraryItem = unionType({
         //    name: 'LibraryItem',
         //    definition(t) {
         //       t.members('Software') //, 'PatchFile', 'PatchCode')
         //    },
         //    resolveType: (data) => {
         //       // if (allPass([has('code')])(data)) {
         //       // return 'PatchCode'
         //       // } else
         //       if (allPass([has('platform')])(data)) return 'Software'
         //       else return null
         //       // } else {
         //       // return 'PatchFile'
         //       // }
         //    },
         // })

         /*****************************************
          * Queries
          ******************************************/

         // const libraryQuery = extendType({
         //    type: 'Query',
         //    definition(t) {
         //       t.list.field('library', {
         //          type: 'LibraryItem',
         //          resolve: async () => {
         //             return [
         //                {
         //                   supports: [{ md5: 'j3k4223j4k' }],
         //                },
         //                {
         //                   platform: 'NINTENDO_ENTERTAINMENT_SYSTEM',
         //                   name: 'Metroid',
         //                   version: '1.03',
         //                   applications: [
         //                      {
         //                         name: 'Metroid',
         //                      },
         //                   ],
         //                },
         //             ]
         //          },
         //       })
         //    },
         // })

         // const librariesQuery = extendType({
         //    type: 'Query',
         //    definition(t) {
         //       t.list.field('libraries', {
         //          type: 'Program',
         //          args: { query: stringArg() },
         //          resolve: async (_, { query }, ctx: Context) => {
         //             return getLibraries(plugins).reduce(
         //                async (acc, cur) => [
         //                   ...(await acc),
         //                   ...(await cur?.search(ctx)({ query: query as string })),
         //                ],
         //                Promise.resolve(<Software[]>[]),
         //             )
         //          },
         //       })
         //    },
         // })

         const schema = makeSchema({
            types: [
               // librariesQuery,
               // libraryQuery,
               // LibraryItem,
               ...types,
               ...getExternalGraphqlTypes(plugins),
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
