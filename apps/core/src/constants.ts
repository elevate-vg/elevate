import { join } from 'path'

export const packageDir = join(__dirname, '..')
export const baseDir = join(packageDir, '../..')
export const rootDir = (...args: string[]) => join(packageDir, '../..', ...args)
