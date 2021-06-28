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
   SuperNintendo = 'snes',
   Windows10 = 'win10',
   MacOS = 'macos',
}

export * as Plugin from './Plugin'
