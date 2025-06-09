import { router, publicProcedure } from './trpc';
import { z } from 'zod';

export const minimalRouter = router({
  hello: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.name} from React Native!`,
        timestamp: new Date(), // Return actual Date object for superjson testing
        timestampISO: new Date().toISOString()
      };
    }),
  
  echo: publicProcedure
    .input(z.object({ message: z.string() }))
    .mutation(({ input }) => {
      console.log('Received echo:', input.message);
      return {
        echo: input.message,
        reversed: input.message.split('').reverse().join(''),
        length: input.message.length,
        receivedAt: new Date(), // Return actual Date object for superjson testing
        metadata: new Map([['source', 'webview'], ['processed', true]]) // Test Map serialization
      };
    })
});

export type MinimalRouter = typeof minimalRouter;