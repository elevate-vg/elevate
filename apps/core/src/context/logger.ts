import type { Curry } from 'Function/Curry'
import { join } from 'path'
import winston, { createLogger, format, transports } from 'winston'
import { console as prettyConsole } from 'libs/winston-transports'
import { compose, curry, fromPairs, map, toPairs } from 'libs/utils'

type logger = (message: string) => void
type tappedLogger = Curry<(message: string, value: unknown) => unknown>

type loggers = {
   error: logger
   warn: logger
   info: logger
   http: logger
   verbose: logger
   debug: logger
   silly: logger
}

type tappedLoggers = {
   error: tappedLogger
   warn: tappedLogger
   info: tappedLogger
   http: tappedLogger
   verbose: tappedLogger
   debug: tappedLogger
   silly: tappedLogger
}

export default (dir: string) => {
   const winston = createLogger({
      level: 'verbose',
      format: format.json(),
      defaultMeta: { service: 'user-service' },
   })

   winston.add(
      new transports.File({
         filename: join(dir, 'combined.log'),
      }),
   )

   winston.add(
      new transports.File({
         filename: join(dir, 'error.log'),
         level: 'error',
      }),
   )

   winston.add(prettyConsole)

   const logTypes = ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']

   // @ts-ignore
   const loggerPairs: [type: string, logger: (message: string) => winston.Logger] = map(
      (type: string) => [type, (message: string) => winston.log(type, message)],
   )(logTypes)

   // @ts-ignore
   const loggers: loggers = fromPairs(loggerPairs)

   // prettier-ignore
   // @ts-ignore
   const tapLoggers: tappedLoggers = compose(
      // @ts-ignore
      fromPairs,
      map(([type, logger]: [type: string, logger: (message: string) => winston.Logger]) => {
         return [type, curry((message: string, value: unknown) => {
            logger(message)
            return value
         })]
      }),
      toPairs
      // @ts-ignore
   )(loggers)

   return {
      ...loggers,
      tap: tapLoggers,
   }
}
