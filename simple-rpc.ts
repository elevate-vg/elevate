// Simple RPC implementation that mimics tRPC's style but works with React Native

type Procedure = {
  type: 'query' | 'mutation';
  handler: (input?: any) => any | Promise<any>;
};

type Router = {
  [key: string]: Procedure;
};

// Create a simple RPC system
export function createRPC() {
  const procedures: Router = {};

  return {
    procedure: () => ({
      query: (handler: (input?: any) => any | Promise<any>) => ({
        type: 'query' as const,
        handler,
      }),
      mutation: (handler: (input?: any) => any | Promise<any>) => ({
        type: 'mutation' as const,
        handler,
      }),
    }),
    
    router: (routes: Router) => {
      Object.assign(procedures, routes);
      return {
        call: async (procedureName: string, input?: any) => {
          const procedure = procedures[procedureName];
          if (!procedure) {
            throw new Error(`Procedure "${procedureName}" not found`);
          }
          return await procedure.handler(input);
        },
        procedures,
      };
    },
  };
}

// Initialize RPC
const rpc = createRPC();

// Define procedures
const helloQuery = rpc.procedure().query(() => {
  return {
    greeting: 'Hello from custom RPC in React Native!',
    timestamp: new Date().toISOString(),
  };
});

// Create app router
export const appRouter = rpc.router({
  hello: helloQuery,
});

// Helper function to call procedures
export async function callRPC(procedureName: string, input?: any) {
  return await appRouter.call(procedureName, input);
}..
