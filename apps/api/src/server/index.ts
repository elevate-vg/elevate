import express, { Response } from 'express'
import loader from './loader'

const port = parseInt(process.env.PORT || '3000', 10)

export const main = () =>
   loader(express())
      .all('*', (_, res: Response) => {
         res.send('route not found')
      })
      .listen(port, (err?: unknown) => {
         if (err) throw err
         console.log(`> Ready on http://localhost:${port} - env ${process.env.NODE_ENV}`)
      })

export default main
