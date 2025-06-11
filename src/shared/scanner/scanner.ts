import { tryPromise, flatMap, map, all, succeed, fail, orElse, gen } from 'effect/Effect';
import { pipe } from 'effect/Function';
import { fromNullable, match } from 'effect/Option';
import { map as arrayMap, flatten as arrayFlatten } from 'effect/Array';
import * as FileSystem from 'expo-file-system';
// Removed expo-device dependency to avoid native module issues
import type { RomFile, LocalRomMetadata, Platform, GameEntry } from './types';

// Removed device name detection for now

// Path utilities for React Native
const path = {
  join: (...parts: (string | undefined | null)[]) => 
    parts
      .filter((part): part is string => typeof part === 'string' && part.length > 0)
      .join('/')
      .replace(/\/+/g, '/'),
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
    '.snes': 'snes',
    '.gb': 'gb',
    '.gbc': 'gbc',
    '.gba': 'gba',
    '.n64': 'n64',
    '.z64': 'n64',
    '.gen': 'genesis',
    '.md': 'genesis',
    '.genesis': 'genesis',
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

// Simple checksum calculation based on file metadata
const calculateChecksum = (romFile: RomFile) =>
  succeed(
    // Create a simple hash from file path, size, and modification time
    `${romFile.fileSize}-${romFile.lastModified.getTime()}-${romFile.filename.length}`.slice(0, 16)
  );

// Recursive directory scanning for React Native
export const scanDirectoryRecursive = (
  dirPath: string,
  supportedExtensions: string[]
): import('effect/Effect').Effect<RomFile[], Error> => {
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
            fileSize: info.exists ? info.size : 0,
            lastModified: new Date(info.exists ? info.modificationTime : Date.now()),
          };
          return succeed([romFile]);
        }
        return succeed([]);
      }),
      // Handle individual file errors gracefully
      orElse(() => succeed([]))
    );

  // First check if directory exists and is actually a directory
  return pipe(
    getFileInfo(dirPath),
    // Handle directory info errors (like directory not existing)
    orElse(() => {
      // For any error getting file info (directory doesn't exist, permission denied, etc.)
      // return a mock info object indicating the directory doesn't exist
      return succeed({ exists: false, isDirectory: false });
    }),
    flatMap((info) => {
      if (!info.exists || !info.isDirectory) {
        // Path doesn't exist or is not a directory - return empty array
        return succeed([]);
      }
      // Directory exists, proceed with reading it
      return pipe(
        readDirectory(dirPath),
        flatMap((entries) =>
          pipe(
            entries
              .filter((entry): entry is string => typeof entry === 'string')
              .map((entry) => ({
                path: path.join(dirPath, entry),
                name: entry
              })),
            arrayMap(({ path, name }) => processEntry(path, name)),
            all,
            map(arrayFlatten)
          )
        ),
        // Handle directory read errors (like permission denied)
        orElse(() => {
          return fail(new Error('Failed to read directory'));
        })
      );
    })
  );
};

// Transform RomFile to LocalRomMetadata
export const parseRomFile = (romFile: RomFile): import('effect/Effect').Effect<LocalRomMetadata, Error> => {
  const platformOption = inferPlatformFromExtension(romFile.extension);

  return pipe(
    platformOption,
    match({
      onNone: () => fail(new Error(`Unknown platform for extension: ${romFile.extension}`)),
      onSome: (platform) =>
        pipe(
          calculateChecksum(romFile),
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

// Main scanner pipeline function
export const scanRoms = (
  scanPaths: string[],
  supportedExtensions: string[]
): import('effect/Effect').Effect<GameEntry[], Error> => {
  const processRomFile = (romFile: RomFile): import('effect/Effect').Effect<GameEntry, Error> =>
    pipe(
      parseRomFile(romFile),
      map((metadata): GameEntry => ({
        id: `${metadata.title}-${metadata.platform}-${metadata.checksum.slice(0, 8)}`.toLowerCase().replace(/\s+/g, '-'),
        platform: metadata.platform,
        lastModified: metadata.lastModified.toISOString(),
        files: [{
          path: metadata.path,
          size: metadata.fileSize,
          checksum: metadata.checksum,
        }],
        release: {
          title: metadata.title,
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

// YAML Export Functions

// Escape special characters in YAML strings
const escapeYamlString = (str: string): string => {
  // Check if string needs quoting (contains special characters)
  if (/["\n\r\t\\']|^[>\|]|: |^-\s|^\s|\s$/.test(str)) {
    return `"${str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/'/g, "\\'")}"`;
  }
  return str;
};

// Convert camelCase to snake_case for YAML keys
const toSnakeCase = (str: string): string => {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

// Format a game entry as YAML
const formatGameAsYaml = (game: GameEntry, indent: string = '  '): string => {
  const lines: string[] = [];
  
  lines.push(`${indent}- id: ${escapeYamlString(game.id)}`);
  lines.push(`${indent}  platform: ${game.platform}`);
  lines.push(`${indent}  last_modified: "${game.lastModified}"`);
  
  // Files section
  lines.push(`${indent}  files:`);
  game.files.forEach(file => {
    lines.push(`${indent}    - path: ${escapeYamlString(file.path)}`);
    lines.push(`${indent}      size: ${file.size}`);
    lines.push(`${indent}      checksum: ${escapeYamlString(file.checksum)}`);
  });
  
  // Release section
  lines.push(`${indent}  release:`);
  lines.push(`${indent}    title: ${escapeYamlString(game.release.title)}`);
  
  // Optional release fields
  if (game.release.language) {
    lines.push(`${indent}    language: ${escapeYamlString(game.release.language)}`);
  }
  if (game.release.genre) {
    lines.push(`${indent}    genre: ${escapeYamlString(game.release.genre)}`);
  }
  if (game.release.developer) {
    lines.push(`${indent}    developer: ${escapeYamlString(game.release.developer)}`);
  }
  if (game.release.releaseYear) {
    lines.push(`${indent}    release_year: ${game.release.releaseYear}`);
  }
  
  return lines.join('\n');
};

// Export games array to YAML format
export const exportToYaml = (games: GameEntry[]): string => {
  const lines: string[] = [];
  const scanDate = new Date().toISOString();
  
  // Metadata section
  lines.push('metadata:');
  lines.push(`  scan_date: '${scanDate}'`);
  lines.push(`  total_games: ${games.length}`);
  lines.push('  version: 1.0');
  lines.push('');
  
  // Games section
  if (games.length === 0) {
    lines.push('games: []');
  } else {
    lines.push('games:');
    games.forEach(game => {
      lines.push(formatGameAsYaml(game));
    });
  }
  
  return lines.join('\n');
};

// File operations for YAML export
const writeFileAsync = (filePath: string, content: string) =>
  tryPromise({
    try: () => FileSystem.writeAsStringAsync(filePath, content),
    catch: (error) => new Error(`Failed to write YAML file: ${error}`),
  });

const createDirectoryAsync = (dirPath: string) =>
  tryPromise({
    try: () => FileSystem.makeDirectoryAsync(dirPath, { intermediates: true }),
    catch: (error) => new Error(`Failed to create output directory: ${error}`),
  });

// Save YAML content to file with directory creation
export const saveYamlToFile = (
  yamlContent: string,
  filePath: string
): import('effect/Effect').Effect<string, Error> => {
  const dirPath = path.dirname(filePath);
  
  const ensureDirectory = pipe(
    getFileInfo(dirPath),
    flatMap((info) => {
      if (!info.exists) {
        return createDirectoryAsync(dirPath);
      }
      return succeed(undefined);
    }),
    // Handle case where directory check fails but we still want to try creating it
    orElse(() => createDirectoryAsync(dirPath))
  );
  
  return pipe(
    ensureDirectory,
    flatMap(() => writeFileAsync(filePath, yamlContent)),
    map(() => filePath)
  );
};