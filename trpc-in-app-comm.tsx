import { useState } from 'react';
import { createTRPCProxyClient } from '@trpc/client';
import { postMessageLink } from '@elasticbottle/trpc-post-message/link';
import { createPostMessageHandler } from '@elasticbottle/trpc-post-message/adapter';
import { initTRPC } from '@trpc/server';
import { z } from 'zod';

// tRPC setup for window messaging
const t = initTRPC.create({ isServer: false, allowOutsideOfServer: true });
const router = t.router({
  hello: t.procedure.input(z.object({ name: z.string() })).query(({ input }) => ({
    message: `Hello ${input.name} via window messaging!`,
    timestamp: new Date().toISOString()
  })),
  greet: t.procedure.input(z.object({ name: z.string(), age: z.number() })).mutation(({ input }) => ({
    message: `Hello ${input.name}, you are ${input.age} years old!`,
    id: Math.random().toString(36)
  }))
});

// Initialize server handler
createPostMessageHandler({
  router,
  postMessage: ({ message }) => window.postMessage({ type: 'response', ...message }, '*'),
  addEventListener: (listener) => {
    const handler = (e: MessageEvent) => e.data?.type === 'request' && listener(e);
    window.addEventListener('message', handler);
    return handler;
  },
});

// Initialize client
const client = createTRPCProxyClient<typeof router>({
  links: [postMessageLink({
    postMessage: ({ message }) => window.postMessage({ type: 'request', ...message }, '*'),
    addEventListener: (listener) => {
      const handler = (e: MessageEvent) => e.data?.type === 'response' && listener(e);
      window.addEventListener('message', handler);
      return handler;
    },
    removeEventListener: (listener) => window.removeEventListener('message', listener),
  })],
});

function App() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testQuery = async () => {
    setLoading(true);
    try {
      const res = await client.hello.query({ name: 'Test User' });
      setResult(res);
    } catch (err) {
      setResult({ error: err instanceof Error ? err.message : 'Query failed' });
    }
    setLoading(false);
  };

  const testMutation = async () => {
    setLoading(true);
    try {
      const res = await client.greet.mutate({ name: 'Test User', age: 25 });
      setResult(res);
    } catch (err) {
      setResult({ error: err instanceof Error ? err.message : 'Mutation failed' });
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>tRPC Window Messaging POC</h1>
      <p>Demonstrates tRPC with window messaging transport instead of HTTP.</p>

      <div style={{ margin: '20px 0' }}>
        <button onClick={testQuery} disabled={loading} style={{ margin: '5px', padding: '8px 16px' }}>
          Test Query
        </button>
        <button onClick={testMutation} disabled={loading} style={{ margin: '5px', padding: '8px 16px' }}>
          Test Mutation
        </button>
      </div>

      {loading && <p>Loading...</p>}

      {result && (
        <div style={{
          background: result.error ? '#ffe6e6' : '#e6ffe6',
          padding: '15px',
          borderRadius: '6px',
          marginTop: '15px'
        }}>
          <h3>{result.error ? '❌ Error' : '✅ Result'}</h3>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginTop: '30px', padding: '15px', background: '#f5f5f5', borderRadius: '6px' }}>
        <h3>How it works:</h3>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          <li>tRPC server runs in-browser using window messaging</li>
          <li>Client communicates via postMessage instead of HTTP</li>
          <li>Full type safety maintained across transport layers</li>
        </ul>
      </div>
    </div>
  );
}

export default App;
