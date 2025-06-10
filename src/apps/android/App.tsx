import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useState, useEffect, useRef } from 'react';
import { minimalRouter as router } from '../../shared/server/appRouter';
import { setupTrpcServer } from './services/trpc-server';
import { createMessageHandler } from './services/message-bridge';
import { loadWebViewAsset, getWebViewConfig } from './services/webview-manager';

export default function App() {
  const webViewRef = useRef<WebView>(null);
  const [htmlUri, setHtmlUri] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [trpcHandler, setTrpcHandler] = useState<any>(null);

  useEffect(() => {
    loadWebViewAsset().then(setHtmlUri);
  }, []);

  useEffect(() => {
    if (!htmlUri) return;

    const server = setupTrpcServer({
      webViewRef,
      router,
      onServerReady: () => setIsReady(true),
      onError: (error) => console.error('tRPC server error:', error)
    });

    setTrpcHandler(() => server.messageHandler);
  }, [htmlUri]);

  const messageHandler = trpcHandler ? createMessageHandler(trpcHandler) : undefined;

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />
      {htmlUri && isReady && trpcHandler && (
        <WebView
          ref={webViewRef}
          source={{ uri: htmlUri }}
          {...getWebViewConfig()}
          onMessage={messageHandler}
          onLoadEnd={() => console.log('WebView loaded')}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
});
