import { tryPromise, gen, fail } from 'effect/Effect';
import * as FileSystem from 'expo-file-system';

// File operation result types
export interface FileInfo {
  path: string;
  size: number;
  modificationTime: number;
  isDirectory: boolean;
}

export interface DirectoryEntry {
  name: string;
  path: string;
  isDirectory: boolean;
}

// Custom error types for better error handling
export class FileSystemError extends Error {
  readonly _tag = 'FileSystemError';
  constructor(message: string, readonly path: string) {
    super(message);
    this.name = 'FileSystemError';
  }
}

export class FileNotFoundError extends Error {
  readonly _tag = 'FileNotFoundError';
  constructor(readonly path: string) {
    super(`File or directory not found: ${path}`);
    this.name = 'FileNotFoundError';
  }
}

export class NotADirectoryError extends Error {
  readonly _tag = 'NotADirectoryError';
  constructor(readonly path: string) {
    super(`Path is not a directory: ${path}`);
    this.name = 'NotADirectoryError';
  }
}

export class NotAFileError extends Error {
  readonly _tag = 'NotAFileError';
  constructor(readonly path: string) {
    super(`Path is not a file: ${path}`);
    this.name = 'NotAFileError';
  }
}

export class PermissionError extends Error {
  readonly _tag = 'PermissionError';
  constructor(readonly path: string, readonly operation: string) {
    super(`Permission denied for ${operation} on: ${path}`);
    this.name = 'PermissionError';
  }
}

// Implementations
export function readDirectory(path: string): import('effect/Effect').Effect<DirectoryEntry[], FileSystemError | FileNotFoundError | NotADirectoryError> {
  return gen(function* () {
    try {
      const filenames = yield* tryPromise({
        try: () => FileSystem.readDirectoryAsync(path),
        catch: (error) => {
          if (error instanceof Error) {
            if (error.message.includes('not found') || error.message.includes('does not exist')) {
              return new FileNotFoundError(path);
            }
            if (error.message.includes('not a directory')) {
              return new NotADirectoryError(path);
            }
          }
          return new FileSystemError(`Failed to read directory: ${error}`, path);
        }
      });

      const entries: DirectoryEntry[] = [];
      
      for (const filename of filenames) {
        const fullPath = path.endsWith('/') ? path + filename : path + '/' + filename;
        
        const info = yield* tryPromise({
          try: () => FileSystem.getInfoAsync(fullPath),
          catch: () => new FileSystemError(`Failed to get info for: ${fullPath}`, fullPath)
        });

        entries.push({
          name: filename,
          path: fullPath,
          isDirectory: info.isDirectory || false,
        });
      }

      return entries;
    } catch (error) {
      return yield* fail(
        error instanceof FileSystemError ? error : new FileSystemError(`Unexpected error: ${error}`, path)
      );
    }
  });
}

export function getFileInfo(path: string): import('effect/Effect').Effect<FileInfo, FileSystemError | FileNotFoundError> {
  return gen(function* () {
    const info = yield* tryPromise({
      try: () => FileSystem.getInfoAsync(path),
      catch: (error) => new FileSystemError(`Failed to get file info: ${error}`, path)
    });

    if (!info.exists) {
      return yield* fail(new FileNotFoundError(path));
    }

    return {
      path,
      size: info.exists ? info.size : 0,
      modificationTime: info.exists ? info.modificationTime : 0,
      isDirectory: info.exists ? info.isDirectory : false,
    };
  });
}

export function calculateChecksum(path: string): import('effect/Effect').Effect<string, FileSystemError | FileNotFoundError | NotAFileError> {
  return gen(function* () {
    const info = yield* tryPromise({
      try: () => FileSystem.getInfoAsync(path),
      catch: (error) => new FileSystemError(`Failed to get file info: ${error}`, path)
    });

    if (!info.exists) {
      return yield* fail(new FileNotFoundError(path));
    }

    if (info.isDirectory) {
      return yield* fail(new NotAFileError(path));
    }

    // Simple string-based hash implementation as fallback
    const content = yield* tryPromise({
      try: () => FileSystem.readAsStringAsync(path),
      catch: (error) => new FileSystemError(`Failed to read file for checksum: ${error}`, path)
    });

    // Basic hash function - not cryptographically secure but works for file comparison
    let hash = 0;
    if (content.length === 0) return hash.toString();
    
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(16);
  });
}