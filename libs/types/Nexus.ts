/**
 * This file was generated by Nexus Schema
 * Do not make changes to this file directly
 */







declare global {
  interface NexusGen extends NexusGenTypes {}
}

export interface NexusGenInputs {
}

export interface NexusGenEnums {
  Language: "aa" | "ab" | "ae" | "af" | "ak" | "am" | "an" | "ar" | "as" | "av" | "ay" | "az" | "ba" | "be" | "bg" | "bh" | "bi" | "bm" | "bn" | "bo" | "br" | "bs" | "ca" | "ce" | "ch" | "co" | "cr" | "cs" | "cu" | "cv" | "cy" | "da" | "de" | "dv" | "dz" | "ee" | "el" | "en" | "eo" | "es" | "et" | "eu" | "fa" | "ff" | "fi" | "fj" | "fo" | "fr" | "fy" | "ga" | "gd" | "gl" | "gn" | "gu" | "gv" | "ha" | "he" | "hi" | "ho" | "hr" | "ht" | "hu" | "hy" | "hz" | "ia" | "id" | "ie" | "ig" | "ii" | "ik" | "io" | "is" | "it" | "iu" | "ja" | "jv" | "ka" | "kg" | "ki" | "kj" | "kk" | "kl" | "km" | "kn" | "ko" | "kr" | "ks" | "ku" | "kv" | "kw" | "ky" | "la" | "lb" | "lg" | "li" | "ln" | "lo" | "lt" | "lu" | "lv" | "mg" | "mh" | "mi" | "mk" | "ml" | "mn" | "mr" | "ms" | "mt" | "my" | "na" | "nb" | "nd" | "ne" | "ng" | "nl" | "nn" | "no" | "nr" | "nv" | "ny" | "oc" | "oj" | "om" | "or" | "os" | "pa" | "pi" | "pl" | "ps" | "pt" | "qu" | "rm" | "rn" | "ro" | "ru" | "rw" | "sa" | "sc" | "sd" | "se" | "sg" | "si" | "sk" | "sl" | "sm" | "sn" | "so" | "sq" | "sr" | "ss" | "st" | "su" | "sv" | "sw" | "ta" | "te" | "tg" | "th" | "ti" | "tk" | "tl" | "tn" | "to" | "tr" | "ts" | "tt" | "tw" | "ty" | "ug" | "uk" | "ur" | "uz" | "ve" | "vi" | "vo" | "wa" | "wo" | "xh" | "yi" | "yo" | "za" | "zh" | "zu"
}

export interface NexusGenScalars {
  String: string
  Int: number
  Float: number
  Boolean: boolean
  ID: string
}

export interface NexusGenObjects {
  Audio: { // root type
    duration?: number | null; // Float
  }
  File: { // root type
    crc32?: string | null; // String
    md5?: string | null; // String
    sha1?: string | null; // String
    sha256?: string | null; // String
    sha512?: string | null; // String
    size?: number | null; // Int
    uri?: string | null; // String
  }
  Game: { // root type
    names: Array<NexusGenRootTypes['Translation'] | null>; // [Translation]!
    software?: Array<NexusGenRootTypes['Software'] | null> | null; // [Software]
  }
  Image: { // root type
    height?: number | null; // Int
    width?: number | null; // Int
  }
  Query: {};
  Software: { // root type
    applications?: Array<NexusGenRootTypes['Application'] | null> | null; // [Application]
    locations?: Array<NexusGenRootTypes['Location'] | null> | null; // [Location]
    titles: Array<NexusGenRootTypes['Translation'] | null>; // [Translation]!
    version?: string | null; // String
  }
  Translation: { // root type
    language: NexusGenEnums['Language']; // Language!
    name: string; // String!
  }
  Video: { // root type
    duration?: number | null; // Float
    fps?: number | null; // Float
    height?: number | null; // Int
    width?: number | null; // Int
  }
}

export interface NexusGenInterfaces {
  Application: NexusGenRootTypes['Game'];
  Audible: NexusGenRootTypes['Audio'] | NexusGenRootTypes['Video'];
  Location: NexusGenRootTypes['File'];
  Program: NexusGenRootTypes['Software'];
  Visual: NexusGenRootTypes['Image'] | NexusGenRootTypes['Video'];
}

export interface NexusGenUnions {
  Entry: NexusGenRootTypes['Audio'] | NexusGenRootTypes['Game'] | NexusGenRootTypes['Image'] | NexusGenRootTypes['Software'] | NexusGenRootTypes['Video'];
}

export type NexusGenRootTypes = NexusGenInterfaces & NexusGenObjects & NexusGenUnions

export type NexusGenAllTypes = NexusGenRootTypes & NexusGenScalars & NexusGenEnums

export interface NexusGenFieldTypes {
  Audio: { // field return type
    duration: number | null; // Float
  }
  File: { // field return type
    crc32: string | null; // String
    md5: string | null; // String
    sha1: string | null; // String
    sha256: string | null; // String
    sha512: string | null; // String
    size: number | null; // Int
    uri: string | null; // String
  }
  Game: { // field return type
    names: Array<NexusGenRootTypes['Translation'] | null>; // [Translation]!
    software: Array<NexusGenRootTypes['Software'] | null> | null; // [Software]
  }
  Image: { // field return type
    height: number | null; // Int
    ratio: number | null; // Float
    width: number | null; // Int
  }
  Query: { // field return type
    games: Array<NexusGenRootTypes['Game'] | null> | null; // [Game]
    hello: string | null; // String
    library: Array<NexusGenRootTypes['Entry'] | null> | null; // [Entry]
    plugin__simonwjackson__hello: string | null; // String
  }
  Software: { // field return type
    applications: Array<NexusGenRootTypes['Application'] | null> | null; // [Application]
    locations: Array<NexusGenRootTypes['Location'] | null> | null; // [Location]
    titles: Array<NexusGenRootTypes['Translation'] | null>; // [Translation]!
    version: string | null; // String
  }
  Translation: { // field return type
    language: NexusGenEnums['Language']; // Language!
    name: string; // String!
  }
  Video: { // field return type
    duration: number | null; // Float
    fps: number | null; // Float
    height: number | null; // Int
    ratio: number | null; // Float
    width: number | null; // Int
  }
  Application: { // field return type
    names: Array<NexusGenRootTypes['Translation'] | null>; // [Translation]!
    software: Array<NexusGenRootTypes['Software'] | null> | null; // [Software]
  }
  Audible: { // field return type
    duration: number | null; // Float
  }
  Location: { // field return type
    uri: string | null; // String
  }
  Program: { // field return type
    applications: Array<NexusGenRootTypes['Application'] | null> | null; // [Application]
    titles: Array<NexusGenRootTypes['Translation'] | null>; // [Translation]!
    version: string | null; // String
  }
  Visual: { // field return type
    height: number | null; // Int
    ratio: number | null; // Float
    width: number | null; // Int
  }
}

export interface NexusGenFieldTypeNames {
  Audio: { // field return type name
    duration: 'Float'
  }
  File: { // field return type name
    crc32: 'String'
    md5: 'String'
    sha1: 'String'
    sha256: 'String'
    sha512: 'String'
    size: 'Int'
    uri: 'String'
  }
  Game: { // field return type name
    names: 'Translation'
    software: 'Software'
  }
  Image: { // field return type name
    height: 'Int'
    ratio: 'Float'
    width: 'Int'
  }
  Query: { // field return type name
    games: 'Game'
    hello: 'String'
    library: 'Entry'
    plugin__simonwjackson__hello: 'String'
  }
  Software: { // field return type name
    applications: 'Application'
    locations: 'Location'
    titles: 'Translation'
    version: 'String'
  }
  Translation: { // field return type name
    language: 'Language'
    name: 'String'
  }
  Video: { // field return type name
    duration: 'Float'
    fps: 'Float'
    height: 'Int'
    ratio: 'Float'
    width: 'Int'
  }
  Application: { // field return type name
    names: 'Translation'
    software: 'Software'
  }
  Audible: { // field return type name
    duration: 'Float'
  }
  Location: { // field return type name
    uri: 'String'
  }
  Program: { // field return type name
    applications: 'Application'
    titles: 'Translation'
    version: 'String'
  }
  Visual: { // field return type name
    height: 'Int'
    ratio: 'Float'
    width: 'Int'
  }
}

export interface NexusGenArgTypes {
  Query: {
    hello: { // args
      name?: string | null; // String
    }
    plugin__simonwjackson__hello: { // args
      name?: string | null; // String
    }
  }
}

export interface NexusGenAbstractTypeMembers {
  Entry: "Audio" | "Game" | "Image" | "Software" | "Video"
  Application: "Game"
  Audible: "Audio" | "Video"
  Location: "File"
  Program: "Software"
  Visual: "Image" | "Video"
}

export interface NexusGenTypeInterfaces {
  Audio: "Audible"
  File: "Location"
  Game: "Application"
  Image: "Visual"
  Software: "Program"
  Video: "Audible" | "Visual"
}

export type NexusGenObjectNames = keyof NexusGenObjects;

export type NexusGenInputNames = never;

export type NexusGenEnumNames = keyof NexusGenEnums;

export type NexusGenInterfaceNames = keyof NexusGenInterfaces;

export type NexusGenScalarNames = keyof NexusGenScalars;

export type NexusGenUnionNames = keyof NexusGenUnions;

export type NexusGenObjectsUsingAbstractStrategyIsTypeOf = "Audio" | "File" | "Game" | "Image" | "Software" | "Video";

export type NexusGenAbstractsUsingStrategyResolveType = never;

export type NexusGenFeaturesConfig = {
  abstractTypeStrategies: {
    isTypeOf: true
    __typename: false
    resolveType: false
  }
}

export interface NexusGenTypes {
  context: any;
  inputTypes: NexusGenInputs;
  rootTypes: NexusGenRootTypes;
  inputTypeShapes: NexusGenInputs & NexusGenEnums & NexusGenScalars;
  argTypes: NexusGenArgTypes;
  fieldTypes: NexusGenFieldTypes;
  fieldTypeNames: NexusGenFieldTypeNames;
  allTypes: NexusGenAllTypes;
  typeInterfaces: NexusGenTypeInterfaces;
  objectNames: NexusGenObjectNames;
  inputNames: NexusGenInputNames;
  enumNames: NexusGenEnumNames;
  interfaceNames: NexusGenInterfaceNames;
  scalarNames: NexusGenScalarNames;
  unionNames: NexusGenUnionNames;
  allInputTypes: NexusGenTypes['inputNames'] | NexusGenTypes['enumNames'] | NexusGenTypes['scalarNames'];
  allOutputTypes: NexusGenTypes['objectNames'] | NexusGenTypes['enumNames'] | NexusGenTypes['unionNames'] | NexusGenTypes['interfaceNames'] | NexusGenTypes['scalarNames'];
  allNamedTypes: NexusGenTypes['allInputTypes'] | NexusGenTypes['allOutputTypes']
  abstractTypes: NexusGenTypes['interfaceNames'] | NexusGenTypes['unionNames'];
  abstractTypeMembers: NexusGenAbstractTypeMembers;
  objectsUsingAbstractStrategyIsTypeOf: NexusGenObjectsUsingAbstractStrategyIsTypeOf;
  abstractsUsingStrategyResolveType: NexusGenAbstractsUsingStrategyResolveType;
  features: NexusGenFeaturesConfig;
}


declare global {
  interface NexusGenPluginTypeConfig<TypeName extends string> {
  }
  interface NexusGenPluginInputTypeConfig<TypeName extends string> {
  }
  interface NexusGenPluginFieldConfig<TypeName extends string, FieldName extends string> {
  }
  interface NexusGenPluginInputFieldConfig<TypeName extends string, FieldName extends string> {
  }
  interface NexusGenPluginSchemaConfig {
  }
  interface NexusGenPluginArgConfig {
  }
}