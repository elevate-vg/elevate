import { ApolloServer } from 'apollo-server-express'
import type { Application } from 'express'
import { makeSchema, stringArg, extendType } from 'nexus'
import { join } from 'path'
import type { Graphql, Plugin } from 'libs/types/Plugin'

export const main = (server: Application) => async (plugins: Plugin[]) => {
   try {
      const b = extendType({
         type: 'Query',
         definition(t) {
            t.string('hello', {
               args: { name: stringArg() },
               resolve: (_, { name }) => `Hello ${name || 'World'}!`,
            })
         },
      })

      let myPlugins: Graphql[] = []

      // TODO: Don't mutate variables
      plugins?.map((plugin) =>
         plugin?.graphql?.map((type) => {
            myPlugins.push(type)
         }),
      )

      const schema = makeSchema({
         types: [b, ...myPlugins],
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
