import { join } from 'path'
import { createLogger, format, transports } from 'winston'
import chalk from 'chalk'

const { combine, timestamp, label, printf } = format

const coloredFormat = printf(({ level, message, label }) => {
   const levelPadded = ` ${level} `
   const output = (level: string, message: string) =>
      `${chalk.rgb(0, 0, 0).bgBlue.bold(' ' + label + ' ')}${level}  ${message}`

   switch (level.toUpperCase()) {
      case 'WARN':
         return output(
            chalk.rgb(0, 0, 0).black.bgYellowBright.bold(levelPadded),
            chalk.yellow(message),
         )

      // prettier-ignore
      case 'ERROR':
         return output(
            chalk.rgb(0, 0, 0).black.bgRedBright.bold(levelPadded),
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

export default (dir: string) => {
   const logger = createLogger({
      level: 'info',
      format: format.json(),
      defaultMeta: { service: 'user-service' },
   })

   logger.add(
      new transports.File({
         filename: join(dir, 'combined.log'),
      }),
   )

   logger.add(
      new transports.File({
         filename: join(dir, 'error.log'),
         level: 'error',
      }),
   )

   logger.add(
      new transports.Console({
         // prettier-ignore
         format: combine(
            label({ label: 'elevate' }),
            timestamp(),
            format.splat(),
            coloredFormat),
      }),
   )

   return logger
}
