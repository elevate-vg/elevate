import serve from './server'
import downloadChrome from './download-chrome'
import { join } from 'path'
import { createContext } from './context'

// TODO: Find a better way to set env vars (varied by platform)
process.env.DATABASE_URL =
   process.env.NODE_ENV === 'production'
      ? 'file:./elevate.db'
      : `file:${join(__dirname, `../prisma/dev.db`)}`

downloadChrome(process.platform)
serve(createContext())
