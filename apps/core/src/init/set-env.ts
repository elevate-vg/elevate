import { join } from 'path'
import { Context } from '../context'

export default (ctx: Context) => {
   const production = {
      DATABASE_URL: `file:${ctx.paths.data}/elevate.db`,
   }

   const development = {
      DATABASE_URL: `file:${join(__dirname, `../prisma/dev.db`)}`,
   }

   process.env =
      process.env.NODE_ENV === 'production'
         ? { ...process.env, ...production }
         : { ...process.env, ...development }

   return ctx
}
