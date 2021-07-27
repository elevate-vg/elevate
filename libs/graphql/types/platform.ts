import { enumType } from 'nexus'
import { Platform } from 'libs/types'

// TODO: Add platforms via plugins
export const PlatformEnum = enumType({
   name: 'Platform',
   members: Platform,
})

// const PlatformUnion = unionType({
//    name: 'PlatformUnion',
//    definition(t) {
//       t.members('Platform', 'PlatformType', 'Card')
//    },
//    resolveType: (item) => (typeof item === 'string' ? 'PlatformType' : 'Platform'),
// })

export const types = [PlatformEnum]
