import { AxiosStatic } from 'axios'
import { Platform, Plugin } from '../../libs/types'
import { Response } from 'express'
import { stringArg, extendType } from 'nexus'
import { Context } from 'apps/api/src/context'
import { Software } from 'libs/types/Plugin'
import { identity, memoizeWith } from 'libs/utils'

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

export const launchers: Plugin.Launcher[] = [
   // {
   //    name: 'snes9x',
   //    platforms: [Platforms.SuperNintendo],
   //    os: [Platforms.Windows10],
   //    launch: ({ gamePath, launcherPath }) => {
   //       return `${launcherPath} --file ${gamePath}`
   //    },
   // },
]

// TODO: memoize based on query, after and limit
const getResource = (axios: AxiosStatic) =>
   // @ts-ignore
   memoizeWith(identity, (url) =>
      axios({
         method: 'GET',
         url,
      }),
   )

export const catalogs: Plugin.Catalog[] = [
   {
      name: 'steam',
      // platforms: [Platforms.Windows10, Platforms.MacOS],
      search:
         ({ axios, cheerio }) =>
         async ({ query, after, limit }) => {
            query
            after
            limit

            const url = 'https://www.darrenstruthers.net/SNES_ROMS'

            const res = await getResource(axios)(url)
            const $ = cheerio.load(res.data)

            return $('tr a')
               .get()
               .reduce((acc, e) => {
                  const filename = $(e).text().trim()
                  const uri = `${url}/${$(e).attr('href')}`
                  const name = filename.replace(/\s\(.*\)\..*$/, '')

                  if (!['.sfc', '.smc'].some((ends) => filename.endsWith(ends))) return acc

                  return [
                     ...acc,
                     {
                        platform: Platform.SUPER_NINTENDO_ENTERTAINMENT_SYSTEM,
                        name,
                        applications: [
                           {
                              name,
                           },
                        ],
                        locations: [{ uri }],
                     },
                  ]
               }, <Software[]>[])
         },
   },
]

export const apis: Plugin.Api[] = [
   {
      name: 'tracks',
      fn: (server) => {
         server.get('/:trackId', (_, res: Response) => {
            res.json({ username: 'Flavio' })
         })

         return server
      },
   },
]
