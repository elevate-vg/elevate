import { ApolloServer } from 'apollo-server-express'
import type { Application } from 'express'
import { makeSchema, stringArg, queryType } from 'nexus'
import { join } from 'path'

export const main = async (server: Application) => {
   try {
      const Query = queryType({
         definition(t) {
            t.string('hello', {
               args: { name: stringArg() },
               resolve: (_, { name }) => `Hello ${name || 'World'}!`,
            })
         },
      })

      const schema = makeSchema({
         types: [Query],
         outputs:
            process.env.NODE_ENV === 'production'
               ? {}
               : {
                    schema: join(__dirname, '../../../../../libs/types/schema.graphql'),
                    typegen: join(__dirname, '../../../../../libs/types/Nexus.ts'),
                 },
      })
      const apollo = new ApolloServer({
         schema,
         tracing: true,
      })

      apollo.applyMiddleware({ app: server })

      console.log(`🚀 Graphql server started..`)
   } catch (e) {
      console.error(e)
   }

   return server
}

export default main
