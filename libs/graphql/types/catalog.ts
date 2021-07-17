import { unionType } from 'nexus'

const Entry = unionType({
   name: 'Entry',
   description: 'Any container type that can be rendered into the feed',
   definition(t) {
      t.members('Software', 'Game', 'Image', 'Audio', 'Video')
   },
})

export const types = [Entry]
