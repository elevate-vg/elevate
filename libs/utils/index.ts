/* eslint-disable @typescript-eslint/no-explicit-any */

export * from 'ramda'
import { anyPass, map, has, __, compose as Rcompose, equals, all, flip, when } from 'ramda'

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
