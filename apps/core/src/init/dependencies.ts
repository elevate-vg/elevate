import { Context } from '../context'
import { curry } from 'libs/utils'
import { DependencyList } from './dependencyList'
import { downloadType } from '../utils'

export const setupDependencies = curry(async (ctx: Context, dependencyList: DependencyList) => {
   let level = 0
   return (
      dependencyList
         .map((group) => {
            return group.filter((obj) => obj.platform === ctx.platform)
         })
         // @ts-expect-error: Need to type reducer function
         .reduce((accumulatorPromise, group) => {
            return accumulatorPromise.then(async () => {
               ctx.logger.verbose(`Init: Downloading group ${level}`)
               const res = await Promise.all(group.map((obj) => downloadType(ctx, obj)))
               ctx.logger.verbose(`Init: Downloading group ${level} complete`)
               level = level + 1
               return res
            })
         }, Promise.resolve())
   )
})
