import { hasAny } from 'libs/utils'
import { objectType, interfaceType, extendType, enumType } from 'nexus'

const Language = enumType({
   name: 'Language',
   members: [
      'aa',
      'ab',
      'af',
      'ak',
      'sq',
      'am',
      'ar',
      'an',
      'hy',
      'as',
      'av',
      'ae',
      'ay',
      'az',
      'ba',
      'bm',
      'eu',
      'be',
      'bn',
      'bh',
      'bi',
      'bs',
      'br',
      'bg',
      'my',
      'ca',
      'ch',
      'ce',
      'zh',
      'cu',
      'cv',
      'kw',
      'co',
      'cr',
      'cs',
      'da',
      'dv',
      'nl',
      'dz',
      'en',
      'eo',
      'et',
      'ee',
      'fo',
      'fj',
      'fi',
      'fr',
      'fy',
      'ff',
      'ka',
      'de',
      'gd',
      'ga',
      'gl',
      'gv',
      'el',
      'gn',
      'gu',
      'ht',
      'ha',
      'he',
      'hz',
      'hi',
      'ho',
      'hr',
      'hu',
      'ig',
      'is',
      'io',
      'ii',
      'iu',
      'ie',
      'ia',
      'id',
      'ik',
      'it',
      'jv',
      'ja',
      'kl',
      'kn',
      'ks',
      'kr',
      'kk',
      'km',
      'ki',
      'rw',
      'ky',
      'kv',
      'kg',
      'ko',
      'kj',
      'ku',
      'lo',
      'la',
      'lv',
      'li',
      'ln',
      'lt',
      'lb',
      'lu',
      'lg',
      'mk',
      'mh',
      'ml',
      'mi',
      'mr',
      'ms',
      'mg',
      'mt',
      'mn',
      'na',
      'nv',
      'nr',
      'nd',
      'ng',
      'ne',
      'nn',
      'nb',
      'no',
      'ny',
      'oc',
      'oj',
      'or',
      'om',
      'os',
      'pa',
      'fa',
      'pi',
      'pl',
      'pt',
      'ps',
      'qu',
      'rm',
      'ro',
      'rn',
      'ru',
      'sg',
      'sa',
      'si',
      'sk',
      'sl',
      'se',
      'sm',
      'sn',
      'sd',
      'so',
      'st',
      'es',
      'sc',
      'sr',
      'ss',
      'su',
      'sw',
      'sv',
      'ty',
      'ta',
      'tt',
      'te',
      'tg',
      'tl',
      'th',
      'bo',
      'ti',
      'to',
      'tn',
      'ts',
      'tk',
      'tr',
      'tw',
      'ug',
      'uk',
      'ur',
      'uz',
      've',
      'vi',
      'vo',
      'cy',
      'wa',
      'wo',
      'xh',
      'yi',
      'yo',
      'za',
      'zu',
   ],
})

const Application = interfaceType({
   name: 'Application',

   definition(t) {
      t.nonNull.list.field('names', {
         type: 'Translation',
      })
      t.list.field('software', {
         type: 'Software',
         // args: {
         //    platforms: arg({ type: list(nonNull('PlatformType')) }),
         // },
         // TODO: Implement platform filtering
      })
   },
})

const Translation = objectType({
   name: 'Translation',
   definition(t) {
      t.nonNull.string('name')
      t.nonNull.field('language', {
         type: 'Language',
      })
   },
})

const Game = objectType({
   name: 'Game',
   isTypeOf: hasAny(['names']),
   definition(t) {
      t.implements('Application')
   },
})

// const LauncherSupport = objectType({
//    name: 'LauncherSupport',
//    definition(t) {
//       t.list.field('platforms', {
//          type: 'PlatformType',
//       })
//       t.list.field('locations', {
//          type: 'Location',
//       })
//    },
// })

// const Launcher = objectType({
//    name: 'Launcher',
//    definition(t) {
//       t.implements('Application')
//       t.list.field('supports', {
//          type: 'LauncherSupport',
//       })
//    },
// })

// const LibraryItem = unionType({
//    name: 'LibraryItem',
//    definition(t) {
//       t.members('Software') //, 'PatchFile', 'PatchCode')
//    },
//    resolveType: (data) => {
//       // if (allPass([has('code')])(data)) {
//       // return 'PatchCode'
//       // } else
//       if (allPass([has('platform')])(data)) return 'Software'
//       else return null
//       // } else {
//       // return 'PatchFile'
//       // }
//    },
// })

/*****************************************
 * Queries
 ******************************************/

const gamesQuery = extendType({
   type: 'Query',
   definition(t) {
      t.list.field('games', {
         type: 'Game',
         resolve: () => [
            {
               names: [{ name: 'Mario 2', language: 'en' }],
               software: [
                  {
                     titles: [{ name: 'Mario 2', language: 'en' }],
                     // platform: 'NINTENDO_ENTERTAINMENT_SYSTEM',
                     locations: [{ uri: 'file:///a/b/c.rom', size: 0 }],
                  },
                  //    {
                  //       __typename: 'Software',
                  //       // platform: 'SUPER_NINTENDO_ENTERTAINMENT_SYSTEM',
                  //       locations: [{ uri: 'file:///d/e/f.rom' }],
                  //    },
               ],
            },
         ],
      })
   },
})

export const types = [Application, Game, Language, Translation, gamesQuery]
