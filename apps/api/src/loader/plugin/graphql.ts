import { ApolloServer } from 'apollo-server-express'
import {
   makeSchema,
   objectType,
   interfaceType,
   enumType,
   stringArg,
   arg,
   // unionType,
   queryType,
   nonNull,
   list,
} from 'nexus'

import { join } from 'path'
import { Graphql, Plugin, Software, Store } from 'libs/types/Plugin'
import { Context } from '../../context'
import { has, allPass } from 'ramda'

// prettier-ignore
const getStores = (plugins: Plugin[]): Store[] =>
   plugins
      .filter((plugin) => plugin.stores)
      .map(plugin=> plugin.stores)
      .reduce((acc = [], cur = []) => [...acc , ...cur], [])
      || []

export const main = (ctx: Context) => async (plugins: Plugin[]) => {
   try {
      const PlatformType = enumType({
         name: 'PlatformType',
         members: [
            'SUPER_NINTENDO_ENTERTAINMENT_SYSTEM',
            'NINTENDO_ENTERTAINMENT_SYSTEM',
            'WINDOWS_32',
         ],
      })

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
                  if (data.uri?.endsWith('.exe') || data.uri?.endsWith('.app')) return 'EXECUTABLE'
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

      const Program = interfaceType({
         name: 'Program',
         definition(t) {
            t.list.field('patches', {
               type: 'Patch',
            })
            t.list.field('locations', {
               type: 'Location',
            })
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
               return 'Patch'
            }
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

      const PatchType = enumType({
         name: 'PatchType',
         members: ['TRANSLATION', 'VISUAL', 'MECHANICS', 'ENVIRONMENT', 'AUDIO', 'OTHER'],
      })

      const PatchFormat = enumType({
         name: 'PatchFormat',
         members: ['IPS'],
      })

      const Patch = objectType({
         name: 'Patch',
         definition(t) {
            t.implements('Program')
            t.list.field('supports', { type: 'Hash' })
            t.list.field('type', { type: 'PatchType' })
            t.list.field('format', { type: 'PatchFormat' })
         },
      })

      const Software = objectType({
         name: 'Software',
         definition(t) {
            t.implements('Program')
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

      const storeSearch = queryType({
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
            t.list.field('storeSearch', {
               type: 'Program',
               args: { query: stringArg() },
               //    resolve: () => [
               //       {
               //          host: 'WINDOWS_32',
               //          name: 'Mario',
               //          version: '1231',
               //          applications: [
               //             {
               //                name: 'Mario',
               //             },
               //          ],
               //       },
               //       {
               //          name: 'RetroArch',
               //          applications: [
               //             {
               //                name: 'RetroArch',
               //                supports: [
               //                   {
               //                      platforms: ['SUPER_NINTENDO_ENTERTAINMENT_SYSTEM'],
               //                      locations: [
               //                         {
               //                            uri: 'http://google.com/file.zip',
               //                         },
               //                      ],
               //                   },
               //                ],
               //             },
               //          ],
               //       },
               //    ],
               resolve: async (_, { query }, ctx: Context) => {
                  return getStores(plugins).reduce(
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

      const myPlugins: Graphql[] = []

      // TODO: Don't mutate variables
      plugins?.map((plugin) =>
         plugin?.graphql?.map((type) => {
            myPlugins.push(type)
         }),
      )

      const schema = makeSchema({
         types: [
            // StoreSearchResult,
            // Resource,
            // StoreItem,
            Hash,
            Program,
            Patch,
            PatchType,
            PatchFormat,
            LauncherSupport,
            storeSearch,
            Application,
            Launcher,
            Location,
            Software,
            PlatformType,
            File,
            FileType,
            Directory,
            Game,
            ...myPlugins,
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
