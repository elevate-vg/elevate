import { ApolloServer } from 'apollo-server-express'
import { makeSchema } from 'nexus'

import { join } from 'path'
import { Graphql, Plugin } from 'libs/types/Plugin'
import { Context } from '../context'
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
         const schema = makeSchema({
            // prettier-ignore
            types: [
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
