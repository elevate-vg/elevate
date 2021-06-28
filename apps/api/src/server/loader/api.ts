import type { Application } from 'express'
import type { Plugin } from 'libs/types/Plugin'
import express from 'express'

export default (server: Application) => (plugins: Plugin[]) => {
   plugins?.map((plugin) =>
      plugin?.apis?.map((api) => {
         const ext = api.fn(express.Router())
         server.use('/~/:namespace/:name/api', ext)
      }),
   )
   return server
}
