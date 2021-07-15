import { File as PrismaFile } from 'nexus-prisma'
import { objectType, interfaceType, extendType } from 'nexus'

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
   name: PrismaFile.$name,
   description: PrismaFile.$description,
   isTypeOf(data) {
      // How to know if this is a file or a directory
      return Boolean(typeof data.size === 'number')
   },
   definition(t) {
      t.implements('Location')
      t.int('size')
      t.field(PrismaFile.crc32)
      t.field(PrismaFile.md5)
      t.field(PrismaFile.sha512)
      t.field(PrismaFile.sha256)
      t.field(PrismaFile.sha1)
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
