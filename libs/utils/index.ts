export * from 'ramda'
import { anyPass, map, has, __, compose, equals, all, flip } from 'ramda'

export const allFalse = all(equals(false))

// prettier-ignore
export const hasAny = (props: string[]) => 
   anyPass(map(has, props))

export const mapTo = flip(map)

export const objHas = flip(has)

// prettier-ignore
export const hasNone =
   (props: string[]) =>
   (obj: Record<string, any>) =>
      compose(
         allFalse,
         // @ts-ignore
         mapTo(props),
         // @ts-ignore
         objHas
      // @ts-ignore
      )(obj)
