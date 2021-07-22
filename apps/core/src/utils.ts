import type { Context } from './context'
import { applyTo, compose, juxt } from 'libs/utils'

// prettier-ignore
export const initFns = 
   (ctx: Context) =>
   (platform: NodeJS.Platform) =>
   (fns: any[]) =>
   compose(
      applyTo(platform),
      juxt,
      juxt(fns),
      // @ts-ignore
   )(ctx)
