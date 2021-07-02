import { ApolloServer } from 'apollo-server-express'
import { makeSchema, stringArg, extendType } from 'nexus'
import { join } from 'path'
import type { Graphql, Plugin } from 'libs/types/Plugin'
import { Context } from '../../context'

export const main = (ctx: Context) => async (plugins: Plugin[]) => {
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

      const myPlugins: Graphql[] = []

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
