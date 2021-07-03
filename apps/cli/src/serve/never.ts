import { Arguments, Argv } from 'yargs'

export const command = 'xxx'
export const desc = 'xxddxxx'
export const builder = (yargs: Argv) => {
   return yargs
}

export const handler = function (argv: Arguments) {
   console.log('boo', argv)
}
