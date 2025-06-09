import { createPostMessageHandler } from '@elasticbottle/trpc-post-message/adapter';
import { WebView } from 'react-native-webview';
import superjson from 'superjson';

interface TrpcServerOptions {
  webViewRef: React.RefObject<WebView>;
  router: AppRouter;
  onServerReady?: () => void;
  onError?: (error: Error) => void;
}

export interface TrpcServer {
  messageHandler: (event: any) => void;
  isReady: boolean;
}

export function setupTrpcServer({ 
  webViewRef, 
  router, 
  onServerReady, 
  onError 
}: TrpcServerOptions): TrpcServer {
  let messageHandlerRef: any = null;
  let isReady = false;

  try {
    createPostMessageHandler({
      router,
      transformer: superjson,
      postMessage: ({ message }) => {
        if (webViewRef.current) {
          const cleanMessage = JSON.parse(JSON.stringify(message));
          webViewRef.current.postMessage(JSON.stringify(cleanMessage));
        }
      },
      addEventListener: (listener) => {
        messageHandlerRef = listener;
        isReady = true;
        onServerReady?.();
        return listener;
      },
      createContext: ({ req }) => ({
        event: req,
        timestamp: new Date().toISOString()
      }),
      onError: ({ error, path }) => {
        console.error(`tRPC error on ${path}:`, error);
        onError?.(error);
      }
    });

    const messageHandler = (event: any) => {
      if (!messageHandlerRef) return;

      try {
        const data = JSON.parse(event.nativeEvent.data);
        
        // Skip console messages
        if (data.type === 'console') return;

        // Route tRPC requests
        const messageEvent = {
          data: data,
          origin: 'webview',
          source: null,
          ports: []
        } as MessageEvent;

        messageHandlerRef(messageEvent);
      } catch (error) {
        console.error('Error processing message:', error);
      }
    };

    return { messageHandler, isReady };
  } catch (error) {
    console.error('Error setting up tRPC server:', error);
    onError?.(error as Error);
    throw error;
  }
}