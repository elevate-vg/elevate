import serve from './server'
// import { join } from 'path'

// TODO: Find a better way to set env vars (varied by platform)
// process.env.PRISMA_QUERY_ENGINE_BINARY =
//    process.env.NODE_ENV === 'production'
//       ? './prisma-query-engine'
//       : join(__dirname, `../../../../assets/${process.platform}/prisma-query-engine`)
process.env.DATABASE_URL = 'file:/Users/simonwjackson/storage/code/lerna-ts-test/dev.db'
serve()
