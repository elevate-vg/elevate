export type Primitive = bigint | boolean | null | number | string | symbol | undefined

export type JSONValue = Primitive | JSONObject | JSONArray

export interface JSONObject {
   [key: string]: JSONValue
}

export type JSONArray = Array<JSONValue>

export enum Architecture {
   'arm',
   'arm64',
   'armv7',
   'ia32',
   'mips',
   'mipsel',
   'ppc',
   'ppc64',
   's390',
   's390x',
   'x32',
   'x64',
}
export enum Platform {
   'SUPER_NINTENDO_ENTERTAINMENT_SYSTEM',
   'GAME_BOY_ADVANCED',
   'NINTENDO_ENTERTAINMENT_SYSTEM',
   'WINDOWS_32',
   'DARWIN',
   'LINUX',
}

export type LaunchSettingsOptional = {
   fullscreen?: true
   activate?: true
}

export type LaunchSettings = {
   uri: string
   platform: Platform
} & LaunchSettingsOptional

export * as Plugin from './Plugin'
export * as Nexus from './Nexus'
