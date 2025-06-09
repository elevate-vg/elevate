import { initTRPC } from '@trpc/server';
import superjson from 'superjson';

// Initialize tRPC with client-side configuration
const t = initTRPC.create({ 
  isServer: false, 
  allowOutsideOfServer: true,
  transformer: superjson
});

// Define procedures
const hello = t.procedure
  .input((val: unknown) => {
    if (typeof val === 'string') return val;
    throw new Error('Invalid input');
  })
  .query(({ input }) => {
    return `Hello ${input}!`;
  });

const sendData = t.procedure
  .input((val: unknown) => {
    if (typeof val === 'object' && val !== null && 'message' in val) {
      return val as { message: string };
    }
    throw new Error('Invalid input');
  })
  .mutation(({ input }) => {
    return {
      received: input.message,
      timestamp: new Date().toISOString(),
      processed: true
    };
  });

// Create router
export const appRouter = t.router({
  hello,
  sendData
});

export type AppRouter = typeof appRouter;