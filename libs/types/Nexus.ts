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
}

export interface NexusGenScalars {
  String: string
  Int: number
  Float: number
  Boolean: boolean
  ID: string
}

export interface NexusGenObjects {
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
    name?: string | null; // String
    software?: Array<NexusGenRootTypes['Software'] | null> | null; // [Software]
  }
  Query: {};
  Software: { // root type
    applications?: Array<NexusGenRootTypes['Application'] | null> | null; // [Application]
    locations?: Array<NexusGenRootTypes['Location'] | null> | null; // [Location]
    title?: string | null; // String
    version?: string | null; // String
  }
}

export interface NexusGenInterfaces {
  Application: NexusGenRootTypes['Game'];
  Location: NexusGenRootTypes['File'];
  Program: NexusGenRootTypes['Software'];
}

export interface NexusGenUnions {
  Media: NexusGenRootTypes['Game'] | NexusGenRootTypes['Software'];
}

export type NexusGenRootTypes = NexusGenInterfaces & NexusGenObjects & NexusGenUnions

export type NexusGenAllTypes = NexusGenRootTypes & NexusGenScalars

export interface NexusGenFieldTypes {
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
    name: string | null; // String
    software: Array<NexusGenRootTypes['Software'] | null> | null; // [Software]
  }
  Query: { // field return type
    games: Array<NexusGenRootTypes['Game'] | null> | null; // [Game]
    hello: string | null; // String
    library: Array<NexusGenRootTypes['Media'] | null> | null; // [Media]
    plugin__simonwjackson__hello: string | null; // String
  }
  Software: { // field return type
    applications: Array<NexusGenRootTypes['Application'] | null> | null; // [Application]
    locations: Array<NexusGenRootTypes['Location'] | null> | null; // [Location]
    title: string | null; // String
    version: string | null; // String
  }
  Application: { // field return type
    name: string | null; // String
    software: Array<NexusGenRootTypes['Software'] | null> | null; // [Software]
  }
  Location: { // field return type
    uri: string | null; // String
  }
  Program: { // field return type
    applications: Array<NexusGenRootTypes['Application'] | null> | null; // [Application]
    title: string | null; // String
    version: string | null; // String
  }
}

export interface NexusGenFieldTypeNames {
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
    name: 'String'
    software: 'Software'
  }
  Query: { // field return type name
    games: 'Game'
    hello: 'String'
    library: 'Media'
    plugin__simonwjackson__hello: 'String'
  }
  Software: { // field return type name
    applications: 'Application'
    locations: 'Location'
    title: 'String'
    version: 'String'
  }
  Application: { // field return type name
    name: 'String'
    software: 'Software'
  }
  Location: { // field return type name
    uri: 'String'
  }
  Program: { // field return type name
    applications: 'Application'
    title: 'String'
    version: 'String'
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
  Media: "Game" | "Software"
  Application: "Game"
  Location: "File"
  Program: "Software"
}

export interface NexusGenTypeInterfaces {
  File: "Location"
  Game: "Application"
  Software: "Program"
}

export type NexusGenObjectNames = keyof NexusGenObjects;

export type NexusGenInputNames = never;

export type NexusGenEnumNames = never;

export type NexusGenInterfaceNames = keyof NexusGenInterfaces;

export type NexusGenScalarNames = keyof NexusGenScalars;

export type NexusGenUnionNames = keyof NexusGenUnions;

export type NexusGenObjectsUsingAbstractStrategyIsTypeOf = "File" | "Game" | "Software";

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