import { spawn } from 'child_process'
import { join } from 'path'
import { Arguments, Argv } from 'yargs'

// Commands
import * as never from './never'

export const command = 'serve'
export const desc = 'start the server'
export const builder = (yargs: Argv) => {
   return yargs.command({ ...never })
}

export const handler = function (argv: Arguments) {
   const web = spawn(join(__dirname, 'node'), ['./server.js'])

   web.stdout.on('data', (data) => {
      if (argv.verbose) console.log(`${data}`)
   })

   web.stderr.on('data', (data) => {
      if (argv.verbose) console.log(`${data}`)
   })

   web.on('error', (error) => {
      if (argv.verbose) console.log(`error: ${error.message}`)
   })

   web.on('close', (code) => {
      if (argv.verbose) console.log(`child process exited with code ${code}`)
   })
}
