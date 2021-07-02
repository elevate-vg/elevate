import { join } from 'path'

const production = {
   DATABASE_URL: 'file:./elevate.db',
}

const development = {
   DATABASE_URL: `file:${join(__dirname, `../prisma/dev.db`)}`,
}

export default () =>
   (process.env =
      process.env.NODE_ENV === 'production'
         ? { ...process.env, ...production }
         : { ...process.env, ...development })
