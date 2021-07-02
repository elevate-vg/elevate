import type { Plugin } from 'libs/types/Plugin'
import express from 'express'
import { Context } from '../../context'

export default (ctx: Context) => (plugins: Plugin[]) => {
   plugins?.map((plugin) =>
      plugin?.apis?.map((api) => {
         const ext = api.fn(express.Router())
         ctx.express.use('/~/:namespace/:name/api', ext)
      }),
   )
   return ctx.express
}
