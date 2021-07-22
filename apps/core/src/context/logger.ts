import { join } from 'path'
import winston from 'winston'

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
            format: winston.format.simple(),
         }),
      )
   }

   return logger
}
