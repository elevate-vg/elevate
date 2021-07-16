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

export type Launchable = {
   launch: (arg0: { gamePath: string; launcherPath: string }) => Promise<string> | string
}

export type Software = {
   platform: Platform
   name: string
   version?: string
   applications?: [
      {
         name: string
      },
   ]
   locations?: [
      {
         uri: string
      },
   ]
}

export type Catalog = {
   name: string
   // prettier-ignore
   search:
      (ctx: Context) => 
      (arg0: { query?: string, after?: string, limit?: number }) =>
         Software[] | Promise<Software[]>
}

export enum DownloadableType {
   Launcher = 'launcher',
   Game = 'game',
}
export type Downloadable = {
   type: DownloadableType
   uri: string | ((ctx: Context) => string)
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
