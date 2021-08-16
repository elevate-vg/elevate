import { ChildProcessWithoutNullStreams } from 'child_process'
import { path, pipe, tail, toString, trim, tap } from '.'
import { spawn } from 'child_process'
import { Context } from 'apps/core/src/context'
import { concat } from '.'

type Noop = () => void
// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop: Noop = () => {}

export type CommandEvents = {
   onError?: (mesage: string) => void | Noop
   onExit?: (code: string) => void | Noop
   onLaunch?: (command: ChildProcessWithoutNullStreams) => void | Noop
}

export const command = (ctx: Context, args: string[], events: CommandEvents) => {
   ctx.logger.debug(`Running command: ${args.join(' ')}`)
   const cmd = spawn(args[0], tail(args), {
      /*detached: true, stdio: 'inherit'*/
   })
   events?.onLaunch && events.onLaunch(cmd)

   const asCleanString = pipe(toString, trim)
   const debug = pipe(asCleanString, ctx.logger.debug)
   const error = pipe(asCleanString, ctx.logger.error)

   const close = pipe(
      asCleanString,
      tap((msg) => events?.onExit && events.onExit(msg)),
      concat(`exit code: `),
      debug,
   )
   const errorMessage = pipe(
      path(['message']),
      tap((msg) => events?.onError && events.onError(msg as string)),
      error,
   )

   // cmd.stdout.on('data', debug)
   // cmd.stderr.on('data', error)
   cmd.on('error', errorMessage)
   cmd.once('close', close)
   debug(`PID: ${cmd.pid}`)

   return cmd
}
