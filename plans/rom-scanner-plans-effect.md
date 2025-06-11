# ROM Scanner Implementation Plans (Effect + Zod)

## Overview

This document outlines 3 different approaches for implementing a ROM scanner that generates YAML metadata files for the Elevate game launcher. Each plan uses Effect for functional programming patterns and Zod for runtime type validation and schema-first design.

---

## Plan 1: Simple Local Scanner

### Approach
A lightweight, filesystem-based scanner using Effect's functional patterns and Zod schemas for type safety and validation.

### Core Schemas

```typescript
import { z } from 'zod';

// Base schemas
export const PlatformSchema = z.enum([
  'nes', 'snes', 'gb', 'gbc', 'gba', 'n64', 
  'genesis', 'ps1', 'psp', 'nds'
]);

export const RegionSchema = z.enum([
  'USA', 'Europe', 'Japan', 'World', 'Unknown'
]);

export const RomFileSchema = z.object({
  filename: z.string(),
  path: z.string(),
  extension: z.string(),
  fileSize: z.number(),
  lastModified: z.date(),
});

export const LocalRomMetadataSchema = z.object({
  filename: z.string(),
  path: z.string(),
  platform: PlatformSchema,
  title: z.string(),
  region: RegionSchema,
  revision: z.string().nullable(),
  fileSize: z.number(),
  lastModified: z.date(),
  checksum: z.string(),
});

export const ImagePathsSchema = z.object({
  cover: z.string().nullable(),
  screenshot: z.string().nullable(),
  logo: z.string().nullable(),
});

export const GameEntrySchema = z.object({
  id: z.string(),
  title: z.string(),
  platform: PlatformSchema,
  region: RegionSchema,
  path: z.string(),
  fileSize: z.number(),
  lastModified: z.string(), // ISO date string for YAML
  checksum: z.string(),
  images: ImagePathsSchema,
  metadata: z.object({
    revision: z.string().nullable(),
    language: z.string().nullable(),
    genre: z.string().nullable(),
    developer: z.string().nullable(),
    releaseYear: z.number().nullable(),
  }),
});

export const ScannerConfigSchema = z.object({
  scanPaths: z.array(z.string()),
  supportedExtensions: z.array(z.string()),
  imagePatterns: z.array(z.string()),
  excludePatterns: z.array(z.string()).optional(),
});

// Type inference
export type Platform = z.infer<typeof PlatformSchema>;
export type Region = z.infer<typeof RegionSchema>;
export type RomFile = z.infer<typeof RomFileSchema>;
export type LocalRomMetadata = z.infer<typeof LocalRomMetadataSchema>;
export type ImagePaths = z.infer<typeof ImagePathsSchema>;
export type GameEntry = z.infer<typeof GameEntrySchema>;
export type ScannerConfig = z.infer<typeof ScannerConfigSchema>;
```

### Functional Implementation with Effect

```typescript
import { Effect, pipe, flow, Option, Array, Either } from 'effect';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { createHash } from 'node:crypto';
import * as yaml from 'js-yaml';

// Pure functions for data transformation
const cleanTitle = (filename: string): string => {
  return filename
    .replace(/\.[^.]+$/, '') // Remove extension
    .replace(/\s*\([^)]*\)/g, '') // Remove parentheses content
    .replace(/\s*\[[^\]]*\]/g, '') // Remove brackets content
    .trim();
};

const extractRegion = (filename: string): Region => {
  const regionPatterns: Record<string, Region> = {
    '\\(USA\\)': 'USA',
    '\\(U\\)': 'USA',
    '\\(Europe\\)': 'Europe',
    '\\(E\\)': 'Europe',
    '\\(Japan\\)': 'Japan',
    '\\(J\\)': 'Japan',
    '\\(World\\)': 'World',
  };
  
  for (const [pattern, region] of Object.entries(regionPatterns)) {
    if (new RegExp(pattern).test(filename)) {
      return region;
    }
  }
  
  return 'Unknown';
};

const extractRevision = (filename: string): string | null => {
  const revMatch = filename.match(/\((?:Rev|v)\s*([^)]+)\)/i);
  return revMatch ? revMatch[1] : null;
};

const inferPlatformFromExtension = (ext: string): Option.Option<Platform> => {
  const extensionMap: Record<string, Platform> = {
    '.nes': 'nes',
    '.sfc': 'snes',
    '.smc': 'snes',
    '.gb': 'gb',
    '.gbc': 'gbc',
    '.gba': 'gba',
    '.n64': 'n64',
    '.z64': 'n64',
    '.gen': 'genesis',
    '.md': 'genesis',
    '.iso': 'ps1',
    '.pbp': 'psp',
    '.nds': 'nds',
  };
  
  return Option.fromNullable(extensionMap[ext.toLowerCase()]);
};

// File system operations as Effects
const readDirectory = (dirPath: string): Effect.Effect<string[], Error> =>
  Effect.tryPromise({
    try: () => fs.readdir(dirPath),
    catch: (error) => new Error(`Failed to read directory: ${error}`),
  });

const getFileStats = (filePath: string): Effect.Effect<fs.Stats, Error> =>
  Effect.tryPromise({
    try: () => fs.stat(filePath),
    catch: (error) => new Error(`Failed to get file stats: ${error}`),
  });

const calculateChecksum = (filePath: string): Effect.Effect<string, Error> =>
  Effect.tryPromise({
    try: async () => {
      const fileBuffer = await fs.readFile(filePath);
      return createHash('md5').update(fileBuffer).digest('hex');
    },
    catch: (error) => new Error(`Failed to calculate checksum: ${error}`),
  });

// Recursive directory scanning
const scanDirectoryRecursive = (
  dirPath: string,
  config: ScannerConfig
): Effect.Effect<RomFile[], Error> => {
  const isRomFile = (filename: string): boolean => {
    const ext = path.extname(filename).toLowerCase();
    return config.supportedExtensions.includes(ext);
  };

  const processEntry = (entryPath: string): Effect.Effect<RomFile[], Error> =>
    pipe(
      getFileStats(entryPath),
      Effect.flatMap((stats) => {
        if (stats.isDirectory()) {
          return scanDirectoryRecursive(entryPath, config);
        } else if (stats.isFile() && isRomFile(entryPath)) {
          const romFile: RomFile = {
            filename: path.basename(entryPath),
            path: entryPath,
            extension: path.extname(entryPath),
            fileSize: stats.size,
            lastModified: stats.mtime,
          };
          return Effect.succeed([romFile]);
        }
        return Effect.succeed([]);
      })
    );

  return pipe(
    readDirectory(dirPath),
    Effect.flatMap((entries) =>
      pipe(
        entries.map((entry) => path.join(dirPath, entry)),
        Array.map(processEntry),
        Effect.all,
        Effect.map(Array.flatten)
      )
    )
  );
};

// Transform RomFile to LocalRomMetadata
const parseRomFile = (
  romFile: RomFile
): Effect.Effect<LocalRomMetadata, Error> => {
  const platformOption = inferPlatformFromExtension(romFile.extension);
  
  return pipe(
    platformOption,
    Option.match({
      onNone: () => Effect.fail(new Error(`Unknown platform for extension: ${romFile.extension}`)),
      onSome: (platform) =>
        pipe(
          calculateChecksum(romFile.path),
          Effect.map((checksum) => ({
            filename: romFile.filename,
            path: romFile.path,
            platform,
            title: cleanTitle(romFile.filename),
            region: extractRegion(romFile.filename),
            revision: extractRevision(romFile.filename),
            fileSize: romFile.fileSize,
            lastModified: romFile.lastModified,
            checksum,
          }))
        ),
    })
  );
};

// Find local images for a ROM
const findLocalImages = (
  romPath: string,
  config: ScannerConfig
): Effect.Effect<ImagePaths, Error> => {
  const romDir = path.dirname(romPath);
  const romName = path.basename(romPath, path.extname(romPath));
  
  const checkImagePath = (imagePath: string): Effect.Effect<Option.Option<string>, never> =>
    pipe(
      Effect.tryPromise({
        try: () => fs.access(imagePath),
        catch: () => null,
      }),
      Effect.map(() => Option.some(imagePath)),
      Effect.orElse(() => Effect.succeed(Option.none()))
    );

  const imageTypes = ['cover', 'screenshot', 'logo'] as const;
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.webp'];
  
  const findImageForType = (type: typeof imageTypes[number]): Effect.Effect<string | null, Error> => {
    const possiblePaths = imageExtensions.flatMap((ext) => [
      path.join(romDir, `${romName}-${type}${ext}`),
      path.join(romDir, `${romName}${ext}`),
      path.join(romDir, type, `${romName}${ext}`),
      path.join(romDir, 'images', `${romName}-${type}${ext}`),
    ]);

    return pipe(
      possiblePaths,
      Array.map(checkImagePath),
      Effect.all,
      Effect.map(flow(
        Array.findFirst(Option.isSome),
        Option.flatten,
        Option.getOrNull
      ))
    );
  };

  return pipe(
    imageTypes,
    Array.map(findImageForType),
    Effect.all,
    Effect.map(([cover, screenshot, logo]) => ({
      cover,
      screenshot,
      logo,
    }))
  );
};

// Main scanner pipeline
const scanRoms = (config: ScannerConfig): Effect.Effect<GameEntry[], Error> => {
  const processRomFile = (romFile: RomFile): Effect.Effect<GameEntry, Error> =>
    pipe(
      Effect.Do,
      Effect.bind('metadata', () => parseRomFile(romFile)),
      Effect.bind('images', ({ metadata }) => findLocalImages(metadata.path, config)),
      Effect.map(({ metadata, images }) => ({
        id: `${metadata.title}-${metadata.platform}-${metadata.checksum.slice(0, 8)}`.toLowerCase().replace(/\s+/g, '-'),
        title: metadata.title,
        platform: metadata.platform,
        region: metadata.region,
        path: metadata.path,
        fileSize: metadata.fileSize,
        lastModified: metadata.lastModified.toISOString(),
        checksum: metadata.checksum,
        images,
        metadata: {
          revision: metadata.revision,
          language: metadata.region === 'USA' ? 'en' : null,
          genre: null,
          developer: null,
          releaseYear: null,
        },
      }))
    );

  return pipe(
    config.scanPaths,
    Array.map((scanPath) => scanDirectoryRecursive(scanPath, config)),
    Effect.all,
    Effect.map(Array.flatten),
    Effect.flatMap((romFiles) =>
      pipe(
        romFiles,
        Array.map(processRomFile),
        Effect.all
      )
    )
  );
};

// YAML export
const exportToYaml = (games: GameEntry[]): string => {
  const grouped = pipe(
    games,
    Array.reduce({} as Record<Platform, GameEntry[]>, (acc, game) => ({
      ...acc,
      [game.platform]: [...(acc[game.platform] || []), game],
    }))
  );

  return yaml.dump({
    metadata: {
      scanDate: new Date().toISOString(),
      scannerVersion: '1.0.0',
      totalGames: games.length,
    },
    games: grouped,
  });
};

// Main entry point
export const runSimpleScanner = (config: ScannerConfig): Effect.Effect<string, Error> =>
  pipe(
    scanRoms(config),
    Effect.map(exportToYaml)
  );

// Usage example
const config: ScannerConfig = {
  scanPaths: ['/storage/emulated/0/ROMs'],
  supportedExtensions: ['.nes', '.snes', '.gb', '.gbc', '.gba', '.n64'],
  imagePatterns: ['*-cover.*', '*-screenshot.*'],
};

Effect.runPromise(
  pipe(
    runSimpleScanner(config),
    Effect.tap((yaml) =>
      Effect.tryPromise({
        try: () => fs.writeFile('games.yaml', yaml),
        catch: (error) => new Error(`Failed to write file: ${error}`),
      })
    ),
    Effect.tap(() => Effect.sync(() => console.log('Scan complete!')))
  )
).catch(console.error);
```

---

## Plan 2: Hybrid Local/Remote Scanner

### Enhanced Schemas

```typescript
import { z } from 'zod';

// Remote API schemas
export const RemoteGameDataSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  genre: z.array(z.string()),
  developer: z.string().nullable(),
  publisher: z.string().nullable(),
  releaseYear: z.number().nullable(),
  rating: z.string().nullable(),
  players: z.string().nullable(),
  cooperative: z.boolean().nullable(),
  images: z.object({
    boxart: z.string().url().nullable(),
    screenshot: z.array(z.string().url()).nullable(),
    logo: z.string().url().nullable(),
    fanart: z.string().url().nullable(),
  }),
});

export const ApiResponseSchema = z.object({
  source: z.string(),
  data: RemoteGameDataSchema,
  confidence: z.number().min(0).max(1),
  fetchedAt: z.date(),
});

export const CacheEntrySchema = z.object({
  checksum: z.string(),
  metadata: LocalRomMetadataSchema.merge(RemoteGameDataSchema),
  images: z.record(z.string()),
  cachedAt: z.date(),
  expiresAt: z.date(),
});

export const HybridConfigSchema = ScannerConfigSchema.extend({
  remote: z.object({
    enabled: z.boolean(),
    timeout: z.number(),
    maxConcurrent: z.number(),
    apis: z.object({
      thegamesdb: z.object({
        enabled: z.boolean(),
        apiKey: z.string(),
        baseUrl: z.string().url(),
      }).optional(),
      screenscraper: z.object({
        enabled: z.boolean(),
        username: z.string(),
        password: z.string(),
        baseUrl: z.string().url(),
      }).optional(),
    }),
  }),
  cache: z.object({
    maxAge: z.string(), // Duration string like "30d"
    maxSize: z.string(), // Size string like "500MB"
    location: z.string(),
  }),
  images: z.object({
    download: z.boolean(),
    types: z.array(z.string()),
    maxSize: z.string(),
    format: z.enum(['webp', 'jpg', 'png']),
  }),
});

export type HybridConfig = z.infer<typeof HybridConfigSchema>;
export type RemoteGameData = z.infer<typeof RemoteGameDataSchema>;
export type ApiResponse = z.infer<typeof ApiResponseSchema>;
export type CacheEntry = z.infer<typeof CacheEntrySchema>;
```

### Functional Implementation with Remote Features using Effect

```typescript
import { Effect, Context, Layer, pipe, flow, Option, Either, Array as EffectArray } from 'effect';
import axios, { AxiosInstance } from 'axios';

// Service definitions using Effect's Context
interface CacheService {
  readonly get: (key: string) => Effect.Effect<Option.Option<CacheEntry>, Error>;
  readonly set: (key: string, value: CacheEntry) => Effect.Effect<void, Error>;
}

const CacheService = Context.Tag<CacheService>();

interface HttpService {
  readonly get: <T>(url: string, params?: any) => Effect.Effect<T, Error>;
  readonly download: (url: string, destination: string) => Effect.Effect<void, Error>;
}

const HttpService = Context.Tag<HttpService>();

interface ConfigService {
  readonly config: HybridConfig;
}

const ConfigService = Context.Tag<ConfigService>();

// Pure functions for API interaction
const calculateConfidence = (rom: LocalRomMetadata, remoteData: RemoteGameData): number => {
  let confidence = 0;
  
  // Title similarity
  const titleSimilarity = calculateStringSimilarity(rom.title, remoteData.title);
  confidence += titleSimilarity * 0.5;
  
  // Has description
  if (remoteData.description) confidence += 0.2;
  
  // Has images
  if (remoteData.images.boxart) confidence += 0.3;
  
  return Math.min(confidence, 1);
};

const searchTheGamesDB = (
  rom: LocalRomMetadata
): Effect.Effect<ApiResponse, Error, HttpService | ConfigService> =>
  Effect.gen(function* (_) {
    const { config } = yield* _(ConfigService);
    const http = yield* _(HttpService);
    
    if (!config.remote.apis.thegamesdb?.enabled) {
      return yield* _(Effect.fail(new Error('TheGamesDB not enabled')));
    }

    const { apiKey, baseUrl } = config.remote.apis.thegamesdb;
    const searchUrl = `${baseUrl}/Games/ByGameName`;
    
    const response = yield* _(
      http.get<any>(searchUrl, {
        apikey: apiKey,
        name: rom.title,
        platform: getPlatformId(rom.platform),
      })
    );

    const parseResult = RemoteGameDataSchema.safeParse(response.data);
    if (!parseResult.success) {
      return yield* _(Effect.fail(new Error(`Invalid response: ${parseResult.error}`)));
    }

    return {
      source: 'thegamesdb',
      data: parseResult.data,
      confidence: calculateConfidence(rom, parseResult.data),
      fetchedAt: new Date(),
    };
  });

// Cache operations
const getCachedMetadata = (
  checksum: string
): Effect.Effect<Option.Option<CacheEntry>, Error, CacheService> =>
  Effect.gen(function* (_) {
    const cache = yield* _(CacheService);
    const entry = yield* _(cache.get(checksum));
    
    return pipe(
      entry,
      Option.filter((e) => e.expiresAt > new Date())
    );
  });

const setCachedMetadata = (
  checksum: string,
  metadata: any
): Effect.Effect<void, Error, CacheService | ConfigService> =>
  Effect.gen(function* (_) {
    const cache = yield* _(CacheService);
    const { config } = yield* _(ConfigService);
    
    const maxAge = parseDuration(config.cache.maxAge);
    const entry: CacheEntry = {
      checksum,
      metadata,
      images: {},
      cachedAt: new Date(),
      expiresAt: new Date(Date.now() + maxAge),
    };
    
    yield* _(cache.set(checksum, entry));
  });

// Image downloading
const downloadImage = (
  url: string,
  destination: string
): Effect.Effect<string, Error, HttpService> =>
  Effect.gen(function* (_) {
    const http = yield* _(HttpService);
    yield* _(http.download(url, destination));
    return destination;
  });

// Rate limiting using Effect's Semaphore
const createRateLimiter = (permits: number) => {
  return Effect.makeSemaphore(permits);
};

// Enrichment pipeline
const enrichWithRemoteData = (
  rom: LocalRomMetadata
): Effect.Effect<GameEntry, Error, HttpService | CacheService | ConfigService> =>
  Effect.gen(function* (_) {
    // Check cache first
    const cached = yield* _(getCachedMetadata(rom.checksum));
    
    const enrichedData = yield* _(
      pipe(
        cached,
        Option.match({
          // Not cached, fetch from remote
          onNone: () =>
            pipe(
              searchTheGamesDB(rom),
              Effect.orElse(() => searchScreenScraper(rom)),
              Effect.orElse(() => Effect.succeed(createFallbackResponse(rom))),
              Effect.tap((response) => setCachedMetadata(rom.checksum, response))
            ),
          // Return cached data
          onSome: (entry) => Effect.succeed(entry.metadata),
        })
      )
    );

    // Download images
    const images = yield* _(downloadImagesForGame(enrichedData));

    return {
      ...enrichedData,
      images,
    };
  });

// Service implementations
const makeCacheService = (location: string): Layer.Layer<never, never, CacheService> =>
  Layer.succeed(CacheService, {
    get: (key: string) =>
      Effect.tryPromise({
        try: async () => {
          const filePath = path.join(location, `${key}.json`);
          try {
            const data = await fs.readFile(filePath, 'utf-8');
            return Option.some(JSON.parse(data) as CacheEntry);
          } catch {
            return Option.none();
          }
        },
        catch: (error) => new Error(`Cache read failed: ${error}`),
      }),
    set: (key: string, value: CacheEntry) =>
      Effect.tryPromise({
        try: async () => {
          const filePath = path.join(location, `${key}.json`);
          await fs.writeFile(filePath, JSON.stringify(value));
        },
        catch: (error) => new Error(`Cache write failed: ${error}`),
      }),
  });

const makeHttpService = (timeout: number): Layer.Layer<never, never, HttpService> => {
  const client = axios.create({ timeout });
  
  return Layer.succeed(HttpService, {
    get: <T>(url: string, params?: any) =>
      Effect.tryPromise({
        try: () => client.get<T>(url, { params }).then((res) => res.data),
        catch: (error) => new Error(`HTTP request failed: ${error}`),
      }),
    download: (url: string, destination: string) =>
      Effect.tryPromise({
        try: async () => {
          const response = await client.get(url, { responseType: 'stream' });
          const writer = createWriteStream(destination);
          response.data.pipe(writer);
          return new Promise<void>((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
          });
        },
        catch: (error) => new Error(`Download failed: ${error}`),
      }),
  });
};

// Main scanner with remote enrichment
const scanWithEnrichment = (
  paths: string[]
): Effect.Effect<GameEntry[], Error, HttpService | CacheService | ConfigService> =>
  Effect.gen(function* (_) {
    const { config } = yield* _(ConfigService);
    const semaphore = yield* _(createRateLimiter(config.remote.maxConcurrent));
    
    // Scan local files
    const romFiles = yield* _(
      pipe(
        paths,
        EffectArray.map((path) => scanDirectoryRecursive(path, config)),
        Effect.all,
        Effect.map(EffectArray.flatten)
      )
    );

    // Parse and enrich with rate limiting
    const enriched = yield* _(
      pipe(
        romFiles,
        EffectArray.map((romFile) =>
          semaphore.withPermits(1)(
            pipe(
              parseRomFile(romFile),
              Effect.flatMap(enrichWithRemoteData)
            )
          )
        ),
        Effect.all
      )
    );

    return enriched;
  });

// Main entry point with dependency injection
export const runHybridScanner = (config: HybridConfig): Effect.Effect<string, Error> => {
  const layers = Layer.mergeAll(
    makeCacheService(config.cache.location),
    makeHttpService(config.remote.timeout),
    Layer.succeed(ConfigService, { config })
  );

  return pipe(
    scanWithEnrichment(config.scanPaths),
    Effect.map(exportToYaml),
    Effect.provide(layers)
  );
};
```

---

## Plan 3: Comprehensive Multi-Source Scanner

### Advanced Schemas with ML Support

```typescript
import { z } from 'zod';

// Advanced identification schemas
export const RomHeaderSchema = z.object({
  platform: PlatformSchema,
  signature: z.string(),
  internalName: z.string(),
  region: z.string(),
  version: z.string(),
  checksumType: z.enum(['crc32', 'md5', 'sha1']),
  checksumValue: z.string(),
});

export const MatchResultSchema = z.object({
  source: z.string(),
  gameId: z.string(),
  confidence: z.number().min(0).max(1),
  matchType: z.enum(['header', 'checksum', 'filename', 'structure']),
  metadata: RemoteGameDataSchema,
});

export const MLPredictionSchema = z.object({
  predictedGame: z.string(),
  confidence: z.number(),
  similarGames: z.array(z.object({
    id: z.string(),
    similarity: z.number(),
  })),
  features: z.record(z.number()),
});

export const PerformanceMetricsSchema = z.object({
  averageFramerate: z.number(),
  recommendedSettings: z.record(z.any()),
  compatibilityScore: z.number(),
});

export const AdvancedRomMetadataSchema = LocalRomMetadataSchema.extend({
  headerInfo: RomHeaderSchema.nullable(),
  alternativeTitles: z.array(z.string()),
  hackType: z.enum(['original', 'translation', 'romhack', 'homebrew']),
  similarGames: z.array(z.string()),
  recommendedEmulator: z.object({
    core: z.string(),
    settings: z.record(z.any()),
  }),
  performanceProfile: PerformanceMetricsSchema,
  userRating: z.number().min(0).max(5),
  communityTags: z.array(z.string()),
  playCount: z.number(),
  lastPlayed: z.date().nullable(),
});

export type RomHeader = z.infer<typeof RomHeaderSchema>;
export type MatchResult = z.infer<typeof MatchResultSchema>;
export type MLPrediction = z.infer<typeof MLPredictionSchema>;
export type AdvancedRomMetadata = z.infer<typeof AdvancedRomMetadataSchema>;
```

### Advanced Functional Implementation with Effect

```typescript
import { Effect, Stream, Context, Layer, Queue, Fiber, pipe, flow, Option, Either } from 'effect';
import { Worker } from 'worker_threads';

// Advanced service definitions
interface MLService {
  readonly predict: (features: number[]) => Effect.Effect<MLPrediction, Error>;
  readonly assessImageQuality: (imagePath: string) => Effect.Effect<number, Error>;
}

const MLService = Context.Tag<MLService>();

interface DatDatabaseService {
  readonly lookup: (checksum: string) => Effect.Effect<Option.Option<MatchResult>, Error>;
}

const DatDatabaseService = Context.Tag<DatDatabaseService>();

interface MetricsService {
  readonly recordDuration: (name: string, duration: number) => Effect.Effect<void, never>;
  readonly recordError: (name: string, error: Error) => Effect.Effect<void, never>;
  readonly getSummary: () => Effect.Effect<Record<string, any>, never>;
}

const MetricsService = Context.Tag<MetricsService>();

// Header-based identification
const extractRomHeader = (
  romPath: string
): Effect.Effect<Option.Option<RomHeader>, Error> =>
  Effect.gen(function* (_) {
    const buffer = yield* _(
      Effect.tryPromise({
        try: () => fs.readFile(romPath).then((buf) => buf.subarray(0, 512)),
        catch: (error) => new Error(`Header read failed: ${error}`),
      })
    );

    // Platform-specific header parsing
    const parsers = [
      parseNESHeader,
      parseSNESHeader,
      parseGBHeader,
      parseN64Header,
    ];
    
    return pipe(
      parsers,
      Array.findFirst((parser) => parser(buffer)),
      Option.flatten
    );
  });

// ML-based matching
const predictGameWithML = (
  rom: RomFile
): Effect.Effect<MLPrediction, Error, MLService> =>
  Effect.gen(function* (_) {
    const ml = yield* _(MLService);
    const features = yield* _(extractMLFeatures(rom));
    return yield* _(ml.predict(features));
  });

// Multi-source matching with confidence aggregation
const identifyRomAdvanced = (
  rom: RomFile
): Effect.Effect<MatchResult[], Error, MLService | DatDatabaseService> =>
  Effect.gen(function* (_) {
    // Run all identification methods in parallel
    const results = yield* _(
      Effect.all([
        matchByHeader(rom),
        matchByChecksum(rom),
        matchByMLPrediction(rom),
        matchByStructure(rom),
      ], { concurrency: "unbounded" })
    );

    // Filter and sort by confidence
    return pipe(
      results,
      Array.compact,
      Array.sortBy((match) => -match.confidence),
      (sorted) => sorted.length > 0 ? sorted : [createUnknownMatch(rom)]
    );
  });

// Stream-based processing for large collections
const createRomStream = (
  paths: string[]
): Stream.Stream<RomFile, Error> => {
  const walkDirectory = (dirPath: string): Stream.Stream<RomFile, Error> =>
    Stream.gen(function* (_) {
      const entries = yield* _(Stream.fromEffect(readDirectory(dirPath)));
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry);
        const stats = yield* _(Stream.fromEffect(getFileStats(fullPath)));
        
        if (stats.isDirectory()) {
          yield* _(walkDirectory(fullPath));
        } else if (isRomFile(fullPath)) {
          yield* _(Stream.succeed({
            filename: entry,
            path: fullPath,
            extension: path.extname(entry),
            fileSize: stats.size,
            lastModified: stats.mtime,
          }));
        }
      }
    });

  return Stream.flatMap(
    Stream.fromIterable(paths),
    walkDirectory
  );
};

// Worker pool for parallel processing
const createWorkerPool = (size: number) => {
  const makeWorker = () =>
    Effect.acquireRelease(
      Effect.sync(() => new Worker('./rom-processor.js')),
      (worker) => Effect.sync(() => worker.terminate())
    );

  return Effect.gen(function* (_) {
    const queue = yield* _(Queue.unbounded<RomFile>());
    const workers = yield* _(Effect.all(Array.replicate(makeWorker(), size)));
    
    // Process items from queue
    const processWorker = (worker: Worker) =>
      Effect.forever(
        Effect.gen(function* (_) {
          const rom = yield* _(Queue.take(queue));
          yield* _(processRomWithWorker(worker, rom));
        })
      );

    // Start worker fibers
    const fibers = yield* _(
      Effect.all(
        workers.map((worker) => Effect.forkDaemon(processWorker(worker)))
      )
    );

    return {
      submit: (rom: RomFile) => Queue.offer(queue, rom),
      shutdown: () => Effect.all(fibers.map(Fiber.interrupt)),
    };
  });
};

// Circuit breaker for fault tolerance
const withCircuitBreaker = <R, E, A>(
  policy: {
    maxFailures: number;
    resetTimeout: number;
    halfOpenAttempts: number;
  }
) => {
  type State = { _tag: 'closed' } | { _tag: 'open'; since: number } | { _tag: 'halfOpen'; attempts: number };
  
  return (effect: Effect.Effect<A, E, R>) => {
    const stateRef = Effect.unsafeMakeSemaphore(1);
    let state: State = { _tag: 'closed' };
    let failures = 0;

    return Effect.gen(function* (_) {
      yield* _(stateRef.take(1));
      
      try {
        const now = Date.now();
        
        // Check if we should transition from open to half-open
        if (state._tag === 'open' && now - state.since > policy.resetTimeout) {
          state = { _tag: 'halfOpen', attempts: 0 };
        }

        // Fail fast if circuit is open
        if (state._tag === 'open') {
          return yield* _(Effect.fail(new Error('Circuit breaker is open') as E));
        }

        // Try the effect
        const result = yield* _(
          pipe(
            effect,
            Effect.tapError(() =>
              Effect.sync(() => {
                failures++;
                if (failures >= policy.maxFailures) {
                  state = { _tag: 'open', since: Date.now() };
                }
              })
            ),
            Effect.tap(() =>
              Effect.sync(() => {
                if (state._tag === 'halfOpen') {
                  state = { _tag: 'closed' };
                  failures = 0;
                }
              })
            )
          )
        );

        return result;
      } finally {
        stateRef.give(1);
      }
    });
  };
};

// Performance monitoring wrapper
const withMetrics = <R, E, A>(name: string) =>
  <RIn extends R & MetricsService>(
    effect: Effect.Effect<A, E, RIn>
  ): Effect.Effect<A, E, RIn> =>
    Effect.gen(function* (_) {
      const metrics = yield* _(MetricsService);
      const startTime = Date.now();
      
      return yield* _(
        pipe(
          effect,
          Effect.tapBoth({
            onFailure: (error) => metrics.recordError(name, error as Error),
            onSuccess: () => metrics.recordDuration(name, Date.now() - startTime),
          })
        )
      );
    });

// Advanced image pipeline
const selectBestImage = (
  candidates: ImageCandidate[]
): Effect.Effect<Option.Option<ImageCandidate>, Error, MLService> =>
  Effect.gen(function* (_) {
    if (candidates.length === 0) return Option.none();
    
    const ml = yield* _(MLService);
    
    // Assess quality of each image
    const withQuality = yield* _(
      Effect.all(
        candidates.map((candidate) =>
          pipe(
            ml.assessImageQuality(candidate.path),
            Effect.map((quality) => ({ ...candidate, quality }))
          )
        )
      )
    );

    // Sort by quality and source reliability
    const sorted = pipe(
      withQuality,
      Array.sortBy((c) => -(c.quality * getSourceReliability(c.source)))
    );

    return Option.some(sorted[0]);
  });

// Main comprehensive scanner
const runComprehensiveScanner = (
  config: AdvancedConfig
): Effect.Effect<void, Error> => {
  const layers = Layer.mergeAll(
    makeMLService(config.ml),
    makeDatDatabaseService(config.dat),
    makeMetricsService(),
    makeCacheService(config.cache.location),
    makeHttpService(config.remote.timeout),
    Layer.succeed(ConfigService, { config })
  );

  const program = Effect.gen(function* (_) {
    const metrics = yield* _(MetricsService);
    const workerPool = yield* _(createWorkerPool(config.workers.count));
    
    // Process ROM stream with worker pool
    yield* _(
      pipe(
        createRomStream(config.scanPaths),
        Stream.mapEffect(
          flow(
            parseRomFile,
            Effect.flatMap(identifyRomAdvanced),
            Effect.flatMap(enrichWithAllSources),
            withMetrics('rom-processing'),
            withCircuitBreaker({
              maxFailures: 5,
              resetTimeout: 60000,
              halfOpenAttempts: 3,
            })
          ),
          { concurrency: config.workers.count }
        ),
        Stream.runDrain
      )
    );

    // Cleanup
    yield* _(workerPool.shutdown());
    
    // Print summary
    const summary = yield* _(metrics.getSummary());
    console.log('Scan complete!', summary);
  });

  return Effect.provide(program, layers);
};
```

---

## Summary Comparison (Effect + Functional Approach)

| Feature | Plan 1: Simple | Plan 2: Hybrid | Plan 3: Comprehensive |
|---------|----------------|----------------|-----------------------|
| **Type System** | Zod schemas | Zod + Runtime validation | Zod + ML type inference |
| **Effect Patterns** | Basic Effect | Context + Services | Stream + Fiber + Queue |
| **Error Handling** | Effect.tryPromise | Service layers | Circuit breakers |
| **Concurrency** | Effect.all | Semaphore rate limiting | Worker pools + Streams |
| **State Management** | Stateless | File-based cache | Distributed state |
| **Testing** | Unit tests | + Service mocking | + Property tests |
| **Dependencies** | effect, zod | + axios, cache | + ML, workers |

### Key Effect Patterns Used

1. **Schema-First with Zod**
   - Define all schemas upfront
   - Runtime validation at boundaries
   - Type inference from schemas
   - Composable validation

2. **Effect for Control Flow**
   - `pipe` and `flow` for composition
   - `Effect.gen` for sequential operations
   - `Effect.all` for parallel execution
   - Error handling with `Effect.tryPromise`

3. **Service Pattern**
   - Context.Tag for dependency injection
   - Layer for service composition
   - Testable service interfaces
   - Clean separation of concerns

4. **Advanced Effect Features**
   - Stream for large data processing
   - Fiber for concurrent operations
   - Queue for work distribution
   - Semaphore for rate limiting

### Benefits of Effect over fp-ts

- **Better Error Messages**: Effect provides clearer error traces
- **Built-in Services**: Context and Layer system for DI
- **Resource Management**: Automatic cleanup with acquireRelease
- **Streaming**: First-class Stream support for large datasets
- **Debugging**: Better stack traces and error handling
- **Performance**: More optimized for real-world use cases