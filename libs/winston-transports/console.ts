import { format, transports } from 'winston'
import chalk from 'chalk'

const { combine, timestamp, label, printf } = format

const coloredFormat = printf(({ level, message, label }) => {
   const levelPadded = ` ${level} `
   const output = (level: string, message: string) =>
      `${chalk.rgb(0, 0, 0).bgBlue.bold(' ' + label + ' ')}${level}  ${message}`

   switch (level.toUpperCase()) {
      case 'WARN':
         // prettier-ignore
         return output(
            chalk.rgb(0, 0, 0).bgYellowBright.bold(levelPadded),
            chalk.yellow(message),
         )

      // prettier-ignore
      case 'ERROR':
         return output(
            chalk.rgb(0, 0, 0).bgRedBright.bold(levelPadded),
            chalk.red(message)
         )

      case 'INFO':
      default:
         // prettier-ignore
         return output(
            chalk.rgb(0, 0, 0).bgGreenBright.bold(levelPadded), 
            message
         )
   }
})

// prettier-ignore
export const console =
   new transports.Console({
      format: combine(
         label({ label: 'elevate' }),
         timestamp(),
         format.splat(),
         coloredFormat
      ),
   })

export default console
