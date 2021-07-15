import { ApolloServer } from 'apollo-server-express'
import { makeSchema, unionType, extendType } from 'nexus'

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
         const Media = unionType({
            name: 'Media',
            description: 'Any container type that can be rendered into the feed',
            definition(t) {
               t.members('Software', 'Game')
            },
         })

         /*****************************************
          * Queries
          ******************************************/

         const libraryQuery = extendType({
            type: 'Query',
            definition(t) {
               t.list.field('library', {
                  type: 'Media',
                  resolve: async () => {
                     return [
                        {
                           titles: [
                              {
                                 name: 'Super Mario All-Stars',
                                 language: 'en',
                              },
                           ],
                           locations: [
                              {
                                 uri: 'file:///a/b/c.rom',
                                 md5: null,
                              },
                           ],
                           applications: [
                              {
                                 names: [
                                    {
                                       name: 'Super Mario Bros.',
                                       language: 'en',
                                    },
                                 ],
                              },
                              {
                                 names: [
                                    {
                                       name: 'Super Mario Bros. 2',
                                       language: 'en',
                                    },
                                 ],
                              },
                              {
                                 names: [
                                    {
                                       name: 'Super Mario Bros. 3',
                                       language: 'en',
                                    },
                                 ],
                              },
                              {
                                 names: [
                                    {
                                       name: 'Super Mario World',
                                       language: 'en',
                                    },
                                 ],
                              },
                           ],
                        },
                        {
                           names: [
                              {
                                 name: 'Super Mario Bros.',
                                 language: 'en',
                              },
                           ],
                           software: [
                              {
                                 titles: [
                                    {
                                       name: 'Super Mario All-Stars',
                                       language: 'en',
                                    },
                                 ],
                                 locations: [
                                    {
                                       uri: 'file:///a/b/c.rom',
                                       md5: null,
                                    },
                                 ],
                              },
                           ],
                        },
                        {
                           names: [
                              {
                                 name: 'Super Mario Bros. 2',
                                 language: 'en',
                              },
                           ],
                           software: [
                              {
                                 titles: [
                                    {
                                       name: 'Super Mario All-Stars',
                                       language: 'en',
                                    },
                                 ],
                                 locations: [
                                    {
                                       uri: 'file:///a/b/c.rom',
                                       md5: null,
                                    },
                                 ],
                              },
                           ],
                        },
                        {
                           names: [
                              {
                                 name: 'Super Mario Bros. 3',
                                 language: 'en',
                              },
                           ],
                           software: [
                              {
                                 titles: [
                                    {
                                       name: 'Super Mario All-Stars',
                                       language: 'en',
                                    },
                                 ],
                                 locations: [
                                    {
                                       uri: 'file:///a/b/c.rom',
                                       md5: null,
                                    },
                                 ],
                              },
                           ],
                        },
                        {
                           names: [
                              {
                                 name: 'Super Mario World',
                                 language: 'en',
                              },
                           ],
                           software: [
                              {
                                 titles: [
                                    {
                                       name: 'Super Mario All-Stars',
                                       language: 'en',
                                    },
                                 ],
                                 locations: [
                                    {
                                       uri: 'file:///a/b/c.rom',
                                       md5: null,
                                    },
                                 ],
                              },
                           ],
                        },
                     ]
                  },
               })
            },
         })

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
               libraryQuery,
               Media,
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
