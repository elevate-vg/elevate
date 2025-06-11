import { describe, it, expect, beforeEach, vi } from 'vitest';
import { runPromise } from 'effect/Effect';
import { scanDirectoryRecursive, parseRomFile, scanRoms, exportToYaml, saveYamlToFile } from './scanner';
import type { RomFile, GameEntry } from './types';

// Mock expo-file-system
vi.mock('expo-file-system', () => ({
  readDirectoryAsync: vi.fn(),
  getInfoAsync: vi.fn(),
  writeAsStringAsync: vi.fn(),
  makeDirectoryAsync: vi.fn(),
  readAsStringAsync: vi.fn(),
}));

// Mock expo-device
vi.mock('expo-device', () => ({
  deviceName: 'Test Device',
  modelName: 'TestModel',
}));

import * as FileSystem from 'expo-file-system';

const mockReadDirectoryAsync = vi.mocked(FileSystem.readDirectoryAsync);
const mockGetInfoAsync = vi.mocked(FileSystem.getInfoAsync);

describe('Scanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
    vi.restoreAllMocks();
  });

  describe('scanDirectoryRecursive', () => {
    it('should return empty array for non-existent directory', async () => {
      // Arrange
      const testDir = '/test/nonexistent';
      const supportedExtensions = ['.nes', '.gb'];
      
      // Reset any previous mock implementations and set up rejection
      mockGetInfoAsync.mockReset();
      mockGetInfoAsync.mockRejectedValue(new Error('Directory does not exist'));

      // Act
      const result = await runPromise(scanDirectoryRecursive(testDir, supportedExtensions));

      // Assert
      expect(result).toEqual([]);
      expect(mockGetInfoAsync).toHaveBeenCalledWith(testDir);
    });

    it('should return empty array for empty directory', async () => {
      // Arrange
      const testDir = '/test/empty';
      const supportedExtensions = ['.nes', '.gb'];
      mockGetInfoAsync.mockResolvedValue({ 
        exists: true, 
        isDirectory: true, 
        uri: testDir,
        size: 0,
        modificationTime: Date.now()
      });
      mockReadDirectoryAsync.mockResolvedValue([]);

      // Act
      const result = await runPromise(scanDirectoryRecursive(testDir, supportedExtensions));

      // Assert
      expect(result).toEqual([]);
      expect(mockGetInfoAsync).toHaveBeenCalledWith(testDir);
      expect(mockReadDirectoryAsync).toHaveBeenCalledWith(testDir);
    });

    it('should find ROM files in single directory', async () => {
      // Arrange
      const testDir = '/test/roms';
      const supportedExtensions = ['.nes', '.gb'];
      const testFiles = ['mario.nes', 'zelda.nes', 'pokemon.gb', 'readme.txt'];
      
      // Mock directory check first
      mockGetInfoAsync.mockResolvedValueOnce({ 
        exists: true, 
        isDirectory: true, 
        uri: testDir,
        size: 0,
        modificationTime: Date.now()
      });
      mockReadDirectoryAsync.mockResolvedValue(testFiles);
      
      // Mock file info for each file
      mockGetInfoAsync
        .mockResolvedValueOnce({ isDirectory: false, size: 1024, modificationTime: 1640995200000, exists: true } as any)
        .mockResolvedValueOnce({ isDirectory: false, size: 2048, modificationTime: 1640995200000, exists: true } as any)
        .mockResolvedValueOnce({ isDirectory: false, size: 512, modificationTime: 1640995200000, exists: true } as any)
        .mockResolvedValueOnce({ isDirectory: false, size: 100, modificationTime: 1640995200000, exists: true } as any);

      // Act
      const result = await runPromise(scanDirectoryRecursive(testDir, supportedExtensions));

      // Assert
      expect(result).toHaveLength(3); // Only ROM files
      expect(result.map(r => r.filename)).toEqual(['mario.nes', 'zelda.nes', 'pokemon.gb']);
      expect(result[0]).toMatchObject({
        filename: 'mario.nes',
        path: '/test/roms/mario.nes',
        extension: '.nes',
        fileSize: 1024,
      });
    });

    it('should recursively scan subdirectories', async () => {
      // Arrange
      const testDir = '/test/roms';
      const supportedExtensions = ['.nes'];
      
      // Mock initial directory check
      mockGetInfoAsync.mockResolvedValueOnce({ 
        exists: true, 
        isDirectory: true, 
        uri: testDir,
        size: 0,
        modificationTime: Date.now()
      });
      
      // Root directory contains subdirectory
      mockReadDirectoryAsync
        .mockResolvedValueOnce(['nes/']) // Root directory
        .mockResolvedValueOnce(['mario.nes']); // Subdirectory
      
      mockGetInfoAsync
        .mockResolvedValueOnce({ isDirectory: true, exists: true, uri: '/test/roms/nes/', size: 0, modificationTime: Date.now() }) // nes/ is directory
        .mockResolvedValueOnce({ 
          exists: true, 
          isDirectory: true, 
          uri: '/test/roms/nes/',
          size: 0,
          modificationTime: Date.now()
        }) // nes/ directory check
        .mockResolvedValueOnce({ isDirectory: false, size: 1024, modificationTime: 1640995200000, exists: true, uri: '/test/roms/nes/mario.nes' }); // mario.nes is file

      // Act
      const result = await runPromise(scanDirectoryRecursive(testDir, supportedExtensions));

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        filename: 'mario.nes',
        path: '/test/roms/nes/mario.nes',
        extension: '.nes',
      });
      expect(mockReadDirectoryAsync).toHaveBeenCalledTimes(2);
    });

    it('should filter out non-ROM files', async () => {
      // Arrange
      const testDir = '/test/mixed';
      const supportedExtensions = ['.nes', '.gb'];
      const testFiles = ['game.nes', 'save.sav', 'image.png', 'rom.gb', 'document.txt'];
      
      // Mock directory check first
      mockGetInfoAsync.mockResolvedValueOnce({ 
        exists: true, 
        isDirectory: true, 
        uri: testDir,
        size: 0,
        modificationTime: Date.now()
      });
      mockReadDirectoryAsync.mockResolvedValue(testFiles);
      
      // Mock all as regular files
      testFiles.forEach(() => {
        mockGetInfoAsync.mockResolvedValueOnce({ 
          isDirectory: false, 
          size: 1024, 
          modificationTime: 1640995200000, 
          exists: true 
        } as any);
      });

      // Act
      const result = await runPromise(scanDirectoryRecursive(testDir, supportedExtensions));

      // Assert
      expect(result).toHaveLength(2);
      expect(result.map(r => r.filename)).toEqual(['game.nes', 'rom.gb']);
    });

    it('should handle file access errors gracefully', async () => {
      // Arrange
      const testDir = '/test/error';
      const supportedExtensions = ['.nes'];
      
      // Mock directory check first (directory exists)
      mockGetInfoAsync.mockResolvedValueOnce({ exists: true, isDirectory: true, uri: testDir, size: 0, modificationTime: Date.now() });
      mockReadDirectoryAsync.mockRejectedValue(new Error('Permission denied'));

      // Act & Assert
      await expect(runPromise(scanDirectoryRecursive(testDir, supportedExtensions)))
        .rejects
        .toThrow();
    });

    it('should handle file info errors for individual files', async () => {
      // Arrange
      const testDir = '/test/partial-error';
      const supportedExtensions = ['.nes'];
      const testFiles = ['good.nes', 'bad.nes'];
      
      // Mock directory check first
      mockGetInfoAsync.mockResolvedValueOnce({ 
        exists: true, 
        isDirectory: true, 
        uri: testDir,
        size: 0,
        modificationTime: Date.now()
      });
      mockReadDirectoryAsync.mockResolvedValue(testFiles);
      mockGetInfoAsync
        .mockResolvedValueOnce({ isDirectory: false, size: 1024, modificationTime: 1640995200000, exists: true } as any)
        .mockRejectedValueOnce(new Error('File not found'));

      // Act
      const result = await runPromise(scanDirectoryRecursive(testDir, supportedExtensions));

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].filename).toBe('good.nes');
    });
  });

  describe('parseRomFile', () => {
    const sampleRomFile: RomFile = {
      filename: 'Super Mario Bros (USA).nes',
      path: '/roms/nes/Super Mario Bros (USA).nes',
      extension: '.nes',
      fileSize: 40960,
      lastModified: new Date('2024-01-01T00:00:00Z'),
    };

    it('should extract metadata from ROM file', async () => {
      // Act
      const result = await runPromise(parseRomFile(sampleRomFile));

      // Assert
      expect(result).toMatchObject({
        filename: 'Super Mario Bros (USA).nes',
        path: '/roms/nes/Super Mario Bros (USA).nes',
        platform: 'nes',
        title: 'Super Mario Bros',
        fileSize: 40960,
      });
      expect(result.checksum).toBeDefined();
      expect(typeof result.checksum).toBe('string');
    });

    it('should detect platform from file extension', async () => {
      // Arrange
      const testCases = [
        { extension: '.nes', expectedPlatform: 'nes' },
        { extension: '.gb', expectedPlatform: 'gb' },
        { extension: '.gbc', expectedPlatform: 'gbc' },
        { extension: '.gba', expectedPlatform: 'gba' },
        { extension: '.snes', expectedPlatform: 'snes' },
        { extension: '.n64', expectedPlatform: 'n64' },
        { extension: '.genesis', expectedPlatform: 'genesis' },
      ];

      // No longer need to mock crypto

      // Act & Assert
      for (const { extension, expectedPlatform } of testCases) {
        const testFile = { ...sampleRomFile, extension, filename: `test${extension}` };
        const result = await runPromise(parseRomFile(testFile));
        expect(result.platform).toBe(expectedPlatform);
      }
    });

    it('should clean title by removing parentheses and brackets', async () => {
      // Arrange
      const testCases = [
        { filename: 'Super Mario Bros (USA).nes', expectedTitle: 'Super Mario Bros' },
        { filename: 'Zelda [!].nes', expectedTitle: 'Zelda' },
        { filename: 'Pokemon Red (USA, Europe) [S][!].gb', expectedTitle: 'Pokemon Red' },
        { filename: 'Final Fantasy (Rev 1).nes', expectedTitle: 'Final Fantasy' },
      ];

      // No longer need to mock crypto

      // Act & Assert
      for (const { filename, expectedTitle } of testCases) {
        const testFile = { ...sampleRomFile, filename, extension: '.nes' };
        const result = await runPromise(parseRomFile(testFile));
        expect(result.title).toBe(expectedTitle);
      }
    });

    it('should fail for unknown platform extension', async () => {
      // Arrange
      const invalidRomFile = { ...sampleRomFile, extension: '.unknown' };

      // Act & Assert
      await expect(runPromise(parseRomFile(invalidRomFile)))
        .rejects
        .toThrow('Unknown platform for extension: .unknown');
    });

    it('should handle metadata parsing successfully', async () => {
      // Act
      const result = await runPromise(parseRomFile(sampleRomFile));

      // Assert
      expect(result.checksum).toBeDefined();
      expect(typeof result.checksum).toBe('string');
      expect(result.checksum.length).toBeGreaterThan(0);
    });

    it('should preserve original file metadata', async () => {
      // Arrange
      const testDate = new Date('2023-12-25T10:30:00Z');
      const testFile = { ...sampleRomFile, lastModified: testDate, fileSize: 123456 };

      // Act
      const result = await runPromise(parseRomFile(testFile));

      // Assert
      expect(result.lastModified).toEqual(testDate);
      expect(result.fileSize).toBe(123456);
      expect(result.path).toBe(testFile.path);
      expect(result.filename).toBe(testFile.filename);
      expect(result.checksum).toBeDefined();
    });
  });

  describe('scanRoms', () => {
    const supportedExtensions = ['.nes', '.gb', '.gbc', '.gba'];

    it('should return empty array when scanning empty directories', async () => {
      // Arrange
      const scanPaths = ['/test/empty1', '/test/empty2'];
      
      // Mock directory checks for both paths
      mockGetInfoAsync
        .mockResolvedValueOnce({ exists: true, isDirectory: true, uri: '/test/empty1', size: 0, modificationTime: Date.now() })
        .mockResolvedValueOnce({ exists: true, isDirectory: true, uri: '/test/empty2', size: 0, modificationTime: Date.now() });
      mockReadDirectoryAsync.mockResolvedValue([]);

      // Act
      const result = await runPromise(scanRoms(scanPaths, supportedExtensions));

      // Assert
      expect(result).toEqual([]);
      expect(mockReadDirectoryAsync).toHaveBeenCalledTimes(2);
    });

    it('should scan single directory and return game entries', async () => {
      // Arrange
      const scanPaths = ['/test/roms'];
      const testFiles = ['Super Mario Bros (USA).nes', 'Pokemon Red (USA).gb'];
      
      // Mock directory check first
      mockGetInfoAsync.mockResolvedValueOnce({ exists: true, isDirectory: true, uri: '/test/roms', size: 0, modificationTime: Date.now() });
      mockReadDirectoryAsync.mockResolvedValue(testFiles);
      mockGetInfoAsync
        .mockResolvedValueOnce({ isDirectory: false, size: 40960, modificationTime: 1640995200000, exists: true } as any)
        .mockResolvedValueOnce({ isDirectory: false, size: 1048576, modificationTime: 1640995200000, exists: true } as any);

      // Act
      const result = await runPromise(scanRoms(scanPaths, supportedExtensions));

      // Assert
      expect(result).toHaveLength(2);
      
      // Check first game entry
      expect(result[0]).toMatchObject({
        platform: 'nes',
        files: [{
          path: '/test/roms/Super Mario Bros (USA).nes',
          size: 40960,
        }],
        release: {
          title: 'Super Mario Bros',
        },
      });
      
      // Check ID generation
      expect(result[0].id).toMatch(/^super-mario-bros-nes-/);
      expect(result[0].lastModified).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      
      // Check second game entry
      expect(result[1]).toMatchObject({
        platform: 'gb',
        files: [{
          path: '/test/roms/Pokemon Red (USA).gb',
          size: 1048576,
        }],
        release: {
          title: 'Pokemon Red',
        },
      });
    });

    it('should scan multiple directories and combine results', async () => {
      // Arrange
      const scanPaths = ['/test/nes-roms', '/test/gb-roms'];
      
      // Use implementation-based mocking to handle concurrent calls correctly
      mockGetInfoAsync.mockImplementation(async (path: string) => {
        if (path === '/test/nes-roms' || path === '/test/gb-roms') {
          return { exists: true, isDirectory: true, uri: path, size: 0, modificationTime: Date.now() };
        }
        // File info calls
        if (path.endsWith('mario.nes')) {
          return { isDirectory: false, size: 1024, modificationTime: 1640995200000, exists: true, uri: path };
        }
        if (path.endsWith('zelda.nes')) {
          return { isDirectory: false, size: 2048, modificationTime: 1640995200000, exists: true, uri: path };
        }
        if (path.endsWith('pokemon.gb')) {
          return { isDirectory: false, size: 512, modificationTime: 1640995200000, exists: true, uri: path };
        }
        throw new Error(`Unexpected path: ${path}`);
      });
      
      mockReadDirectoryAsync.mockImplementation(async (path: string) => {
        if (path === '/test/nes-roms') {
          return ['mario.nes', 'zelda.nes'];
        }
        if (path === '/test/gb-roms') {
          return ['pokemon.gb'];
        }
        throw new Error(`Unexpected directory: ${path}`);
      });

      // Act
      const result = await runPromise(scanRoms(scanPaths, supportedExtensions));

      // Assert
      expect(result).toHaveLength(3);
      // Results might not be in a specific order due to parallel processing
      const titles = result.map(r => r.release.title).sort();
      const platforms = result.map(r => r.platform).sort();
      expect(titles).toEqual(['mario', 'pokemon', 'zelda']);
      expect(platforms).toEqual(['gb', 'nes', 'nes']);
    });

    it('should generate unique IDs for each game', async () => {
      // Arrange
      const scanPaths = ['/test/duplicates'];
      const testFiles = ['Game1.nes', 'Game2.nes', 'Game1 (Copy).nes'];
      
      // Mock directory check first
      mockGetInfoAsync.mockResolvedValueOnce({ exists: true, isDirectory: true, uri: '/test/duplicates', size: 0, modificationTime: Date.now() });
      
      mockReadDirectoryAsync.mockResolvedValue(testFiles);
      mockGetInfoAsync
        .mockResolvedValueOnce({ isDirectory: false, size: 1000, modificationTime: 1640995200000, exists: true } as any) // Game1.nes
        .mockResolvedValueOnce({ isDirectory: false, size: 2000, modificationTime: 1640995200000, exists: true } as any) // Game2.nes  
        .mockResolvedValueOnce({ isDirectory: false, size: 1500, modificationTime: 1640995201000, exists: true } as any); // Game1 (Copy).nes - different size AND time

      // Act
      const result = await runPromise(scanRoms(scanPaths, supportedExtensions));

      // Assert
      expect(result).toHaveLength(3);
      
      const gameIds = result.map(r => r.id);
      const uniqueIds = new Set(gameIds);
      expect(uniqueIds.size).toBe(3); // All IDs should be unique
      
      // IDs should be different even for same title due to different checksums
      expect(gameIds.filter(id => id.startsWith('game1-nes-'))).toHaveLength(2);
    });

    it('should handle errors in individual directories gracefully', async () => {
      // Arrange
      const scanPaths = ['/test/good', '/test/bad', '/test/also-good'];
      
      // Use implementation-based mocking to handle the error gracefully
      mockGetInfoAsync.mockImplementation(async (path: string) => {
        if (path === '/test/good' || path === '/test/bad' || path === '/test/also-good') {
          return { exists: true, isDirectory: true, uri: path, size: 0, modificationTime: Date.now() };
        }
        // File info calls
        if (path.endsWith('game.nes')) {
          return { isDirectory: false, size: 1024, modificationTime: 1640995200000, exists: true, uri: path };
        }
        if (path.endsWith('another.gb')) {
          return { isDirectory: false, size: 512, modificationTime: 1640995200000, exists: true, uri: path };
        }
        throw new Error(`Unexpected path: ${path}`);
      });
      
      mockReadDirectoryAsync.mockImplementation(async (path: string) => {
        if (path === '/test/good') {
          return ['game.nes'];
        }
        if (path === '/test/bad') {
          throw new Error('Permission denied');
        }
        if (path === '/test/also-good') {
          return ['another.gb'];
        }
        throw new Error(`Unexpected directory: ${path}`);
      });

      // Act & Assert - Should still fail because one directory has permission error
      await expect(runPromise(scanRoms(scanPaths, supportedExtensions)))
        .rejects
        .toThrow();
    });

    it('should filter files by supported extensions only', async () => {
      // Arrange
      const scanPaths = ['/test/mixed'];
      const testFiles = ['game.nes', 'save.sav', 'rom.gb', 'image.png', 'other.gba', 'doc.txt'];
      const limitedExtensions = ['.nes', '.gb']; // Only these should be included
      
      // Mock directory check first
      mockGetInfoAsync.mockResolvedValueOnce({ exists: true, isDirectory: true, uri: '/test/mixed', size: 0, modificationTime: Date.now() });
      
      mockReadDirectoryAsync.mockResolvedValue(testFiles);
      
      // Mock all files as regular files, but only ROM files will be processed
      mockGetInfoAsync
        .mockResolvedValueOnce({ isDirectory: false, size: 1024, modificationTime: 1640995200000, exists: true } as any) // game.nes
        .mockResolvedValueOnce({ isDirectory: false, size: 1024, modificationTime: 1640995200000, exists: true } as any) // save.sav
        .mockResolvedValueOnce({ isDirectory: false, size: 1024, modificationTime: 1640995200000, exists: true } as any) // rom.gb
        .mockResolvedValueOnce({ isDirectory: false, size: 1024, modificationTime: 1640995200000, exists: true } as any) // image.png
        .mockResolvedValueOnce({ isDirectory: false, size: 1024, modificationTime: 1640995200000, exists: true } as any) // other.gba
        .mockResolvedValueOnce({ isDirectory: false, size: 1024, modificationTime: 1640995200000, exists: true } as any); // doc.txt

      // Act
      const result = await runPromise(scanRoms(scanPaths, limitedExtensions));

      // Assert
      expect(result).toHaveLength(2);
      expect(result.map(r => r.files[0].path)).toEqual([
        '/test/mixed/game.nes',
        '/test/mixed/rom.gb'
      ]);
    });

    it('should populate all required GameEntry fields correctly', async () => {
      // Arrange
      const scanPaths = ['/test/complete'];
      const testFiles = ['Complete Game (USA) [!].nes'];
      
      // Mock directory check first
      mockGetInfoAsync.mockResolvedValueOnce({ exists: true, isDirectory: true, uri: '/test/complete', size: 0, modificationTime: Date.now() });
      
      mockReadDirectoryAsync.mockResolvedValue(testFiles);
      mockGetInfoAsync.mockResolvedValueOnce({ 
        isDirectory: false, 
        size: 32768, 
        modificationTime: 1640995200000, 
        exists: true 
      } as any);

      // Act
      const result = await runPromise(scanRoms(scanPaths, supportedExtensions));

      // Assert
      expect(result).toHaveLength(1);
      const game = result[0];
      
      // Check all required fields are present
      expect(game.id).toBeDefined();
      expect(typeof game.id).toBe('string');
      expect(game.id.length).toBeGreaterThan(0);
      
      expect(game.platform).toBe('nes');
      
      // hosts field was removed from GameEntry type
      
      expect(game.lastModified).toBeDefined();
      expect(typeof game.lastModified).toBe('string');
      expect(game.lastModified).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      
      expect(game.files).toBeDefined();
      expect(Array.isArray(game.files)).toBe(true);
      expect(game.files).toHaveLength(1);
      expect(game.files[0]).toMatchObject({
        path: '/test/complete/Complete Game (USA) [!].nes',
        size: 32768, // This should match the mock
        checksum: expect.any(String),
      });
      
      expect(game.release).toBeDefined();
      expect(game.release.title).toBe('Complete Game');
    });

    it('should handle recursive directory scanning', async () => {
      // Arrange
      const scanPaths = ['/test/nested'];
      
      // Mock initial directory check
      mockGetInfoAsync.mockResolvedValueOnce({ exists: true, isDirectory: true, uri: '/test/nested', size: 0, modificationTime: Date.now() });
      
      mockReadDirectoryAsync
        .mockResolvedValueOnce(['subdir']) // Root has subdirectory (no trailing slash)
        .mockResolvedValueOnce(['deep.nes']); // Subdirectory has ROM
      
      mockGetInfoAsync
        .mockResolvedValueOnce({ isDirectory: true, exists: true } as any) // subdir is directory
        .mockResolvedValueOnce({ exists: true, isDirectory: true, uri: '/test/nested/subdir', size: 0, modificationTime: Date.now() }) // subdir directory check
        .mockResolvedValueOnce({ isDirectory: false, size: 1024, modificationTime: 1640995200000, exists: true } as any); // deep.nes is file

      // Act
      const result = await runPromise(scanRoms(scanPaths, supportedExtensions));

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].files[0].path).toBe('/test/nested/subdir/deep.nes');
      expect(result[0].release.title).toBe('deep');
    });
  });

  describe('exportToYaml', () => {
    it('should export empty games array to YAML', () => {
      // Arrange
      const games: GameEntry[] = [];

      // Act
      const result = exportToYaml(games);

      // Assert
      expect(result).toContain('metadata:');
      expect(result).toContain('scan_date:');
      expect(result).toContain('total_games: 0');
      expect(result).toContain('games: []');
      expect(result).toMatch(/scan_date: '\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z'/);
    });

    it('should export single game to YAML', () => {
      // Arrange
      const games: GameEntry[] = [{
        id: 'super-mario-bros-nes-abc123',
        platform: 'nes',
        lastModified: '2024-01-01T00:00:00.000Z',
        files: [{
          path: '/roms/Super Mario Bros.nes',
          size: 40960,
          checksum: 'abc123def456'
        }],
        release: {
          title: 'Super Mario Bros',
          language: 'en',
          genre: 'platformer'
        }
      }];

      // Act
      const result = exportToYaml(games);

      // Assert
      expect(result).toContain('total_games: 1');
      expect(result).toContain('- id: super-mario-bros-nes-abc123');
      expect(result).toContain('platform: nes');
      expect(result).toContain('last_modified: "2024-01-01T00:00:00.000Z"');
      expect(result).toContain('path: /roms/Super Mario Bros.nes');
      expect(result).toContain('size: 40960');
      expect(result).toContain('checksum: abc123def456');
      expect(result).toContain('title: Super Mario Bros');
      expect(result).toContain('language: en');
      expect(result).toContain('genre: platformer');
    });

    it('should export multiple games to YAML', () => {
      // Arrange
      const games: GameEntry[] = [
        {
          id: 'mario-nes-123',
          platform: 'nes',
          lastModified: '2024-01-01T00:00:00.000Z',
          files: [{ path: '/roms/mario.nes', size: 1024, checksum: '123' }],
          release: { title: 'Mario' }
        },
        {
          id: 'zelda-nes-456',
          platform: 'nes', 
          lastModified: '2024-01-02T00:00:00.000Z',
          files: [{ path: '/roms/zelda.nes', size: 2048, checksum: '456' }],
          release: { title: 'Zelda' }
        }
      ];

      // Act
      const result = exportToYaml(games);

      // Assert
      expect(result).toContain('total_games: 2');
      expect(result.split('- id:').length - 1).toBe(2); // Two game entries
      expect(result).toContain('id: mario-nes-123');
      expect(result).toContain('id: zelda-nes-456');
      expect(result).toContain('title: Mario');
      expect(result).toContain('title: Zelda');
    });

    it('should handle special characters in game names and paths', () => {
      // Arrange
      const games: GameEntry[] = [{
        id: 'special-chars-test',
        platform: 'nes',
        lastModified: '2024-01-01T00:00:00.000Z',
        files: [{
          path: '/roms/Game with "quotes" & symbols.nes',
          size: 1024,
          checksum: 'special123'
        }],
        release: {
          title: 'Game with "quotes" & symbols',
          developer: "Company's Name"
        }
      }];

      // Act
      const result = exportToYaml(games);

      // Assert
      expect(result).toContain('total_games: 1');
      // YAML should properly escape or quote special characters
      expect(result).toContain('path: "/roms/Game with \\"quotes\\" & symbols.nes"');
      expect(result).toContain('title: "Game with \\"quotes\\" & symbols"');
      expect(result).toContain("developer: \"Company\\'s Name\"");
    });

    it('should include metadata section with scan date and version', () => {
      // Arrange
      const games: GameEntry[] = [];

      // Act
      const result = exportToYaml(games);

      // Assert
      expect(result).toContain('metadata:');
      expect(result).toContain('scan_date:');
      expect(result).toContain('total_games: 0');
      expect(result).toContain('version: 1.0');
      
      // Check scan date format (ISO string)
      const scanDateMatch = result.match(/scan_date: '(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)'/);
      expect(scanDateMatch).toBeTruthy();
      
      // Verify it's a valid date
      const scanDate = new Date(scanDateMatch![1]);
      expect(scanDate.getTime()).toBeGreaterThan(Date.now() - 10000); // Within last 10 seconds
    });

    it('should format YAML with proper indentation', () => {
      // Arrange
      const games: GameEntry[] = [{
        id: 'test-game',
        platform: 'nes',
        lastModified: '2024-01-01T00:00:00.000Z',
        files: [{ path: '/test.nes', size: 1024, checksum: 'test123' }],
        release: { title: 'Test Game' }
      }];

      // Act
      const result = exportToYaml(games);

      // Assert
      const lines = result.split('\n');
      
      // Check indentation levels
      expect(lines.some(line => line.startsWith('metadata:'))).toBe(true);
      expect(lines.some(line => line.startsWith('  scan_date:'))).toBe(true);
      expect(lines.some(line => line.startsWith('games:'))).toBe(true);
      expect(lines.some(line => line.startsWith('  - id:'))).toBe(true);
      expect(lines.some(line => line.startsWith('    platform:'))).toBe(true);
      expect(lines.some(line => line.startsWith('    files:'))).toBe(true);
      expect(lines.some(line => line.startsWith('      - path:'))).toBe(true);
      expect(lines.some(line => line.startsWith('        size:'))).toBe(true);
    });

    it('should handle games with optional release fields', () => {
      // Arrange
      const games: GameEntry[] = [{
        id: 'minimal-game',
        platform: 'gb',
        lastModified: '2024-01-01T00:00:00.000Z',
        files: [{ path: '/minimal.gb', size: 512, checksum: 'min123' }],
        release: { title: 'Minimal Game' } // Only required field
      }];

      // Act
      const result = exportToYaml(games);

      // Assert
      expect(result).toContain('title: Minimal Game');
      expect(result).not.toContain('language:');
      expect(result).not.toContain('genre:');
      expect(result).not.toContain('developer:');
      expect(result).not.toContain('releaseYear:');
    });

    it('should handle games with all optional release fields', () => {
      // Arrange
      const games: GameEntry[] = [{
        id: 'complete-game',
        platform: 'snes',
        lastModified: '2024-01-01T00:00:00.000Z',
        files: [{ path: '/complete.snes', size: 2048, checksum: 'comp123' }],
        release: {
          title: 'Complete Game',
          language: 'ja',
          genre: 'rpg',
          developer: 'Game Studio',
          releaseYear: 1995
        }
      }];

      // Act
      const result = exportToYaml(games);

      // Assert
      expect(result).toContain('title: Complete Game');
      expect(result).toContain('language: ja');
      expect(result).toContain('genre: rpg');
      expect(result).toContain('developer: Game Studio');
      expect(result).toContain('release_year: 1995');
    });
  });

  describe('saveYamlToFile', () => {
    const mockWriteAsStringAsync = vi.mocked(FileSystem.writeAsStringAsync);
    const mockMakeDirectoryAsync = vi.mocked(FileSystem.makeDirectoryAsync);
    const mockGetInfoAsync = vi.mocked(FileSystem.getInfoAsync);

    beforeEach(() => {
      vi.resetAllMocks();
    });

    it('should successfully write YAML content to file', async () => {
      // Arrange
      const yamlContent = 'metadata:\n  scan_date: 2024-01-01\ngames: []';
      const filePath = '/storage/games.yaml';
      const dirPath = '/storage';
      
      mockGetInfoAsync.mockResolvedValue({ exists: true, isDirectory: true } as any);
      mockWriteAsStringAsync.mockResolvedValue(undefined);

      // Act
      const result = await runPromise(saveYamlToFile(yamlContent, filePath));

      // Assert
      expect(result).toBe(filePath);
      expect(mockWriteAsStringAsync).toHaveBeenCalledWith(filePath, yamlContent);
    });

    it('should create output directory if it does not exist', async () => {
      // Arrange
      const yamlContent = 'test yaml';
      const filePath = '/storage/output/games.yaml';
      const dirPath = '/storage/output';
      
      mockGetInfoAsync.mockResolvedValue({ exists: false } as any);
      mockMakeDirectoryAsync.mockResolvedValue(undefined);
      mockWriteAsStringAsync.mockResolvedValue(undefined);

      // Act
      const result = await runPromise(saveYamlToFile(yamlContent, filePath));

      // Assert
      expect(result).toBe(filePath);
      expect(mockGetInfoAsync).toHaveBeenCalledWith(dirPath);
      expect(mockMakeDirectoryAsync).toHaveBeenCalledWith(dirPath, { intermediates: true });
      expect(mockWriteAsStringAsync).toHaveBeenCalledWith(filePath, yamlContent);
    });

    it('should not create directory if it already exists', async () => {
      // Arrange
      const yamlContent = 'test yaml';
      const filePath = '/storage/existing/games.yaml';
      const dirPath = '/storage/existing';
      
      mockGetInfoAsync.mockResolvedValue({ exists: true, isDirectory: true } as any);
      mockWriteAsStringAsync.mockResolvedValue(undefined);

      // Act
      const result = await runPromise(saveYamlToFile(yamlContent, filePath));

      // Assert
      expect(result).toBe(filePath);
      expect(mockGetInfoAsync).toHaveBeenCalledWith(dirPath);
      expect(mockMakeDirectoryAsync).not.toHaveBeenCalled();
      expect(mockWriteAsStringAsync).toHaveBeenCalledWith(filePath, yamlContent);
    });

    it('should handle write permission errors', async () => {
      // Arrange
      const yamlContent = 'test yaml';
      const filePath = '/restricted/games.yaml';
      const dirPath = '/restricted';
      
      mockGetInfoAsync.mockResolvedValue({ exists: true, isDirectory: true } as any);
      mockWriteAsStringAsync.mockRejectedValue(new Error('Permission denied'));

      // Act & Assert
      await expect(runPromise(saveYamlToFile(yamlContent, filePath)))
        .rejects
        .toThrow('Failed to write YAML file');
    });

    it('should handle disk full errors', async () => {
      // Arrange
      const yamlContent = 'test yaml';
      const filePath = '/full-disk/games.yaml';
      const dirPath = '/full-disk';
      
      mockGetInfoAsync.mockResolvedValue({ exists: true, isDirectory: true } as any);
      mockWriteAsStringAsync.mockRejectedValue(new Error('No space left on device'));

      // Act & Assert
      await expect(runPromise(saveYamlToFile(yamlContent, filePath)))
        .rejects
        .toThrow('Failed to write YAML file');
    });

    it('should handle directory creation errors', async () => {
      // Arrange
      const yamlContent = 'test yaml';
      const filePath = '/restricted/new-dir/games.yaml';
      const dirPath = '/restricted/new-dir';
      
      mockGetInfoAsync.mockResolvedValue({ exists: false } as any);
      mockMakeDirectoryAsync.mockRejectedValue(new Error('Permission denied'));

      // Act & Assert
      await expect(runPromise(saveYamlToFile(yamlContent, filePath)))
        .rejects
        .toThrow('Failed to create output directory');
    });

    it('should overwrite existing files', async () => {
      // Arrange
      const yamlContent = 'new yaml content';
      const filePath = '/storage/existing-file.yaml';
      const dirPath = '/storage';
      
      mockGetInfoAsync.mockResolvedValue({ exists: true, isDirectory: true } as any);
      mockWriteAsStringAsync.mockResolvedValue(undefined);

      // Act
      const result = await runPromise(saveYamlToFile(yamlContent, filePath));

      // Assert
      expect(result).toBe(filePath);
      expect(mockWriteAsStringAsync).toHaveBeenCalledWith(filePath, yamlContent);
    });

    it('should handle nested directory creation', async () => {
      // Arrange
      const yamlContent = 'test yaml';
      const filePath = '/storage/deep/nested/path/games.yaml';
      const dirPath = '/storage/deep/nested/path';
      
      mockGetInfoAsync.mockResolvedValue({ exists: false } as any);
      mockMakeDirectoryAsync.mockResolvedValue(undefined);
      mockWriteAsStringAsync.mockResolvedValue(undefined);

      // Act
      const result = await runPromise(saveYamlToFile(yamlContent, filePath));

      // Assert
      expect(result).toBe(filePath);
      expect(mockMakeDirectoryAsync).toHaveBeenCalledWith(dirPath, { intermediates: true });
      expect(mockWriteAsStringAsync).toHaveBeenCalledWith(filePath, yamlContent);
    });

    it('should handle empty yaml content', async () => {
      // Arrange
      const yamlContent = '';
      const filePath = '/storage/empty.yaml';
      const dirPath = '/storage';
      
      mockGetInfoAsync.mockResolvedValue({ exists: true, isDirectory: true } as any);
      mockWriteAsStringAsync.mockResolvedValue(undefined);

      // Act
      const result = await runPromise(saveYamlToFile(yamlContent, filePath));

      // Assert
      expect(result).toBe(filePath);
      expect(mockWriteAsStringAsync).toHaveBeenCalledWith(filePath, '');
    });
  });

  describe('Integration: End-to-End YAML Export', () => {
    const mockWriteAsStringAsync = vi.mocked(FileSystem.writeAsStringAsync);
    const mockMakeDirectoryAsync = vi.mocked(FileSystem.makeDirectoryAsync);
    const mockReadAsStringAsync = vi.mocked(FileSystem.readAsStringAsync);

    beforeEach(() => {
      vi.resetAllMocks();
    });

    it('should scan ROMs, export to YAML, and save to file', async () => {
      // Arrange
      const scanPaths = ['/test/roms'];
      const supportedExtensions = ['.nes', '.gb'];
      const outputPath = '/output/test-games.yaml';
      
      // Mock scanning - directory check first
      mockGetInfoAsync.mockResolvedValueOnce({ exists: true, isDirectory: true, uri: '/test/roms', size: 0, modificationTime: Date.now() });
      mockReadDirectoryAsync.mockResolvedValue(['mario.nes', 'zelda.gb']);
      mockGetInfoAsync
        .mockResolvedValueOnce({ isDirectory: false, size: 1024, modificationTime: 1640995200000, exists: true } as any)
        .mockResolvedValueOnce({ isDirectory: false, size: 2048, modificationTime: 1640995201000, exists: true } as any)
        .mockResolvedValueOnce({ exists: true, isDirectory: true } as any); // Output directory exists
      
      // Mock file writing
      mockWriteAsStringAsync.mockResolvedValue(undefined);

      // Act: Full pipeline from scan to file save
      const games = await runPromise(scanRoms(scanPaths, supportedExtensions));
      const yamlContent = exportToYaml(games);
      const savedPath = await runPromise(saveYamlToFile(yamlContent, outputPath));

      // Assert
      expect(games).toHaveLength(2);
      expect(savedPath).toBe(outputPath);
      expect(mockWriteAsStringAsync).toHaveBeenCalledWith(outputPath, yamlContent);
      
      // Check YAML content structure
      expect(yamlContent).toContain('metadata:');
      expect(yamlContent).toContain('total_games: 2');
      expect(yamlContent).toContain('games:');
      expect(yamlContent).toContain('- id:');
      expect(yamlContent).toContain('platform: nes');
      expect(yamlContent).toContain('platform: gb');
    });

    it('should generate valid YAML that can be parsed back', async () => {
      // Arrange
      const games: GameEntry[] = [{
        id: 'test-game-nes-123',
        platform: 'nes',
        lastModified: '2024-01-01T00:00:00.000Z',
        files: [{ path: '/test.nes', size: 1024, checksum: 'test123' }],
        release: { title: 'Test Game', developer: 'Test Studio' }
      }];

      const outputPath = '/output/parseable.yaml';
      const dirPath = '/output';
      
      mockGetInfoAsync.mockResolvedValue({ exists: true, isDirectory: true } as any);
      mockWriteAsStringAsync.mockResolvedValue(undefined);
      mockReadAsStringAsync.mockImplementation((path: string) => {
        if (path === outputPath) {
          return Promise.resolve(exportToYaml(games));
        }
        return Promise.reject(new Error('File not found'));
      });

      // Act: Export and save
      const yamlContent = exportToYaml(games);
      await runPromise(saveYamlToFile(yamlContent, outputPath));
      
      // Act: Read back and parse with js-yaml
      const savedContent = await mockReadAsStringAsync(outputPath);
      const parsedData = await import('js-yaml').then(yaml => yaml.load(savedContent));

      // Assert: Verify parsed structure
      expect(parsedData).toHaveProperty('metadata');
      expect(parsedData).toHaveProperty('games');
      expect((parsedData as any).metadata).toHaveProperty('scan_date');
      expect((parsedData as any).metadata).toHaveProperty('total_games', 1);
      expect((parsedData as any).games).toHaveLength(1);
      expect((parsedData as any).games[0]).toHaveProperty('id', 'test-game-nes-123');
      expect((parsedData as any).games[0]).toHaveProperty('platform', 'nes');
      expect((parsedData as any).games[0].release).toHaveProperty('title', 'Test Game');
    });

    it('should validate YAML schema structure', async () => {
      // Arrange
      const games: GameEntry[] = [
        {
          id: 'mario-nes-123',
          platform: 'nes',
          lastModified: '2024-01-01T00:00:00.000Z',
          files: [{ path: '/mario.nes', size: 1024, checksum: '123' }],
          release: { title: 'Mario' }
        },
        {
          id: 'zelda-gb-456',
          platform: 'gb',
          lastModified: '2024-01-02T00:00:00.000Z',
          files: [{ path: '/zelda.gb', size: 2048, checksum: '456' }],
          release: { title: 'Zelda', genre: 'adventure' }
        }
      ];

      // Act
      const yamlContent = exportToYaml(games);
      const parsedData = await import('js-yaml').then(yaml => yaml.load(yamlContent));

      // Assert: Validate complete schema
      expect(parsedData).toMatchObject({
        metadata: {
          scan_date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/),
          total_games: 2,
          version: 1.0
        },
        games: [
          {
            id: 'mario-nes-123',
            platform: 'nes',
            last_modified: "2024-01-01T00:00:00.000Z",
            files: [
              {
                path: '/mario.nes',
                size: 1024,
                checksum: 123  // YAML parser may treat numbers as numbers
              }
            ],
            release: {
              title: 'Mario'
            }
          },
          {
            id: 'zelda-gb-456',
            platform: 'gb',
            last_modified: "2024-01-02T00:00:00.000Z",
            files: [
              {
                path: '/zelda.gb',
                size: 2048,
                checksum: 456  // YAML parser may treat numbers as numbers
              }
            ],
            release: {
              title: 'Zelda',
              genre: 'adventure'
            }
          }
        ]
      });
    });

    it('should handle empty scan results and generate valid YAML', async () => {
      // Arrange
      const scanPaths = ['/test/empty'];
      const supportedExtensions = ['.nes', '.gb'];
      const outputPath = '/output/empty-games.yaml';
      const dirPath = '/output';
      
      // Mock directory check first
      mockGetInfoAsync
        .mockResolvedValueOnce({ exists: true, isDirectory: true, uri: '/test/empty', size: 0, modificationTime: Date.now() })
        .mockResolvedValueOnce({ exists: true, isDirectory: true } as any); // Output directory exists
      mockReadDirectoryAsync.mockResolvedValue([]);
      mockWriteAsStringAsync.mockResolvedValue(undefined);

      // Act: Full pipeline with empty results
      const games = await runPromise(scanRoms(scanPaths, supportedExtensions));
      const yamlContent = exportToYaml(games);
      const savedPath = await runPromise(saveYamlToFile(yamlContent, outputPath));

      // Assert
      expect(games).toHaveLength(0);
      expect(savedPath).toBe(outputPath);
      expect(yamlContent).toContain('total_games: 0');
      expect(yamlContent).toContain('games: []');
      
      // Verify it's still valid YAML
      const parsedData = await import('js-yaml').then(yaml => yaml.load(yamlContent));
      expect(parsedData).toHaveProperty('metadata');
      expect(parsedData).toHaveProperty('games');
      expect((parsedData as any).games).toEqual([]);
    });

    it('should preserve all game metadata through the export process', async () => {
      // Arrange
      const scanPaths = ['/test/complete'];
      const supportedExtensions = ['.nes'];
      const outputPath = '/output/complete-metadata.yaml';
      
      // Mock directory check first
      mockGetInfoAsync.mockResolvedValueOnce({ exists: true, isDirectory: true, uri: '/test/complete', size: 0, modificationTime: Date.now() });
      mockReadDirectoryAsync.mockResolvedValue(['Complete Game (USA) [!].nes']);
      mockGetInfoAsync
        .mockResolvedValueOnce({ 
          isDirectory: false, 
          size: 32768, 
          modificationTime: 1640995200000, 
          exists: true 
        } as any)
        .mockResolvedValueOnce({ exists: true, isDirectory: true } as any);
      
      mockWriteAsStringAsync.mockResolvedValue(undefined);

      // Act: Full pipeline
      const games = await runPromise(scanRoms(scanPaths, supportedExtensions));
      const yamlContent = exportToYaml(games);
      await runPromise(saveYamlToFile(yamlContent, outputPath));

      // Assert: Parse and verify all metadata is preserved
      const parsedData = await import('js-yaml').then(yaml => yaml.load(yamlContent));
      const game = (parsedData as any).games[0];
      
      expect(game).toHaveProperty('id');
      expect(game).toHaveProperty('platform', 'nes');
      expect(game).toHaveProperty('last_modified');
      expect(game).toHaveProperty('files');
      expect(game.files).toHaveLength(1);
      expect(game.files[0]).toHaveProperty('path', '/test/complete/Complete Game (USA) [!].nes');
      expect(game.files[0]).toHaveProperty('size', 32768);
      expect(game.files[0]).toHaveProperty('checksum');
      expect(game).toHaveProperty('release');
      expect(game.release).toHaveProperty('title', 'Complete Game');
    });
  });
});