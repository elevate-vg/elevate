export type Platform = 
  | 'nes'
  | 'snes' 
  | 'genesis'
  | 'gb'
  | 'gbc'
  | 'gba'
  | 'n64'
  | 'ps1'
  | 'psp'
  | 'nds'
  | 'unknown';

export interface RomFile {
  filename: string;
  path: string;
  extension: string;
  fileSize: number;
  lastModified: Date;
}

export interface LocalRomMetadata {
  filename: string;
  path: string;
  platform: Platform;
  title: string;
  fileSize: number;
  lastModified: Date;
  checksum: string;
}

export interface GameEntry {
  id: string;
  platform: Platform;
  lastModified: string; // ISO date string for YAML
  files: Array<{
    path: string;
    size: number;
    checksum: string;
  }>;
  release: {
    title: string;
    language?: string;
    genre?: string;
    developer?: string;
    releaseYear?: number;
  };
}