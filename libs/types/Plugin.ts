import { Platforms } from '.'
import type { PuppeteerNode } from 'puppeteer'
import type { Router } from 'express'

export type Meta = {
   namespace: string
   name: string
   version: string
}

export type Launcher = {
   name: string
   platforms: Platforms[]
   os: string[]
   launch: (arg0: { gamePath: string; launcherPath: string }) => Promise<string> | string
}

export type Store = {
   name: string
   platforms: Platforms[]
   search: (arg0: { puppeteer: PuppeteerNode }) => (arg0: { query: string }) => Promise<any> | any
}

export type Theme = {
   name: string
   directory: string
}

export type Api = {
   name: string
   fn: (arg0: Router) => Router
}

export type Plugin = {
   meta: Meta
   themes?: Theme[]
   stores?: Store[]
   apis?: Api[]
   launchers?: Launcher[]
}

export default Plugin
