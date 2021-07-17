import type { Platform } from '.'
import type { Router } from 'express'
import type { NexusExtendTypeDef } from 'nexus/dist/core'
import type { Context } from 'apps/api/src/context'

export type Meta = {
   namespace: string
   name: string
   version: string
}

export type Launcher = {
   name: string
   version: string | number
   platforms: Platform[]
   os: string[]
}

export enum Language {
   'aa' = 'aa',
   'ab' = 'ab',
   'af' = 'af',
   'ak' = 'ak',
   'sq' = 'sq',
   'am' = 'am',
   'ar' = 'ar',
   'an' = 'an',
   'hy' = 'hy',
   'as' = 'as',
   'av' = 'av',
   'ae' = 'ae',
   'ay' = 'ay',
   'az' = 'az',
   'ba' = 'ba',
   'bm' = 'bm',
   'eu' = 'eu',
   'be' = 'be',
   'bn' = 'bn',
   'bh' = 'bh',
   'bi' = 'bi',
   'bs' = 'bs',
   'br' = 'br',
   'bg' = 'bg',
   'my' = 'my',
   'ca' = 'ca',
   'ch' = 'ch',
   'ce' = 'ce',
   'zh' = 'zh',
   'cu' = 'cu',
   'cv' = 'cv',
   'kw' = 'kw',
   'co' = 'co',
   'cr' = 'cr',
   'cs' = 'cs',
   'da' = 'da',
   'dv' = 'dv',
   'nl' = 'nl',
   'dz' = 'dz',
   'en' = 'en',
   'eo' = 'eo',
   'et' = 'et',
   'ee' = 'ee',
   'fo' = 'fo',
   'fj' = 'fj',
   'fi' = 'fi',
   'fr' = 'fr',
   'fy' = 'fy',
   'ff' = 'ff',
   'ka' = 'ka',
   'de' = 'de',
   'gd' = 'gd',
   'ga' = 'ga',
   'gl' = 'gl',
   'gv' = 'gv',
   'el' = 'el',
   'gn' = 'gn',
   'gu' = 'gu',
   'ht' = 'ht',
   'ha' = 'ha',
   'he' = 'he',
   'hz' = 'hz',
   'hi' = 'hi',
   'ho' = 'ho',
   'hr' = 'hr',
   'hu' = 'hu',
   'ig' = 'ig',
   'is' = 'is',
   'io' = 'io',
   'ii' = 'ii',
   'iu' = 'iu',
   'ie' = 'ie',
   'ia' = 'ia',
   'id' = 'id',
   'ik' = 'ik',
   'it' = 'it',
   'jv' = 'jv',
   'ja' = 'ja',
   'kl' = 'kl',
   'kn' = 'kn',
   'ks' = 'ks',
   'kr' = 'kr',
   'kk' = 'kk',
   'km' = 'km',
   'ki' = 'ki',
   'rw' = 'rw',
   'ky' = 'ky',
   'kv' = 'kv',
   'kg' = 'kg',
   'ko' = 'ko',
   'kj' = 'kj',
   'ku' = 'ku',
   'lo' = 'lo',
   'la' = 'la',
   'lv' = 'lv',
   'li' = 'li',
   'ln' = 'ln',
   'lt' = 'lt',
   'lb' = 'lb',
   'lu' = 'lu',
   'lg' = 'lg',
   'mk' = 'mk',
   'mh' = 'mh',
   'ml' = 'ml',
   'mi' = 'mi',
   'mr' = 'mr',
   'ms' = 'ms',
   'mg' = 'mg',
   'mt' = 'mt',
   'mn' = 'mn',
   'na' = 'na',
   'nv' = 'nv',
   'nr' = 'nr',
   'nd' = 'nd',
   'ng' = 'ng',
   'ne' = 'ne',
   'nn' = 'nn',
   'nb' = 'nb',
   'no' = 'no',
   'ny' = 'ny',
   'oc' = 'oc',
   'oj' = 'oj',
   'or' = 'or',
   'om' = 'om',
   'os' = 'os',
   'pa' = 'pa',
   'fa' = 'fa',
   'pi' = 'pi',
   'pl' = 'pl',
   'pt' = 'pt',
   'ps' = 'ps',
   'qu' = 'qu',
   'rm' = 'rm',
   'ro' = 'ro',
   'rn' = 'rn',
   'ru' = 'ru',
   'sg' = 'sg',
   'sa' = 'sa',
   'si' = 'si',
   'sk' = 'sk',
   'sl' = 'sl',
   'se' = 'se',
   'sm' = 'sm',
   'sn' = 'sn',
   'sd' = 'sd',
   'so' = 'so',
   'st' = 'st',
   'es' = 'es',
   'sc' = 'sc',
   'sr' = 'sr',
   'ss' = 'ss',
   'su' = 'su',
   'sw' = 'sw',
   'sv' = 'sv',
   'ty' = 'ty',
   'ta' = 'ta',
   'tt' = 'tt',
   'te' = 'te',
   'tg' = 'tg',
   'tl' = 'tl',
   'th' = 'th',
   'bo' = 'bo',
   'ti' = 'ti',
   'to' = 'to',
   'tn' = 'tn',
   'ts' = 'ts',
   'tk' = 'tk',
   'tr' = 'tr',
   'tw' = 'tw',
   'ug' = 'ug',
   'uk' = 'uk',
   'ur' = 'ur',
   'uz' = 'uz',
   've' = 've',
   'vi' = 'vi',
   'vo' = 'vo',
   'cy' = 'cy',
   'wa' = 'wa',
   'wo' = 'wo',
   'xh' = 'xh',
   'yi' = 'yi',
   'yo' = 'yo',
   'za' = 'za',
   'zu' = 'zu',
}

export type Translation = {
   name: string
   language: Language
}

export type Location = {
   uri: string
}

export type Game = {
   names: Translation[]
}

// prettier-ignore
export type Application = 
   | Game
// | Launcher

export type Software = {
   version?: string
   titles?: Translation[]
   locations?: Location[]
   applications?: Application[]
}

// prettier-ignore
export type Entry =
   | Software
   | Application

export type Catalog = {
   name: string
   // prettier-ignore
   search:
      (ctx: Context) => 
      (args: { 
         query?: string,
         after?: string,
         limit?: number
      }) => 
         | Entry[]
         | Promise<Entry[]>
}

export type Api = {
   name: string
   fn: (arg0: Router) => Router
}

export type Plugin = {
   meta: Meta
   catalogs?: Catalog[]
   apis?: Api[]
   graphql?: Graphql[]
   launchers?: Launcher[]
}

export type Graphql = NexusExtendTypeDef<any>

export default Plugin
