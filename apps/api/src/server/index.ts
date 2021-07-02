import { Response } from 'express'
import { Context } from '../context'
import loader from './loader'

const port = parseInt(process.env.PORT || '3000', 10)

export const main = async (ctx: Context) => {
   return (await loader(ctx))
      .all('*', (_, res: Response) => {
         res.send('route not found')
      })
      .listen(port, (err?: unknown) => {
         if (err) throw err
         console.log(
            `> Ready on http://localhost:${port} - env ${process.env.NODE_ENV || 'development'}`,
         )
      })
}

export default main
