import { hasAny } from 'libs/utils'
import { objectType, interfaceType } from 'nexus'

const Program = interfaceType({
   name: 'Program',
   definition(t) {
      t.list.field('applications', {
         type: 'Application',
         // args: {
         //    platforms: arg({ type: list(nonNull('PlatformType')) }),
         // },
      })
      t.string('title')
      t.string('version')
   },
})

const Software = objectType({
   name: 'Software',
   // prettier-ignore
   isTypeOf: hasAny([
      'title',
      'locations',
   ]),
   definition(t) {
      t.implements('Program')

      // t.list.field('patches', {
      //    type: 'Patch',
      // })
      // t.field('platform', {
      //    type: 'PlatformType',
      // })
   },
})

export const types = [Program, Software]
