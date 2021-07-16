import { unionType, extendType } from 'nexus'

const Entry = unionType({
   name: 'Entry',
   description: 'Any container type that can be rendered into the feed',
   definition(t) {
      t.members('Software', 'Game', 'Image', 'Audio', 'Video')
   },
})

const catalogQuery = extendType({
   type: 'Query',
   definition(t) {
      t.list.field('catalog', {
         type: 'Entry',
         resolve: async () => {
            return [
               {
                  width: 100,
                  height: 100,
               },
               {
                  titles: [
                     {
                        name: 'Super Mario All-Stars',
                        language: 'en',
                     },
                  ],
                  locations: [
                     {
                        uri: 'file:///a/b/c.rom',
                        md5: null,
                     },
                  ],
                  applications: [
                     {
                        names: [
                           {
                              name: 'Super Mario Bros.',
                              language: 'en',
                           },
                        ],
                     },
                     {
                        names: [
                           {
                              name: 'Super Mario Bros. 2',
                              language: 'en',
                           },
                        ],
                     },
                     {
                        names: [
                           {
                              name: 'Super Mario Bros. 3',
                              language: 'en',
                           },
                        ],
                     },
                     {
                        names: [
                           {
                              name: 'Super Mario World',
                              language: 'en',
                           },
                        ],
                     },
                  ],
               },
               {
                  names: [
                     {
                        name: 'Super Mario Bros.',
                        language: 'en',
                     },
                  ],
                  software: [
                     {
                        titles: [
                           {
                              name: 'Super Mario All-Stars',
                              language: 'en',
                           },
                        ],
                        locations: [
                           {
                              uri: 'file:///a/b/c.rom',
                              md5: null,
                           },
                        ],
                     },
                  ],
               },
               {
                  names: [
                     {
                        name: 'Super Mario Bros. 2',
                        language: 'en',
                     },
                  ],
                  software: [
                     {
                        titles: [
                           {
                              name: 'Super Mario All-Stars',
                              language: 'en',
                           },
                        ],
                        locations: [
                           {
                              uri: 'file:///a/b/c.rom',
                              md5: null,
                           },
                        ],
                     },
                  ],
               },
               {
                  names: [
                     {
                        name: 'Super Mario Bros. 3',
                        language: 'en',
                     },
                  ],
                  software: [
                     {
                        titles: [
                           {
                              name: 'Super Mario All-Stars',
                              language: 'en',
                           },
                        ],
                        locations: [
                           {
                              uri: 'file:///a/b/c.rom',
                              md5: null,
                           },
                        ],
                     },
                  ],
               },
               {
                  names: [
                     {
                        name: 'Super Mario World',
                        language: 'en',
                     },
                  ],
                  software: [
                     {
                        titles: [
                           {
                              name: 'Super Mario All-Stars',
                              language: 'en',
                           },
                        ],
                        locations: [
                           {
                              uri: 'file:///a/b/c.rom',
                              md5: null,
                           },
                        ],
                     },
                  ],
               },
            ]
         },
      })
   },
})

export const types = [Entry, catalogQuery]
