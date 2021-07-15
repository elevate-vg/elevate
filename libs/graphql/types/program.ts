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
      t.string('name')
      t.string('version')
   },
})

const Software = objectType({
   name: 'Software',
   isTypeOf: (data) => {
      console.log(data, Boolean(data.locations))
      return Boolean(data.locations)
   },
   definition(t) {
      t.implements('Program')
      t.list.field('locations', {
         type: 'Location',
      })
      // t.list.field('patches', {
      //    type: 'Patch',
      // })
      // t.field('platform', {
      //    type: 'PlatformType',
      // })
   },
})

export const types = [Program, Software]
