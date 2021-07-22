import { join } from 'path'

export const packageDir = join(__dirname, '..')
export const baseDir = join(packageDir, '../..')
export const rootDir = (...args: string[]) => {
   switch (process.env.NODE_ENV) {
      case 'development': {
         return join(__dirname, '../../..', ...args)
      }
      case 'production':
      default: {
         return join(__dirname, ...args)
      }
   }
}
