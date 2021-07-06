import { ApolloServer } from 'apollo-server-express'
import {
   makeSchema,
   objectType,
   interfaceType,
   enumType,
   stringArg,
   arg,
   queryType,
   nonNull,
   list,
   unionType,
} from 'nexus'

import { join } from 'path'
import { Graphql, Plugin, Software, Library } from 'libs/types/Plugin'
import { Context } from '../../context'
import { has, allPass } from 'ramda'

// prettier-ignore
const getLibraries = (plugins: Plugin[]): Library[] =>
   plugins
      .map(({ libraries = [] }) => libraries)
      .reduce((acc = [], cur = []) => [
         ...acc, 
         ...cur
      ], [])

// prettier-ignore
const getExternalGraphqlTypes = (plugins: Plugin[]): Graphql[]  =>
   plugins.reduce<Graphql[]>((acc, { graphql = [] }) => (
      [...acc, ...graphql]
   ), [])

export const main =
   (ctx: Context) =>
   async (plugins: Plugin[] = []) => {
      try {
         /*****************************************
          * File System
          ******************************************/

         const Location = interfaceType({
            name: 'Location',
            definition(t) {
               t.string('uri')
            },
            resolveType: (data) => {
               if (allPass([has('md5')])(data)) {
                  return 'File'
               } else {
                  return 'Directory'
               }
            },
         })

         const Directory = objectType({
            name: 'Directory',
            definition(t) {
               t.implements('Location')
            },
         })

         const FileType = enumType({
            name: 'FileType',
            members: ['EXECUTABLE', 'ARCHIVE', 'UNKNOWN'],
         })

         const File = objectType({
            name: 'File',
            definition(t) {
               t.implements('Location')
               t.nullable.int('size')
               t.field('type', {
                  type: 'FileType',
                  resolve: (data) => {
                     // TODO: This filetype detection implementation is weak
                     if (data.uri?.endsWith('.exe') || data.uri?.endsWith('.app'))
                        return 'EXECUTABLE'
                     else if (
                        data.uri?.endsWith('.zip') ||
                        data.uri?.endsWith('.tar.gz') ||
                        data.uri?.endsWith('.bz') ||
                        data.uri?.endsWith('.7z')
                     )
                        return 'ARCHIVE'
                     return 'UNKNOWN'
                  },
               })
               t.nullable.string('md5')
               t.nullable.string('sha256')
            },
         })

         const Hash = objectType({
            name: 'Hash',
            definition(t) {
               t.string('crc32')
               t.string('md5')
               t.string('sha512')
               t.string('sha256')
               t.string('sha1')
            },
         })

         /*****************************************
          * Software
          ******************************************/

         const Program = interfaceType({
            name: 'Program',
            definition(t) {
               t.list.field('applications', {
                  type: 'Application',
                  args: {
                     platforms: arg({ type: list(nonNull('PlatformType')) }),
                  },
               })
               t.string('name')
               t.string('version')
            },
            resolveType: (data) => {
               if (allPass([has('platform')])(data)) {
                  return 'Software'
               } else {
                  return 'PatchFile'
               }
            },
         })

         const PatchType = enumType({
            name: 'PatchType',
            members: ['TRANSLATION', 'VISUAL', 'MECHANICS', 'ENVIRONMENT', 'AUDIO', 'OTHER'],
         })

         const PatchCodeFormat = enumType({
            name: 'PatchCodeFormat',
            members: ['GAME_GENIE'],
         })

         const PatchFileFormat = enumType({
            name: 'PatchFileFormat',
            members: ['IPS'],
         })

         const PatchFile = objectType({
            name: 'PatchFile',
            definition(t) {
               t.implements('Program')
               t.implements('Patch')
               t.list.field('format', { type: 'PatchFileFormat' })
            },
         })

         const PatchCode = objectType({
            name: 'PatchCode',
            definition(t) {
               t.list.string('code')
               t.implements('Patch')
               t.list.field('format', { type: 'PatchCodeFormat' })
            },
         })

         const Patch = interfaceType({
            name: 'Patch',
            definition(t) {
               t.list.field('supports', { type: 'Hash' })
               t.list.field('type', { type: 'PatchType' })
            },
            resolveType: (data) => {
               if (allPass([has('code')])(data)) {
                  return 'PatchCode'
               } else {
                  return 'PatchFile'
               }
            },
         })

         // TODO: Add platforms via plugins
         const PlatformType = enumType({
            name: 'PlatformType',
            members: [
               'SUPER_NINTENDO_ENTERTAINMENT_SYSTEM',
               'NINTENDO_ENTERTAINMENT_SYSTEM',
               'WINDOWS_32',
            ],
         })

         const Software = objectType({
            name: 'Software',
            definition(t) {
               t.implements('Program')
               t.list.field('locations', {
                  type: 'Location',
               })
               t.list.field('patches', {
                  type: 'Patch',
               })
               t.field('platform', {
                  type: 'PlatformType',
               })
            },
         })

         const Application = interfaceType({
            name: 'Application',

            definition(t) {
               t.string('name')
               t.list.field('software', {
                  type: 'Software',
                  args: {
                     platforms: arg({ type: list(nonNull('PlatformType')) }),
                  },
                  // TODO: Implement platform filtering
               })
            },
            resolveType: (data) => {
               if (allPass([has('supports')])(data)) {
                  return 'Launcher'
               } else {
                  return 'Game'
               }
            },
         })

         /*****************************************
          * Games
          ******************************************/

         const Game = objectType({
            name: 'Game',

            definition(t) {
               t.implements('Application')
            },
         })

         const LauncherSupport = objectType({
            name: 'LauncherSupport',
            definition(t) {
               t.list.field('platforms', {
                  type: 'PlatformType',
               })
               t.list.field('locations', {
                  type: 'Location',
               })
            },
         })

         const Launcher = objectType({
            name: 'Launcher',
            definition(t) {
               t.implements('Application')
               t.list.field('supports', {
                  type: 'LauncherSupport',
               })
            },
         })

         const LibraryItem = unionType({
            name: 'LibraryItem',
            definition(t) {
               t.members('Software', 'PatchFile', 'PatchCode')
            },
            resolveType: (data) => {
               if (allPass([has('code')])(data)) {
                  return 'PatchCode'
               } else if (allPass([has('platform')])(data)) {
                  return 'Software'
               } else {
                  return 'PatchFile'
               }
            },
         })

         /*****************************************
          * Queries
          ******************************************/

         const libraries = queryType({
            definition(t) {
               t.list.field('games', {
                  type: 'Game',
                  resolve: () => [
                     {
                        __typename: 'Game',
                        name: 'Mario 2',
                        software: [
                           {
                              platform: 'NINTENDO_ENTERTAINMENT_SYSTEM',
                              locations: [{ uri: 'file:///a/b/c.rom' }],
                           },
                           {
                              platform: 'SUPER_NINTENDO_ENTERTAINMENT_SYSTEM',
                              locations: [{ uri: 'file:///d/e/f.rom' }],
                           },
                        ],
                     },
                  ],
               })

               t.list.field('library', {
                  type: 'LibraryItem',
                  resolve: async () => {
                     return [
                        {
                           supports: [{ md5: 'j3k4223j4k' }],
                        },
                        {
                           platform: 'NINTENDO_ENTERTAINMENT_SYSTEM',
                           name: 'Metroid',
                           version: '1.03',
                           applications: [
                              {
                                 name: 'Metroid',
                              },
                           ],
                        },
                     ]
                  },
               })

               t.list.field('libraries', {
                  type: 'Program',
                  args: { query: stringArg() },
                  resolve: async (_, { query }, ctx: Context) => {
                     return getLibraries(plugins).reduce(
                        async (acc, cur) => [
                           ...(await acc),
                           ...(await cur?.search(ctx)({ query: query as string })),
                        ],
                        Promise.resolve(<Software[]>[]),
                     )
                  },
               })
            },
         })

         const schema = makeSchema({
            types: [
               Application,
               Directory,
               File,
               FileType,
               Game,
               Hash,
               Launcher,
               LauncherSupport,
               LibraryItem,
               libraries,
               Location,
               Patch,
               PatchCode,
               PatchCodeFormat,
               PatchFile,
               PatchFileFormat,
               Patch,
               PatchType,
               PlatformType,
               Program,
               Software,
               ...getExternalGraphqlTypes(plugins),
            ],
            outputs:
               process.env.NODE_ENV === 'production'
                  ? {}
                  : {
                       schema: join(__dirname, '../../../../../libs/types/schema.graphql'),
                       typegen: join(__dirname, '../../../../../libs/types/Nexus.ts'),
                    },
         })

         const apollo = new ApolloServer({
            schema,
            context: ctx,
            tracing: true,
            introspection: true, //environment.apollo.introspection,
            playground: true, //environment.apollo.playground
         })

         apollo.applyMiddleware({ app: ctx.express })

         console.log(`🚀 Graphql server started..`)
      } catch (e) {
         console.error(e)
      }

      return ctx.express
   }

export default main
