export type Primitive = bigint | boolean | null | number | string | symbol | undefined

export type JSONValue = Primitive | JSONObject | JSONArray

export interface JSONObject {
   [key: string]: JSONValue
}

export type JSONArray = Array<JSONValue>

export enum Architecture {
   IA32,
   x86_64,
   ARMv7,
   ARM64,
}

export enum Platforms {
   'SUPER_NINTENDO_ENTERTAINMENT_SYSTEM' = 'SUPER_NINTENDO_ENTERTAINMENT_SYSTEM',
   'NINTENDO_ENTERTAINMENT_SYSTEM' = 'NINTENDO_ENTERTAINMENT_SYSTEM',
   'WINDOWS_32' = 'WINDOWS_32',
}

export * as Plugin from './Plugin'
export * as Nexus from './Nexus'
