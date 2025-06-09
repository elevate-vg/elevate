import { router, publicProcedure } from './trpc';
import { gamesRouter } from './routers/games';
import { filesRouter } from './routers/files';
import { Platform } from 'react-native';
import { z } from 'zod';

export const appRouter = router({
  games: gamesRouter,
  files: filesRouter,

  platform: router({
    getInfo: publicProcedure.query(() => ({
      os: Platform.OS,
      version: Platform.Version,
      isAndroid: Platform.OS === 'android',
      isIOS: Platform.OS === 'ios',
      timestamp: new Date().toISOString()
    })),

    checkFeature: publicProcedure
      .input(z.object({
        feature: z.enum(['retroarch', 'filesystem', 'intents'])
      }))
      .query(({ input }) => {
        const features = {
          retroarch: Platform.OS === 'android',
          filesystem: true,
          intents: Platform.OS === 'android'
        };

        return {
          available: features[input.feature],
          feature: input.feature,
          platform: Platform.OS
        };
      })
  })
});

export type AppRouter = typeof appRouter;