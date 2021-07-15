import { hasAny } from 'libs/utils'
import { objectType, interfaceType, extendType } from 'nexus'

const Application = interfaceType({
   name: 'Application',

   definition(t) {
      t.string('name')
      t.list.field('software', {
         type: 'Software',
         // args: {
         //    platforms: arg({ type: list(nonNull('PlatformType')) }),
         // },
         // TODO: Implement platform filtering
      })
   },
})

const Game = objectType({
   name: 'Game',
   isTypeOf: hasAny(['name']),
   definition(t) {
      t.implements('Application')
   },
})

// const LauncherSupport = objectType({
//    name: 'LauncherSupport',
//    definition(t) {
//       t.list.field('platforms', {
//          type: 'PlatformType',
//       })
//       t.list.field('locations', {
//          type: 'Location',
//       })
//    },
// })

// const Launcher = objectType({
//    name: 'Launcher',
//    definition(t) {
//       t.implements('Application')
//       t.list.field('supports', {
//          type: 'LauncherSupport',
//       })
//    },
// })

// const LibraryItem = unionType({
//    name: 'LibraryItem',
//    definition(t) {
//       t.members('Software') //, 'PatchFile', 'PatchCode')
//    },
//    resolveType: (data) => {
//       // if (allPass([has('code')])(data)) {
//       // return 'PatchCode'
//       // } else
//       if (allPass([has('platform')])(data)) return 'Software'
//       else return null
//       // } else {
//       // return 'PatchFile'
//       // }
//    },
// })

/*****************************************
 * Queries
 ******************************************/

const gamesQuery = extendType({
   type: 'Query',
   definition(t) {
      t.list.field('games', {
         type: 'Game',
         resolve: () => [
            {
               __typename: 'Game',
               name: 'Mario 2',
               software: [
                  {
                     // platform: 'NINTENDO_ENTERTAINMENT_SYSTEM',
                     locations: [{ uri: 'file:///a/b/c.rom', size: 0 }],
                  },
                  //    {
                  //       __typename: 'Software',
                  //       // platform: 'SUPER_NINTENDO_ENTERTAINMENT_SYSTEM',
                  //       locations: [{ uri: 'file:///d/e/f.rom' }],
                  //    },
               ],
            },
         ],
      })
   },
})

export const types = [Application, Game, gamesQuery]
