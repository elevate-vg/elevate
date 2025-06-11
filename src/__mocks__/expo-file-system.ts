// Mock implementation of expo-file-system for testing

export const documentDirectory = '/test/documents/';

export interface FileInfo {
  exists: boolean;
  uri: string;
  size?: number;
  isDirectory?: boolean;
  modificationTime?: number;
}

// Mock file system state for testing
const mockFileSystem: Record<string, FileInfo & { contents?: string[] }> = {};

export function setupMockFileSystem(files: Record<string, { isDirectory?: boolean; size?: number; contents?: string[] }>) {
  // Clear existing mock data
  Object.keys(mockFileSystem).forEach(key => delete mockFileSystem[key]);
  
  // Add new mock data
  Object.entries(files).forEach(([path, info]) => {
    mockFileSystem[path] = {
      exists: true,
      uri: path,
      size: info.size || 0,
      isDirectory: info.isDirectory || false,
      modificationTime: Date.now(),
      contents: info.contents
    };
  });
}

export async function getInfoAsync(path: string): Promise<FileInfo> {
  const info = mockFileSystem[path];
  if (!info) {
    return {
      exists: false,
      uri: path
    };
  }
  return {
    exists: info.exists,
    uri: info.uri,
    size: info.size,
    isDirectory: info.isDirectory,
    modificationTime: info.modificationTime
  };
}

export async function readDirectoryAsync(path: string): Promise<string[]> {
  const info = mockFileSystem[path];
  if (!info || !info.isDirectory || !info.contents) {
    throw new Error(`Directory not found or not readable: ${path}`);
  }
  return info.contents;
}

export async function makeDirectoryAsync(path: string, options?: { intermediates?: boolean }): Promise<void> {
  mockFileSystem[path] = {
    exists: true,
    uri: path,
    isDirectory: true,
    contents: []
  };
}

export async function writeAsStringAsync(path: string, content: string): Promise<void> {
  mockFileSystem[path] = {
    exists: true,
    uri: path,
    size: content.length,
    isDirectory: false
  };
}

export async function readAsStringAsync(path: string): Promise<string> {
  const info = mockFileSystem[path];
  if (!info || info.isDirectory) {
    throw new Error(`File not found: ${path}`);
  }
  return 'mock file content';
}