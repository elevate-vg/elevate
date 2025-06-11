import { runPromiseExit } from 'effect/Effect';
import { isSuccess, isFailure } from 'effect/Exit';
import { failureOption } from 'effect/Cause';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  FileNotFoundError,
  NotADirectoryError,
  NotAFileError,
  PermissionError,
  readDirectory,
  getFileInfo,
  calculateChecksum,
  type DirectoryEntry,
  type FileInfo,
} from './file-operations';

// Mock expo-file-system for testing
vi.mock('expo-file-system', () => ({
  readDirectoryAsync: vi.fn(),
  getInfoAsync: vi.fn(),
  readAsStringAsync: vi.fn(),
  EncodingType: {
    Base64: 'base64',
  },
}));

describe('File Operations', () => {
  let readDirectory: any;
  let getFileInfo: any;
  let calculateChecksum: any;
  let FileSystem: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Dynamic imports to avoid React Native issues
    const fileOps = await import('./file-operations');
    readDirectory = fileOps.readDirectory;
    getFileInfo = fileOps.getFileInfo;
    calculateChecksum = fileOps.calculateChecksum;
    
    FileSystem = await import('expo-file-system');
  });

  describe('readDirectory', () => {
    it('should return array of DirectoryEntry objects for valid directory', async () => {
      const mockFiles = ['file1.rom', 'file2.rom', 'subdir'];
      const mockPath = '/storage/roms';
      
      vi.mocked(FileSystem.readDirectoryAsync).mockResolvedValueOnce(mockFiles);
      vi.mocked(FileSystem.getInfoAsync)
        .mockResolvedValueOnce({ exists: true, isDirectory: false, size: 1024 })
        .mockResolvedValueOnce({ exists: true, isDirectory: false, size: 2048 })
        .mockResolvedValueOnce({ exists: true, isDirectory: true, size: 0 });

      const result = await runPromiseExit(readDirectory(mockPath));
      
      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        const entries = result.value as DirectoryEntry[];
        expect(entries).toHaveLength(3);
        expect(entries[0]).toEqual({
          name: 'file1.rom',
          path: '/storage/roms/file1.rom',
          isDirectory: false,
        });
        expect(entries[1]).toEqual({
          name: 'file2.rom',
          path: '/storage/roms/file2.rom',
          isDirectory: false,
        });
        expect(entries[2]).toEqual({
          name: 'subdir',
          path: '/storage/roms/subdir',
          isDirectory: true,
        });
      }
    });

    it('should handle empty directories', async () => {
      const mockPath = '/storage/empty';
      
      vi.mocked(FileSystem.readDirectoryAsync).mockResolvedValueOnce([]);

      const result = await runPromiseExit(readDirectory(mockPath));
      
      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.value).toEqual([]);
      }
    });

    it('should fail with FileNotFoundError for non-existent path', async () => {
      const mockPath = '/storage/nonexistent';
      
      vi.mocked(FileSystem.readDirectoryAsync).mockRejectedValueOnce(
        new Error('Directory does not exist')
      );

      const result = await runPromiseExit(readDirectory(mockPath));
      
      expect(isFailure(result)).toBe(true);
      if (isFailure(result)) {
        const error = failureOption(result.cause);
        expect(error._tag).toBe('Some');
        if (error._tag === 'Some') {
          expect(error.value).toBeInstanceOf(FileNotFoundError);
          expect((error.value as any).path).toBe(mockPath);
        }
      }
    });

    it('should fail with NotADirectoryError for file path', async () => {
      const mockPath = '/storage/file.rom';
      
      vi.mocked(FileSystem.readDirectoryAsync).mockRejectedValueOnce(
        new Error('Path is not a directory')
      );

      const result = await runPromiseExit(readDirectory(mockPath));
      
      expect(isFailure(result)).toBe(true);
      if (isFailure(result)) {
        const error = failureOption(result.cause);
        expect(error._tag).toBe('Some');
        if (error._tag === 'Some') {
          expect(error.value).toBeInstanceOf(NotADirectoryError);
          expect((error.value as any).path).toBe(mockPath);
        }
      }
    });
  });

  describe('getFileInfo', () => {
    it('should return FileInfo for valid file', async () => {
      const mockPath = '/storage/roms/game.rom';
      const mockInfo = {
        exists: true,
        isDirectory: false,
        size: 4096,
        modificationTime: 1640995200000,
      };
      
      vi.mocked(FileSystem.getInfoAsync).mockResolvedValueOnce(mockInfo);

      const result = await runPromiseExit(getFileInfo(mockPath));
      
      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.value).toEqual({
          path: mockPath,
          size: 4096,
          modificationTime: 1640995200000,
          isDirectory: false,
        });
      }
    });

    it('should return FileInfo for valid directory', async () => {
      const mockPath = '/storage/roms';
      const mockInfo = {
        exists: true,
        isDirectory: true,
        size: 0,
        modificationTime: 1640995200000,
      };
      
      vi.mocked(FileSystem.getInfoAsync).mockResolvedValueOnce(mockInfo);

      const result = await runPromiseExit(getFileInfo(mockPath));
      
      expect(isSuccess(result)).toBe(true);
      if (isSuccess(result)) {
        expect(result.value).toEqual({
          path: mockPath,
          size: 0,
          modificationTime: 1640995200000,
          isDirectory: true,
        });
      }
    });

    it('should fail with FileNotFoundError for non-existent path', async () => {
      const mockPath = '/storage/nonexistent.rom';
      
      vi.mocked(FileSystem.getInfoAsync).mockResolvedValueOnce({
        exists: false,
      });

      const result = await runPromiseExit(getFileInfo(mockPath));
      
      expect(isFailure(result)).toBe(true);
      if (isFailure(result)) {
        const error = failureOption(result.cause);
        expect(error._tag).toBe('Some');
        if (error._tag === 'Some') {
          expect(error.value).toBeInstanceOf(FileNotFoundError);
          expect((error.value as any).path).toBe(mockPath);
        }
      }
    });
  });

  describe('calculateChecksum', () => {
    it('should return consistent checksum for same file', async () => {
      const mockPath = '/storage/roms/game.rom';
      const mockContent = 'test content';
      
      vi.mocked(FileSystem.getInfoAsync).mockResolvedValue({
        exists: true,
        isDirectory: false,
      });
      vi.mocked(FileSystem.readAsStringAsync).mockResolvedValue(mockContent);

      const result1 = await runPromiseExit(calculateChecksum(mockPath));
      const result2 = await runPromiseExit(calculateChecksum(mockPath));
      
      expect(isSuccess(result1)).toBe(true);
      expect(isSuccess(result2)).toBe(true);
      if (isSuccess(result1) && isSuccess(result2)) {
        expect(result1.value).toBe(result2.value);
        expect(typeof result1.value).toBe('string');
      }
    });

    it('should return different checksums for different files', async () => {
      const mockPath1 = '/storage/roms/game1.rom';
      const mockPath2 = '/storage/roms/game2.rom';
      
      vi.mocked(FileSystem.getInfoAsync).mockResolvedValue({
        exists: true,
        isDirectory: false,
      });
      vi.mocked(FileSystem.readAsStringAsync)
        .mockResolvedValueOnce('content1')
        .mockResolvedValueOnce('content2');

      const result1 = await runPromiseExit(calculateChecksum(mockPath1));
      const result2 = await runPromiseExit(calculateChecksum(mockPath2));
      
      expect(isSuccess(result1)).toBe(true);
      expect(isSuccess(result2)).toBe(true);
      if (isSuccess(result1) && isSuccess(result2)) {
        expect(result1.value).not.toBe(result2.value);
      }
    });

    it('should fail with FileNotFoundError for non-existent file', async () => {
      const mockPath = '/storage/nonexistent.rom';
      
      vi.mocked(FileSystem.getInfoAsync).mockResolvedValueOnce({
        exists: false,
      });

      const result = await runPromiseExit(calculateChecksum(mockPath));
      
      expect(isFailure(result)).toBe(true);
      if (isFailure(result)) {
        const error = failureOption(result.cause);
        expect(error._tag).toBe('Some');
        if (error._tag === 'Some') {
          expect(error.value).toBeInstanceOf(FileNotFoundError);
          expect((error.value as any).path).toBe(mockPath);
        }
      }
    });

    it('should fail with NotAFileError for directory path', async () => {
      const mockPath = '/storage/roms';
      
      vi.mocked(FileSystem.getInfoAsync).mockResolvedValueOnce({
        exists: true,
        isDirectory: true,
      });

      const result = await runPromiseExit(calculateChecksum(mockPath));
      
      expect(isFailure(result)).toBe(true);
      if (isFailure(result)) {
        const error = failureOption(result.cause);
        expect(error._tag).toBe('Some');
        if (error._tag === 'Some') {
          expect(error.value).toBeInstanceOf(NotAFileError);
          expect((error.value as any).path).toBe(mockPath);
        }
      }
    });
  });
});