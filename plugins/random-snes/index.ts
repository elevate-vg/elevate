import { readFile, existsSync } from 'fs'
import { AxiosStatic } from 'axios'
import { /* Platform,*/ Platform, Plugin } from '../../libs/types'
import { Response } from 'express'
import { stringArg, extendType } from 'nexus'
import { Context } from 'apps/core/src/context'
import { Entry, Language } from 'libs/types/Plugin'
import { identity, memoizeWith } from 'libs/utils'

import GoogleImages from 'libs/google-search'
import { cacheFile, tempNameAtCache } from 'libs/utils/io'

// const exampleResult = [
//    {
//       width: 100,
//       height: 100,
//    },
//    {
//       titles: [
//          {
//             name: 'Super Mario All-Stars',
//             language: 'en',
//          },
//       ],
//       locations: [
//          {
//             uri: 'file:///a/b/c.rom',
//             md5: null,
//          },
//       ],
//       applications: [
//          {
//             names: [
//                {
//                   name: 'Super Mario Bros.',
//                   language: 'en',
//                },
//             ],
//          },
//          {
//             names: [
//                {
//                   name: 'Super Mario Bros. 2',
//                   language: 'en',
//                },
//             ],
//          },
//          {
//             names: [
//                {
//                   name: 'Super Mario Bros. 3',
//                   language: 'en',
//                },
//             ],
//          },
//          {
//             names: [
//                {
//                   name: 'Super Mario World',
//                   language: 'en',
//                },
//             ],
//          },
//       ],
//    },
//    {
//       names: [
//          {
//             name: 'Super Mario Bros.',
//             language: 'en',
//          },
//       ],
//       software: [
//          {
//             titles: [
//                {
//                   name: 'Super Mario All-Stars',
//                   language: 'en',
//                },
//             ],
//             locations: [
//                {
//                   uri: 'file:///a/b/c.rom',
//                   md5: null,
//                },
//             ],
//          },
//       ],
//    },
//    {
//       names: [
//          {
//             name: 'Super Mario Bros. 2',
//             language: 'en',
//          },
//       ],
//       software: [
//          {
//             titles: [
//                {
//                   name: 'Super Mario All-Stars',
//                   language: 'en',
//                },
//             ],
//             locations: [
//                {
//                   uri: 'file:///a/b/c.rom',
//                   md5: null,
//                },
//             ],
//          },
//       ],
//    },
//    {
//       names: [
//          {
//             name: 'Super Mario Bros. 3',
//             language: 'en',
//          },
//       ],
//       software: [
//          {
//             titles: [
//                {
//                   name: 'Super Mario All-Stars',
//                   language: 'en',
//                },
//             ],
//             locations: [
//                {
//                   uri: 'file:///a/b/c.rom',
//                   md5: null,
//                },
//             ],
//          },
//       ],
//    },
//    {
//       names: [
//          {
//             name: 'Super Mario World',
//             language: 'en',
//          },
//       ],
//       software: [
//          {
//             titles: [
//                {
//                   name: 'Super Mario All-Stars',
//                   language: 'en',
//                },
//             ],
//             locations: [
//                {
//                   uri: 'file:///a/b/c.rom',
//                   md5: null,
//                },
//             ],
//          },
//       ],
//    },
// ]

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
   memoizeWith(
      // @ts-expect-error: Ramda false positive
      identity,
      (url) =>
         axios({
            method: 'GET',
            url,
         }),
   )

export const catalogs: Plugin.Catalog[] = [
   {
      name: 'steam',
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
                        titles: [
                           {
                              name,
                              language: Language.en,
                           },
                        ],
                        platforms: [Platform.SUPER_NINTENDO_ENTERTAINMENT_SYSTEM],
                        locations: [
                           {
                              uri,
                              md5: null,
                           },
                        ],
                     },
                  ]
               }, <Entry[]>[])
         },
   },
]

export const apis: Plugin.Api[] = [
   // HACK: This API is only here to quickly get images working
   {
      name: 'tracks',
      fn: (ctx, server) => {
         server.get('/_depricated_GetFirstCoverArt/:query', async (req, res) => {
            const localPath = tempNameAtCache(ctx.paths.cache, req.url)

            if (existsSync(localPath))
               return readFile(localPath, function (err, data) {
                  if (err) {
                     res.send("Oops! Couldn't find that file.")
                  } else {
                     res.contentType('image/png')
                     // res.set('Cache-Control', 'no-store')
                     res.send(data)
                  }
                  res.end()
               })

            const client = GoogleImages(
               'ca4d102ef74f30553',
               'AIzaSyCR-BEEZa8AWoIYiP9DtmeyZ-FRsgdxc48',
            )

            const imgUrl = await client(req.params.query).then((json) =>
               json.items
                  .map((item) => item?.pagemap?.cse_image?.[0]?.src)
                  .find((str) =>
                     (str || '').startsWith('https://www.mobygames.com/images/covers/'),
                  ),
            )

            const localImagePath = await cacheFile(ctx, imgUrl, req.url)

            return readFile(localImagePath, function (err, data) {
               if (err) {
                  res.send("Oops! Couldn't find that file.")
               } else {
                  res.contentType('image/png')
                  // res.set('Cache-Control', 'no-store')
                  res.send(data)
               }
               res.end()
            })
         })

         return server
      },
   },
]
