import { hasAny, hasNone } from 'libs/utils'
import { objectType, interfaceType } from 'nexus'

const Visual = interfaceType({
   name: 'Visual',
   definition(t) {
      t.int('width')
      t.int('height')
      t.float('ratio', {
         resolve: (data) => {
            // prettier-ignore
            if (data?.width && data?.height) 
              return data?.width / data?.height

            return null
         },
      })
   },
})

const Audible = interfaceType({
   name: 'Audible',
   definition(t) {
      t.float('duration')
   },
})

const Image = objectType({
   name: 'Image',
   isTypeOf: hasNone(['duration']),
   definition(t) {
      t.implements('Visual')
   },
})

const Video = objectType({
   name: 'Video',
   isTypeOf: hasAny(['fps']),
   definition(t) {
      t.implements('Visual')
      t.implements('Audible')
      t.float('fps')
   },
})

const Audio = objectType({
   name: 'Audio',
   isTypeOf: hasNone(['fps', 'width', 'height', 'ratio']),
   definition(t) {
      t.implements('Audible')
   },
})

export const types = [Visual, Audible, Image, Video, Audio]
