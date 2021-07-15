export * from 'ramda'
import { anyPass, map, has } from 'ramda'

// prettier-ignore
export const hasAny = (arr: string[]) => 
   anyPass(map(has, arr))
