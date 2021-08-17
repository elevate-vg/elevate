/* eslint-disable @typescript-eslint/no-explicit-any */

export * from 'ramda'
import { anyPass, map, has, __, compose as Rcompose, equals, all, flip, when, apply } from 'ramda'

export type SameLength<T extends any[]> = Extract<{ [K in keyof T]: any }, any[]>

export type Curried<A extends any[], R> = <P extends Partial<A>>(
   ...args: P
) => P extends A
   ? R
   : A extends [...SameLength<P>, ...infer S]
   ? S extends any[]
      ? Curried<S, R>
      : never
   : never

export function curry<A extends any[], R>(fn: (...args: A) => R): Curried<A, R> {
   return (...args: any[]): any =>
      args.length >= fn.length ? fn(...(args as any)) : curry((fn as any).bind(undefined, ...args))
}

export const compose = <any>Rcompose

// prettier-ignore
export const allFalse = compose(
   all,
   equals
)(false)

// prettier-ignore
export const hasAny = (props: string[]) => 
   compose(
      anyPass,
      map(has)
   )(props)

export const mapTo = flip(map)

export const objHas = flip(has)

// prettier-ignore
export const hasNone =
   (props: string[]) =>
   (obj: Record<string, any>) =>
      compose(
         allFalse,
         mapTo(props),
         objHas
      )(obj)

// prettier-ignore
export const whenTrue = compose(
    when,
    equals
)(true)

// @ts-expect-error: Ramda placeholder
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const applyOver = (args: any[]) => (fns: any[]) => map(apply(__, args), fns)
