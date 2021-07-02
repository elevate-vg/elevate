import type { Response, Request, NextFunction } from 'express'
import { static as serveDir } from 'express'
import { join } from 'path'
import { Context } from '../../context'
// import expressStaticGzip from 'express-static-gzip'

export default (ctx: Context) => () => {
   ctx.express.use(
      '/~/:namespace/:name/theme/:themeName',
      (req: Request, res: Response, next: NextFunction) => {
         const { namespace, themeName } = req.params
         const path =
            process.env.NODE_ENV !== 'production'
               ? join(__dirname, `../../../../`, `themes/${namespace}/${themeName}`)
               : join(__dirname, `themes/${namespace}/${themeName}`)

         try {
            // TODO: Set theme as active and alias it to alias it to /app (?)
            // TODO: Add support for loading themes from userspace
            return serveDir(path)(req, res, next)
         } catch (e) {
            return res.json({ issue: 'Theme issue or theme not found', error: e.message })
         }
      },
   )
}
