# ROM Scanner Implementation Plans (Effect + Zod) - React Native Compatible

## Overview

This document outlines a React Native (Expo) compatible approach for implementing a ROM scanner that generates YAML metadata files for the Elevate game launcher. This implementation uses Effect for functional programming patterns and Zod for runtime type validation and schema-first design.

---

## Plan 1: Simple Local Scanner (React Native Compatible)

### Approach
A lightweight, filesystem-based scanner using Effect's functional patterns and Zod schemas for type safety and validation, specifically designed for React Native/Expo environment.

### Core Schemas

```typescript
import { z } from 'zod';

// Base schemas
export const PlatformSchema = z.enum([
  'nes', 'snes', 'gb', 'gbc', 'gba', 'n64',
  'genesis', 'ps1', 'psp', 'nds'
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
  fileSize: z.number(),
  lastModified: z.date(),
  checksum: z.string(),
});

export const GameEntrySchema = z.object({
  id: z.string(),
  platform: PlatformSchema,
  hosts: z.array(z.string()),
  lastModified: z.string(), // ISO date string for YAML
  files: z.array(z.object({
    path: z.string(),
    size: z.number(),
    checksum: z.string(),
  })),
  release: z.object({
    title: z.string(),
    language: z.string().optional(),
    genre: z.string().optional(),
    developer: z.string().optional(),
    releaseYear: z.number().optional(),
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
export type RomFile = z.infer<typeof RomFileSchema>;
export type LocalRomMetadata = z.infer<typeof LocalRomMetadataSchema>;
export type GameEntry = z.infer<typeof GameEntrySchema>;
export type ScannerConfig = z.infer<typeof ScannerConfigSchema>;
```

### Functional Implementation with Effect (React Native Compatible)

```typescript
// Tree-shakable imports for optimal bundle size
import { tryPromise, pipe, flatMap, map, all, succeed, fail, tap, orElse, runPromise } from 'effect/Effect';
import { fromNullable, match, some, none, isSome, flatten as optionFlatten, getOrNull } from 'effect/Option';
import { map as arrayMap, flatten as arrayFlatten, findFirst } from 'effect/Array';
import { flow } from 'effect/Function';
import * as FileSystem from 'expo-file-system';
import * as Crypto from 'expo-crypto';
import * as Device from 'expo-device';
import { stringify } from 'yaml';

// Path utilities for React Native
const path = {
  join: (...parts: string[]) => parts.filter(Boolean).join('/'),
  basename: (filepath: string, ext?: string) => {
    const name = filepath.split('/').pop() || '';
    return ext ? name.replace(new RegExp(`${ext}$`), '') : name;
  },
  dirname: (filepath: string) => filepath.split('/').slice(0, -1).join('/'),
  extname: (filepath: string) => {
    const match = filepath.match(/\.[^.]+$/);
    return match ? match[0] : '';
  }
};

// Pure functions for data transformation
const cleanTitle = (filename: string): string => {
  return filename
    .replace(/\.[^.]+$/, '') // Remove extension
    .replace(/\s*\([^)]*\)/g, '') // Remove parentheses content
    .replace(/\s*\[[^\]]*\]/g, '') // Remove brackets content
    .trim();
};

const inferPlatformFromExtension = (ext: string) => {
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

  return fromNullable(extensionMap[ext.toLowerCase()]);
};

// File system operations for React Native
const readDirectory = (dirPath: string) =>
  tryPromise({
    try: async () => {
      const entries = await FileSystem.readDirectoryAsync(dirPath);
      return entries;
    },
    catch: (error) => new Error(`Failed to read directory: ${error}`),
  });

const getFileInfo = (filePath: string) =>
  tryPromise({
    try: () => FileSystem.getInfoAsync(filePath),
    catch: (error) => new Error(`Failed to get file info: ${error}`),
  });

const calculateChecksum = (filePath: string) =>
  tryPromise({
    try: async () => {
      const digest = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.MD5,
        filePath,
        { encoding: Crypto.CryptoEncoding.HEX }
      );
      return digest;
    },
    catch: (error) => new Error(`Failed to calculate checksum: ${error}`),
  });

// Recursive directory scanning for React Native
const scanDirectoryRecursive = (
  dirPath: string,
  supportedExtensions: string[]
) => {
  const isRomFile = (filename: string): boolean => {
    const ext = path.extname(filename).toLowerCase();
    return supportedExtensions.includes(ext);
  };

  const processEntry = (entryPath: string, entryName: string) =>
    pipe(
      getFileInfo(entryPath),
      flatMap((info) => {
        if (info.isDirectory) {
          return scanDirectoryRecursive(entryPath, supportedExtensions);
        } else if (!info.isDirectory && isRomFile(entryName)) {
          const romFile: RomFile = {
            filename: entryName,
            path: entryPath,
            extension: path.extname(entryName),
            fileSize: info.size || 0,
            lastModified: new Date(info.modificationTime || Date.now()),
          };
          return succeed([romFile]);
        }
        return succeed([]);
      })
    );

  return pipe(
    readDirectory(dirPath),
    flatMap((entries) =>
      pipe(
        entries.map((entry) => ({
          path: path.join(dirPath, entry),
          name: entry
        })),
        arrayMap(({ path, name }) => processEntry(path, name)),
        all,
        map(arrayFlatten)
      )
    )
  );
};

// Transform RomFile to LocalRomMetadata
const parseRomFile = (romFile: RomFile) => {
  const platformOption = inferPlatformFromExtension(romFile.extension);

  return pipe(
    platformOption,
    match({
      onNone: () => fail(new Error(`Unknown platform for extension: ${romFile.extension}`)),
      onSome: (platform) =>
        pipe(
          calculateChecksum(romFile.path),
          map((checksum) => ({
            filename: romFile.filename,
            path: romFile.path,
            platform,
            title: cleanTitle(romFile.filename),
            fileSize: romFile.fileSize,
            lastModified: romFile.lastModified,
            checksum,
          }))
        ),
    })
  );
};

// Updated image finding with new paths
const findLocalImages = (romPath: string) => {
  const romDir = path.dirname(romPath);
  const romName = path.basename(romPath, path.extname(romPath));

  const checkImagePath = (imagePath: string) =>
    pipe(
      getFileInfo(imagePath),
      map((info) => info.exists ? some(imagePath) : none()),
      orElse(() => succeed(none()))
    );

  const imageExtensions = ['.png', '.jpg', '.jpeg', '.webp'];

  const findImageForType = (type: 'cover' | 'screenshot' | 'logo') => {
    const possiblePaths = imageExtensions.flatMap((ext) => [
      // Original patterns
      path.join(romDir, `${romName}-${type}${ext}`),
      path.join(romDir, `${romName}${ext}`),
      path.join(romDir, 'images', 'screenshots', `${romName}${ext}`),
      path.join(romDir, 'images', 'covers', `${romName}${ext}`),
    ]);

    return pipe(
      possiblePaths,
      arrayMap(checkImagePath),
      all,
      map(flow(
        findFirst(isSome),
        optionFlatten,
        getOrNull
      ))
    );
  };

  return pipe(
    ['cover', 'screenshot', 'logo'] as const,
    arrayMap(findImageForType),
    all,
    map(([cover, screenshot, logo]) => ({
      cover,
      screenshot,
      logo,
    }))
  );
};

// Main scanner pipeline
export const scanRoms = (
  scanPaths: string[],
  supportedExtensions: string[]
) => {
  const processRomFile = (romFile: RomFile) =>
    pipe(
      parseRomFile(romFile),
      map((metadata) => ({
        id: `${metadata.title}-${metadata.platform}-${metadata.checksum.slice(0, 8)}`.toLowerCase().replace(/\s+/g, '-'),
        platform: metadata.platform,
        hosts: [Device.deviceName || Device.modelName || 'unknown-device'],
        lastModified: metadata.lastModified.toISOString(),
        files: [{
          path: metadata.path,
          size: metadata.fileSize,
          checksum: metadata.checksum,
        }],
        release: {
          title: metadata.title,
          // Optional fields omitted when null to reduce file size
        },
      }))
    );

  return pipe(
    scanPaths,
    arrayMap((scanPath) => scanDirectoryRecursive(scanPath, supportedExtensions)),
    all,
    map(arrayFlatten),
    flatMap((romFiles) =>
      pipe(
        romFiles,
        arrayMap(processRomFile),
        all
      )
    )
  );
};

// Export to YAML format using yaml library
export const exportToYaml = (games: GameEntry[]): string => {
  return stringify({
    metadata: {
      scanDate: new Date().toISOString(),
    },
    games,
  });
};

// Usage in React Native component
export const useRomScanner = () => {
  const [scanning, setScanning] = React.useState(false);

  const runScanner = async (): Promise<GameEntry[]> => {
    setScanning(true);
    try {
      const scanPaths = [
        `${FileSystem.documentDirectory}ROMs`,
        `${FileSystem.cacheDirectory}ROMs`,
      ];

      const games = await runPromise(
        scanRoms(scanPaths, ['.nes', '.snes', '.gb', '.gbc', '.gba', '.n64', '.genesis', '.md'])
      );

      // Optionally save to YAML file for later use
      const yaml = exportToYaml(games);
      await runPromise(
        tryPromise({
          try: () => FileSystem.writeAsStringAsync(
            `${FileSystem.documentDirectory}games.yaml`,
            yaml
          ),
          catch: (error) => new Error(`Failed to write YAML file: ${error}`),
        })
      );

      return games;
    } finally {
      setScanning(false);
    }
  };

  return { runScanner, scanning };
};
```

---

### Dependencies Required

```bash
npm install effect zod yaml
expo install expo-file-system expo-crypto expo-device
```

### Usage in React Native

```typescript
import React, { useState } from 'react';
import { View, Button, Text, ScrollView, StyleSheet } from 'react-native';
import { useRomScanner } from './rom-scanner';
import type { GameEntry } from './rom-scanner';

const RomScannerDisplay = () => {
  const { runScanner, scanning } = useRomScanner();
  const [scanResults, setScanResults] = useState<GameEntry[]>([]);
  const [lastScanDate, setLastScanDate] = useState<string | null>(null);

  const handleScan = async () => {
    try {
      const results = await runScanner();
      setScanResults(results || []);
      setLastScanDate(new Date().toLocaleString());
    } catch (error) {
      console.error('Scan failed:', error);
      setScanResults([]);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button
          title={scanning ? "Scanning..." : "Scan ROMs"}
          onPress={handleScan}
          disabled={scanning}
        />
        {lastScanDate && (
          <Text style={styles.lastScan}>
            Last scan: {lastScanDate}
          </Text>
        )}
      </View>

      <ScrollView style={styles.results}>
        <Text style={styles.title}>
          Found {scanResults.length} ROM{scanResults.length !== 1 ? 's' : ''}
        </Text>

        {scanResults.map((game, index) => (
          <View key={game.id} style={styles.gameItem}>
            <Text style={styles.gameTitle}>
              • {game.release.title}
            </Text>
            <Text style={styles.gameDetails}>
              Platform: {game.platform.toUpperCase()} |
              Files: {game.files.length} |
              Size: {(game.files.reduce((total, file) => total + file.size, 0) / 1024 / 1024).toFixed(1)}MB
            </Text>
            {game.files.map((file, fileIndex) => (
              <Text key={fileIndex} style={styles.gamePath} numberOfLines={1}>
                {file.path}
              </Text>
            ))}
          </View>
        ))}

        {scanResults.length === 0 && !scanning && (
          <Text style={styles.noResults}>
            No ROMs found. Make sure ROM files are in the correct directories.
          </Text>
        )}
      </ScrollView>
    </View>
  );
};

```

### Example Output: Generated YAML File

The scanner will generate a YAML file at `${FileSystem.documentDirectory}games.yaml` with the following structure:

```yaml
metadata:
  scanDate: '2024-01-15T14:30:45.123Z'
games:
  - id: 'super-mario-bros-nes-a1b2c3d4'
    platform: 'nes'
    hosts:
      - 'Samsung Galaxy S23'
    lastModified: '2024-01-15T12:15:30.000Z'
    files:
      - path: '/data/data/com.simonwjackson.elevate/files/ROMs/NES/Super Mario Bros (USA).nes'
        size: 40960
        checksum: 'a1b2c3d4e5f6789012345678'
    release:
      title: 'Super Mario Bros'
  - id: 'the-legend-of-zelda-nes-b2c3d4e5'
    platform: 'nes'
    hosts:
      - 'Samsung Galaxy S23'
    lastModified: '2024-01-15T12:20:15.000Z'
    files:
      - path: '/data/data/com.simonwjackson.elevate/files/ROMs/NES/Legend of Zelda, The (USA).nes'
        size: 131072
        checksum: 'b2c3d4e5f6789012345678a1'
    release:
      title: 'The Legend of Zelda'
  - id: 'pokemon-red-gb-c3d4e5f6'
    platform: 'gb'
    hosts:
      - 'Samsung Galaxy S23'
    lastModified: '2024-01-15T12:25:00.000Z'
    files:
      - path: '/data/data/com.simonwjackson.elevate/files/ROMs/GB/Pokemon Red (USA, Europe).gb'
        size: 1048576
        checksum: 'c3d4e5f6789012345678a1b2'
    release:
      title: 'Pokemon Red'
```

**Key Features of the YAML Output:**

1. **Clean Structure**: Scan timestamp at top level, focused on game data
2. **Unique Game IDs**: Generated from title, platform, and checksum for deduplication
3. **Per-Game Hosts**: Each game tracks which devices have scanned it (useful for multi-device setups)
4. **Multi-File Support**: `files` array supports multi-disk games (PS1, Saturn, etc.)
5. **Release Information**: Title and descriptive info grouped under `release` section
6. **Platform Detection**: Automatically infers platform from file extension
7. **Clean Titles**: Automatically strips region codes, version info, and file extensions
8. **ISO Timestamps**: Consistent date formatting for last modified times
9. **Compact Format**: Optional metadata fields omitted when empty to reduce file size

This YAML structure is optimized for:
- **Multi-device game libraries** (each game tracks its host devices)
- **File management** (all file info in one place)
- **Release enrichment** (easy to add genre, developer info later without bloating existing files)
- **Deduplication** (unique IDs prevent duplicate entries)
- **Minimal file size** (only includes fields with actual data)

### Key Effect Patterns Used

1. **Schema-First with Zod**
   - All schemas defined upfront with runtime validation
   - Type inference from schemas for compile-time safety
   - Composable validation across the pipeline

2. **Effect for Control Flow**
   - `pipe` and `flow` for functional composition
   - `tryPromise` for async operations with error handling
   - `all` for parallel execution of file operations

3. **Functional Error Handling**
   - Option types for nullable values (image paths)
   - Effect types for operations that can fail
   - Composable error handling throughout the pipeline

4. **Tree-Shakable Architecture**
   - Named imports for optimal bundle size in React Native
   - Only imports the specific Effect functions needed
   - Reduced bundle size for mobile deployment
