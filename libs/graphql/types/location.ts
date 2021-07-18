import { objectType, interfaceType, extendType } from 'nexus'
import { hasAny } from 'libs/utils'

const Location = interfaceType({
   name: 'Location',
   definition(t) {
      t.string('uri')
   },
})

// const Directory = objectType({
//    name: 'Directory',
//    definition(t) {
//       t.implements('Location')
//    },
// })

// const FileType = enumType({
//    name: 'FileType',
//    members: ['EXECUTABLE', 'ARCHIVE', 'UNKNOWN'],
// })

const File = objectType({
   name: 'File',
   isTypeOf: hasAny(['crc32', 'md5', 'sha512', 'sha256', 'sha1', 'size']),
   definition(t) {
      t.implements('Location')
      t.int('size')
      t.string('crc32')
      t.string('md5')
      t.string('sha512')
      t.string('sha256')
      t.string('sha1')
      // t.field('type', {
      //    type: 'FileType',
      //    resolve: (data) => {
      //       // TODO: This filetype detection implementation is weak
      //       if (data.uri?.endsWith('.exe') || data.uri?.endsWith('.app'))
      //          return 'EXECUTABLE'
      //       else if (
      //          data.uri?.endsWith('.zip') ||
      //          data.uri?.endsWith('.tar.gz') ||
      //          data.uri?.endsWith('.bz') ||
      //          data.uri?.endsWith('.7z')
      //       )
      //          return 'ARCHIVE'
      //       return 'UNKNOWN'
      //    },
      // })
   },
})

const Software = extendType({
   type: 'Software',
   definition(t) {
      t.list.field('locations', {
         type: 'Location',
      })
   },
})

export const types = [File, Location, Software]
