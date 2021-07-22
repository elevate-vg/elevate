import { join } from 'path'
import { createLogger, format, transports } from 'winston'
import { console as prettyConsole } from 'libs/winston-transports'

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

   logger.add(prettyConsole)

   return logger
}
