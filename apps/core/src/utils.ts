import type { Context } from './context'
import {
   append,
   applyTo,
   // call,
   compose,
   curry,
   equals,
   // ifElse,
   // equals,
   // isNil,
   juxt,
   when,
   // path,
   // unless,
   // when
} from 'libs/utils'
import { mkdirSync } from 'fs'

// prettier-ignore
export const initFns = 
   (ctx: Context) =>
   (platform: NodeJS.Platform) =>
   (fns: any[]) =>
   compose(
      applyTo(platform),
      juxt,
      juxt(fns),
   )(ctx)

export type environment = 'production' | 'development'

export const isFunction = <T>(fn: T) => {
   if (typeof fn === 'function') {
      return true
   }
   return false
}

export const whenProduction = (fn: () => void) => {
   switch (process.env.NODE_ENV as environment) {
      case 'production': {
         return fn()
      }
      default: {
         return
      }
   }
}

// prettier-ignore
export const appendWhenTrue = curry((
    bool: boolean | undefined,
    toAppend: string, 
    arr: string[]) =>
    when(
       () => equals(true, bool), 
       append(toAppend), 
       arr
    ),
)

export const touchDir = (dir: string) => {
   try {
      mkdirSync(dir)
   } catch (e) {
      // TODO: Better fail support, ex: permissions errors
   }

   return dir
}
