import { curry, path, pipe, tail, toString, trim } from '.'
import { spawn } from 'child_process'
import { Context } from 'apps/core/src/context'

export const command = curry((ctx: Context, args: string[]) => {
   ctx.logger.debug(`Running command: ${args.join(' ')}`)
   const cmd = spawn(args[0], tail(args), {
      /*detached: true, stdio: 'inherit'*/
   })

   const preLog = pipe(toString, trim)
   const debug = pipe(preLog, ctx.logger.debug)
   const error = pipe(preLog, ctx.logger.error)
   const close = pipe(preLog, (msg) => `exit code: ${msg}`, ctx.logger.debug)
   const errorMessage = pipe(path(['message']), preLog, ctx.logger.error)

   // cmd.stdout.on('data', debug)
   // cmd.stderr.on('data', error)
   cmd.on('error', errorMessage)
   cmd.on('close', close)

   ctx.logger.debug(`PID: ${cmd.pid}`)

   return cmd
})
