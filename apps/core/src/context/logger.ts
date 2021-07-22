import { join } from 'path'
import winston, { format } from 'winston'
import chalk from 'chalk'

const { combine, timestamp, label, printf } = format

const consoleFormat = printf(({ level, message, label }) => {
   const levelUpper = level.toUpperCase()
   const levelPadded = ' ' + level + ' '

   switch (levelUpper) {
      case 'INFO':
         level = chalk.rgb(0, 0, 0).bgGreenBright.bold(levelPadded)
         break

      case 'WARN':
         message = chalk.yellow(message)
         level = chalk.rgb(0, 0, 0).black.bgYellowBright.bold(levelPadded)
         break

      case 'ERROR':
         message = chalk.red(message)
         level = chalk.rgb(0, 0, 0).black.bgRedBright.bold(levelPadded)
         break

      default:
         break
   }

   return `${chalk.rgb(0, 0, 0).bgBlue.bold(' ' + label + ' ')}${level}  ${message}`
})

export default (dir: string) => {
   const logger = winston.createLogger({
      level: 'info',
      format: winston.format.json(),
      defaultMeta: { service: 'user-service' },
      transports: [
         new winston.transports.File({
            filename: join(dir, 'error.log'),
            level: 'error',
         }),
         new winston.transports.File({
            filename: join(dir, 'combined.log'),
         }),
      ],
   })

   if (process.env.NODE_ENV !== 'production') {
      logger.add(
         new winston.transports.Console({
            format: combine(
               label({ label: 'elevate' }),
               timestamp(),
               format.splat(),
               consoleFormat,
            ),
         }),
      )
   }

   return logger
}
