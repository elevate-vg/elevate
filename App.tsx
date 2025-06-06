import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';
import Constants from 'expo-constants';
import { WebView } from 'react-native-webview';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import { useState, useEffect } from 'react';

export default function App() {
  const [htmlUri, setHtmlUri] = useState<string | null>(null);

  // Only use keep awake when running in Expo Go
  if (Constants.executionEnvironment === 'storeClient') {
    useKeepAwake();
  }

  useEffect(() => {
    async function loadHtml() {
      try {
        const asset = Asset.fromModule(require('./assets/web/index.html'));
        await asset.downloadAsync();

        // Copy to a location WebView can access
        const fileUri = `${FileSystem.documentDirectory}index.html`;
        await FileSystem.copyAsync({
          from: asset.localUri!,
          to: fileUri
        });

        // Ensure we use file:// protocol
        setHtmlUri(fileUri.startsWith('file://') ? fileUri : `file://${fileUri}`);
      } catch (error) {
        console.error('Error loading HTML:', error);
      }
    }

    loadHtml();
  }, []);

  return (
    <View style={styles.container}>
      {htmlUri && (
        <WebView
          style={styles.webview}
          source={{ uri: htmlUri }}
          originWhitelist={['file://*', '*']}
          allowFileAccess={true}
          allowFileAccessFromFileURLs={true}
          allowUniversalAccessFromFileURLs={true}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
    marginTop: 20,
  },
});
