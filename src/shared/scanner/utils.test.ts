import { describe, it, expect } from 'vitest';
import {
  path,
  cleanTitle,
  inferPlatformFromExtension,
  getSupportedExtensions,
  isSupportedExtension,
  formatFileSize,
  generateGameId
} from './utils';

describe('path utilities', () => {
  describe('path.join', () => {
    it('should join path segments with forward slashes', () => {
      expect(path.join('a', 'b', 'c')).toBe('a/b/c');
      expect(path.join('folder', 'subfolder', 'file.txt')).toBe('folder/subfolder/file.txt');
    });

    it('should handle absolute paths', () => {
      expect(path.join('/root', 'folder', 'file')).toBe('/root/folder/file');
      expect(path.join('/storage', 'roms', 'gba')).toBe('/storage/roms/gba');
    });

    it('should remove redundant slashes', () => {
      expect(path.join('a/', '/b/', '//c')).toBe('a/b/c');
      expect(path.join('folder//', '//subfolder')).toBe('folder/subfolder');
    });

    it('should handle empty segments', () => {
      expect(path.join('', 'test', '')).toBe('test');
      expect(path.join('a', '', 'b')).toBe('a/b');
    });

    it('should handle leading ./', () => {
      expect(path.join('./test', 'file')).toBe('test/file');
      expect(path.join('./folder/', 'file.rom')).toBe('folder/file.rom');
    });

    it('should remove trailing slashes', () => {
      expect(path.join('a', 'b/')).toBe('a/b');
      expect(path.join('folder/', 'subfolder/')).toBe('folder/subfolder');
    });

    it('should handle single segment', () => {
      expect(path.join('single')).toBe('single');
      expect(path.join('/absolute')).toBe('/absolute');
    });

    it('should return . for empty input', () => {
      expect(path.join()).toBe('.');
      expect(path.join('')).toBe('.');
    });

    it('should preserve leading slash from first segment', () => {
      expect(path.join('/root')).toBe('/root');
      expect(path.join('/', 'folder')).toBe('/folder');
    });
  });

  describe('path.basename', () => {
    it('should extract filename from path', () => {
      expect(path.basename('/path/to/file.txt')).toBe('file.txt');
      expect(path.basename('folder/file.rom')).toBe('file.rom');
      expect(path.basename('file.nes')).toBe('file.nes');
    });

    it('should handle paths with no directory', () => {
      expect(path.basename('file.txt')).toBe('file.txt');
      expect(path.basename('game.rom')).toBe('game.rom');
    });

    it('should remove extension when provided', () => {
      expect(path.basename('/path/to/file.nes', '.nes')).toBe('file');
      expect(path.basename('game.gba', '.gba')).toBe('game');
    });

    it('should handle empty paths', () => {
      expect(path.basename('')).toBe('');
      expect(path.basename('/')).toBe('');
    });

    it('should handle paths ending with slash', () => {
      expect(path.basename('/path/to/folder/')).toBe('folder');
      expect(path.basename('folder/')).toBe('folder');
    });

    it('should only remove matching extension', () => {
      expect(path.basename('file.txt', '.doc')).toBe('file.txt');
      expect(path.basename('game.nes', '.gba')).toBe('game.nes');
    });
  });

  describe('path.dirname', () => {
    it('should extract directory from path', () => {
      expect(path.dirname('/path/to/file.txt')).toBe('/path/to');
      expect(path.dirname('folder/subfolder/file.rom')).toBe('folder/subfolder');
    });

    it('should handle root paths', () => {
      expect(path.dirname('/')).toBe('/');
      expect(path.dirname('/file.txt')).toBe('/');
    });

    it('should handle relative paths', () => {
      expect(path.dirname('file.txt')).toBe('.');
      expect(path.dirname('folder/file.txt')).toBe('folder');
    });

    it('should handle paths with trailing slashes', () => {
      expect(path.dirname('/path/to/folder/')).toBe('/path/to');
      expect(path.dirname('folder/subfolder/')).toBe('folder');
    });

    it('should handle multiple slashes', () => {
      expect(path.dirname('/path//to///file')).toBe('/path//to//');
      expect(path.dirname('folder//file')).toBe('folder/');
    });

    it('should return . for single segment relative paths', () => {
      expect(path.dirname('file')).toBe('.');
      expect(path.dirname('folder')).toBe('.');
    });
  });

  describe('path.extname', () => {
    it('should extract file extension', () => {
      expect(path.extname('file.txt')).toBe('.txt');
      expect(path.extname('game.nes')).toBe('.nes');
      expect(path.extname('/path/to/file.gba')).toBe('.gba');
    });

    it('should handle multiple dots', () => {
      expect(path.extname('file.v1.0.txt')).toBe('.txt');
      expect(path.extname('game.v1.0.gba')).toBe('.gba');
    });

    it('should handle no extension', () => {
      expect(path.extname('file')).toBe('');
      expect(path.extname('noextension')).toBe('');
    });

    it('should handle hidden files', () => {
      expect(path.extname('.hidden')).toBe('');
      expect(path.extname('.hidden.txt')).toBe('.txt');
    });

    it('should handle edge cases', () => {
      expect(path.extname('')).toBe('');
      expect(path.extname('.')).toBe('');
      expect(path.extname('..')).toBe('.');
    });
  });
});

describe('cleanTitle', () => {
  it('should remove file extensions', () => {
    expect(cleanTitle('Super Mario Bros.nes')).toBe('Super Mario Bros');
    expect(cleanTitle('game.gba')).toBe('Game');
  });

  it('should remove bracketed tags', () => {
    expect(cleanTitle('Super Mario Bros [USA].nes')).toBe('Super Mario Bros');
    expect(cleanTitle('Game [Region] [!].rom')).toBe('Game');
  });

  it('should remove parenthetical tags', () => {
    expect(cleanTitle('Super Mario Bros (USA).nes')).toBe('Super Mario Bros');
    expect(cleanTitle('Game (Rev A) (Hack).rom')).toBe('Game');
  });

  it('should remove curly brace tags', () => {
    expect(cleanTitle('Game {Proto}.rom')).toBe('Game');
    expect(cleanTitle('Title {Debug} {Beta}.nes')).toBe('Title');
  });

  it('should remove version numbers', () => {
    expect(cleanTitle('Game v1.0.rom')).toBe('Game');
    expect(cleanTitle('Title V2.5.nes')).toBe('Title');
  });

  it('should remove revision numbers', () => {
    expect(cleanTitle('Game Rev 1.rom')).toBe('Game');
    expect(cleanTitle('Title Rev2.nes')).toBe('Title');
  });

  it('should handle underscores and dashes', () => {
    expect(cleanTitle('Super_Mario_Bros.nes')).toBe('Super Mario Bros');
    expect(cleanTitle('Game-Title---Test.rom')).toBe('Game Title Test');
  });

  it('should capitalize words properly', () => {
    expect(cleanTitle('super mario bros.nes')).toBe('Super Mario Bros');
    expect(cleanTitle('THE LEGEND OF ZELDA.rom')).toBe('The Legend Of Zelda');
  });

  it('should handle complex filenames', () => {
    expect(cleanTitle('Pokemon - Ruby Version (U) [!].gba')).toBe('Pokemon Ruby Version');
    expect(cleanTitle('Sonic_The_Hedgehog_2_(World)_(Rev_A).md')).toBe('Sonic The Hedgehog 2');
    expect(cleanTitle('Street Fighter II Turbo [T+Eng v1.0].sfc')).toBe('Street Fighter Ii Turbo');
  });

  it('should handle empty results gracefully', () => {
    expect(cleanTitle('[USA].nes')).toBe('[USA].nes');
    expect(cleanTitle('()()()')).toBe('()()()');
  });

  it('should trim whitespace', () => {
    expect(cleanTitle('  Game Title  .rom')).toBe('Game Title');
    expect(cleanTitle('Title   With   Spaces.nes')).toBe('Title With Spaces');
  });
});

describe('inferPlatformFromExtension', () => {
  it('should identify Nintendo platforms', () => {
    expect(inferPlatformFromExtension('.nes')).toBe('nintendo-entertainment-system');
    expect(inferPlatformFromExtension('.smc')).toBe('super-nintendo-entertainment-system');
    expect(inferPlatformFromExtension('.sfc')).toBe('super-nintendo-entertainment-system');
    expect(inferPlatformFromExtension('.gb')).toBe('game-boy');
    expect(inferPlatformFromExtension('.gbc')).toBe('game-boy-color');
    expect(inferPlatformFromExtension('.gba')).toBe('game-boy-advance');
    expect(inferPlatformFromExtension('.n64')).toBe('nintendo-64');
    expect(inferPlatformFromExtension('.z64')).toBe('nintendo-64');
    expect(inferPlatformFromExtension('.nds')).toBe('nintendo-ds');
    expect(inferPlatformFromExtension('.3ds')).toBe('nintendo-3ds');
  });

  it('should identify Sega platforms', () => {
    expect(inferPlatformFromExtension('.sms')).toBe('sega-master-system');
    expect(inferPlatformFromExtension('.gg')).toBe('sega-master-system');
    expect(inferPlatformFromExtension('.md')).toBe('sega-genesis');
    expect(inferPlatformFromExtension('.gen')).toBe('sega-genesis');
    expect(inferPlatformFromExtension('.32x')).toBe('sega-32x');
    expect(inferPlatformFromExtension('.gdi')).toBe('sega-dreamcast');
  });

  it('should identify Sony platforms', () => {
    expect(inferPlatformFromExtension('.pbp')).toBe('sony-playstation-portable');
    expect(inferPlatformFromExtension('.cso')).toBe('sony-playstation-portable');
  });

  it('should identify Atari platforms', () => {
    expect(inferPlatformFromExtension('.a26')).toBe('atari-2600');
    expect(inferPlatformFromExtension('.a52')).toBe('atari-5200');
    expect(inferPlatformFromExtension('.a78')).toBe('atari-7800');
  });

  it('should handle ambiguous extensions', () => {
    expect(inferPlatformFromExtension('.iso')).toBeNull();
    expect(inferPlatformFromExtension('.bin')).toBe('sony-playstation');
    expect(inferPlatformFromExtension('.cue')).toBe('sony-playstation');
    expect(inferPlatformFromExtension('.zip')).toBe('arcade');
  });

  it('should be case insensitive', () => {
    expect(inferPlatformFromExtension('.NES')).toBe('nintendo-entertainment-system');
    expect(inferPlatformFromExtension('.GBA')).toBe('game-boy-advance');
    expect(inferPlatformFromExtension('.Md')).toBe('sega-genesis');
  });

  it('should return null for unknown extensions', () => {
    expect(inferPlatformFromExtension('.txt')).toBeNull();
    expect(inferPlatformFromExtension('.exe')).toBeNull();
    expect(inferPlatformFromExtension('.doc')).toBeNull();
  });
});

describe('getSupportedExtensions', () => {
  it('should return array of supported extensions', () => {
    const extensions = getSupportedExtensions();
    expect(Array.isArray(extensions)).toBe(true);
    expect(extensions.length).toBeGreaterThan(0);
    expect(extensions).toContain('.nes');
    expect(extensions).toContain('.gba');
    expect(extensions).toContain('.md');
  });

  it('should include all major platform extensions', () => {
    const extensions = getSupportedExtensions();
    
    // Nintendo
    expect(extensions).toContain('.nes');
    expect(extensions).toContain('.smc');
    expect(extensions).toContain('.gb');
    expect(extensions).toContain('.gba');
    expect(extensions).toContain('.nds');
    
    // Sega
    expect(extensions).toContain('.sms');
    expect(extensions).toContain('.md');
    expect(extensions).toContain('.gdi');
    
    // Sony
    expect(extensions).toContain('.pbp');
    
    // Atari
    expect(extensions).toContain('.a26');
  });
});

describe('isSupportedExtension', () => {
  it('should return true for supported extensions', () => {
    expect(isSupportedExtension('.nes')).toBe(true);
    expect(isSupportedExtension('.gba')).toBe(true);
    expect(isSupportedExtension('.md')).toBe(true);
    expect(isSupportedExtension('.iso')).toBe(true);
  });

  it('should return false for unsupported extensions', () => {
    expect(isSupportedExtension('.txt')).toBe(false);
    expect(isSupportedExtension('.exe')).toBe(false);
    expect(isSupportedExtension('.doc')).toBe(false);
    expect(isSupportedExtension('.mp3')).toBe(false);
  });

  it('should be case insensitive', () => {
    expect(isSupportedExtension('.NES')).toBe(true);
    expect(isSupportedExtension('.GBA')).toBe(true);
    expect(isSupportedExtension('.MD')).toBe(true);
    expect(isSupportedExtension('.TXT')).toBe(false);
  });

  it('should handle edge cases', () => {
    expect(isSupportedExtension('')).toBe(false);
    expect(isSupportedExtension('.')).toBe(false);
    expect(isSupportedExtension('nes')).toBe(false); // missing dot
  });
});

describe('formatFileSize', () => {
  it('should format bytes correctly', () => {
    expect(formatFileSize(0)).toBe('0.0 B');
    expect(formatFileSize(512)).toBe('512.0 B');
    expect(formatFileSize(1023)).toBe('1023.0 B');
  });

  it('should format kilobytes correctly', () => {
    expect(formatFileSize(1024)).toBe('1.0 KB');
    expect(formatFileSize(1536)).toBe('1.5 KB');
    expect(formatFileSize(2048)).toBe('2.0 KB');
    expect(formatFileSize(1024 * 1023)).toBe('1023.0 KB');
  });

  it('should format megabytes correctly', () => {
    expect(formatFileSize(1024 * 1024)).toBe('1.0 MB');
    expect(formatFileSize(1024 * 1024 * 1.5)).toBe('1.5 MB');
    expect(formatFileSize(1024 * 1024 * 16)).toBe('16.0 MB');
    expect(formatFileSize(1024 * 1024 * 1023)).toBe('1023.0 MB');
  });

  it('should format gigabytes correctly', () => {
    expect(formatFileSize(1024 * 1024 * 1024)).toBe('1.0 GB');
    expect(formatFileSize(1024 * 1024 * 1024 * 2.5)).toBe('2.5 GB');
    expect(formatFileSize(1024 * 1024 * 1024 * 100)).toBe('100.0 GB');
  });

  it('should handle large numbers', () => {
    expect(formatFileSize(1024 * 1024 * 1024 * 1024)).toBe('1024.0 GB');
    expect(formatFileSize(Number.MAX_SAFE_INTEGER)).toMatch(/GB$/);
  });

  it('should show one decimal place', () => {
    expect(formatFileSize(1536)).toBe('1.5 KB');
    expect(formatFileSize(1024 * 1.7)).toBe('1.7 KB');
    expect(formatFileSize(1024 * 1024 * 3.3)).toBe('3.3 MB');
  });
});

describe('generateGameId', () => {
  it('should generate consistent IDs for same input', () => {
    const id1 = generateGameId('/path/to/game.rom', 12345);
    const id2 = generateGameId('/path/to/game.rom', 12345);
    expect(id1).toBe(id2);
  });

  it('should generate different IDs for different paths', () => {
    const id1 = generateGameId('/path/to/game1.rom', 12345);
    const id2 = generateGameId('/path/to/game2.rom', 12345);
    expect(id1).not.toBe(id2);
  });

  it('should generate different IDs for different sizes', () => {
    const id1 = generateGameId('/path/to/game.rom', 12345);
    const id2 = generateGameId('/path/to/game.rom', 54321);
    expect(id1).not.toBe(id2);
  });

  it('should sanitize special characters from path', () => {
    const id = generateGameId('/path/to/game.rom', 12345);
    expect(id).toBe('pathtogamerom-12345');
  });

  it('should handle various path formats', () => {
    expect(generateGameId('/storage/roms/gba/game.gba', 16777216))
      .toBe('storageromsgbagamegba-16777216');
    
    expect(generateGameId('C:\\Games\\ROM Files\\game.nes', 524288))
      .toBe('CGamesROMFilesgamenes-524288');
    
    expect(generateGameId('game-title_v1.0[USA].rom', 1048576))
      .toBe('gametitlev10USArom-1048576');
  });

  it('should handle edge cases', () => {
    expect(generateGameId('', 0)).toBe('-0');
    expect(generateGameId('////', 100)).toBe('-100');
    expect(generateGameId('!@#$%^&*()', 999)).toBe('-999');
  });
});