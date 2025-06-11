import { z } from 'zod';

export const PlatformSchema = z.enum([
  'nintendo-entertainment-system',
  'super-nintendo-entertainment-system',
  'game-boy',
  'game-boy-color',
  'game-boy-advance',
  'nintendo-64',
  'gamecube',
  'wii',
  'nintendo-ds',
  'nintendo-3ds',
  'nintendo-switch',
  'sega-master-system',
  'sega-genesis',
  'sega-cd',
  'sega-32x',
  'sega-saturn',
  'sega-dreamcast',
  'sony-playstation',
  'sony-playstation-2',
  'sony-playstation-portable',
  'sony-playstation-vita',
  'atari-2600',
  'atari-5200',
  'atari-7800',
  'arcade',
  'unknown'
]);

export type Platform = z.infer<typeof PlatformSchema>;