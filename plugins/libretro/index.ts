import { Plugin, Platform } from '../../libs/types'
// import { Response } from 'express'
import { stringArg, extendType } from 'nexus'
import { Context } from 'apps/api/src/context'
import { DownloadableType, Launchable } from 'libs/types/Plugin'

export const meta: Plugin.Meta = {
   namespace: '@simonwjackson',
   name: 'hello',
   version: '1.0.0',
}

export const graphql: Plugin.Graphql[] = [
   extendType({
      type: 'Query',
      definition(t) {
         t.nullable.string('plugin__simonwjackson__hello', {
            args: { name: stringArg() },
            resolve: async (_, __, ctx: Context) =>
               (await ctx.prisma.user.findFirst())?.name || null,
         })
         t.string('hello', {
            args: { name: stringArg() },
            resolve: (_, { name }) => `Hello ${name || 'World2'}!`,
         })
      },
   }),
]

// bsnes_libretro.dll.zip
// https://buildbot.libretro.com/nightly/windows/x86_64/latest/bsnes_libretro.dll.zip

export type Launchers = Plugin.Launcher | Plugin.Launcher[]

export const launchers: Launchers & Launchable = {
   name: 'bsnes',
   // TODO: Deal with version ranges / catchall
   version: '20210702T17:10',
   platforms: [Platform.SuperNintendo],
   os: [Platform.Windows10],
   launch: ({ gamePath, launcherPath }) => {
      return `${launcherPath} --file ${gamePath} --core`
   },
}

export const libraries: Plugin.Library[] = [
   {
      name: 'libretro',
      search: () => () => {
         console.log('d')
         const results = [
            {
               type: DownloadableType.Launcher,
               uri: () =>
                  'https://buildbot.libretro.com/nightly/windows/x86_64/latest/bsnes_libretro.dll.zip',
               name: 'bsnes',
               version: '20210702T17:10',
               platforms: [Platform.SuperNintendo],
               os: [Platform.Windows10],
            },
         ]

         return results.filter((item) => item.type === DownloadableType.Launcher)
      },
   },
]
