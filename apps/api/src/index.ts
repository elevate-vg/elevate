import serve from './server'
import downloadChrome from './download-chrome'
import { join } from 'path'

// TODO: Find a better way to set env vars (varied by platform)
process.env.DATABASE_URL =
   process.env.NODE_ENV === 'production'
      ? 'file:./elevate.db'
      : `file:${join(__dirname, `../prisma/dev.db`)}`

downloadChrome(process.platform)
serve()
// import express from 'express'
// import { ApolloServer, gql } from 'apollo-server-express'

// async function startApolloServer() {
//    const typeDefs = gql`
//       type Query {
//          hello: String
//       }
//    `

//    const resolvers = {
//       Query: {
//          hello: () => 'Hello world!',
//       },
//    }
//    const server = new ApolloServer({
//       typeDefs,
//       resolvers,
//    })
//    await server.start()

//    const app = express()

//    // Additional middleware can be mounted at this point to run before Apollo.

//    // Mount Apollo middleware here.
//    server.applyMiddleware({ app, path: '/specialUrl' })
//    // @ts-ignore
//    await new Promise((resolve) => app.listen({ port: 4000 }, resolve))
//    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
//    return { server, app }
// }
// startApolloServer()
