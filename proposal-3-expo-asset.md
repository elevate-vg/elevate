# Proposal 3: Expo Asset with Dynamic Import

## Overview
Use Expo's Asset API to load the HTML file as an asset, then display it using WebView with the local file URI.

## Implementation

### 1. Install Dependencies
```bash
expo install react-native-webview expo-asset expo-file-system
```

### 2. Create HTML File
Create `assets/web/index.html`:
```html
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 20px;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            padding: 30px;
            border-radius: 20px;
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
        }
    </style>
</head>
<body>
    <div class="card">
        <h1>Welcome to Elevate</h1>
        <p>This content is loaded using Expo Asset API.</p>
        <button onclick="alert('Hello from WebView!')">Test Interaction</button>
    </div>
</body>
</html>
```

### 3. Update App.tsx
```tsx
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
        
        setHtmlUri(fileUri);
      } catch (error) {
        console.error('Error loading HTML:', error);
      }
    }
    
    loadHtml();
  }, []);

  return (
    <View style={styles.container}>
      <Text>Open up App.tsx to start working on your app!</Text>
      {htmlUri && (
        <WebView
          style={styles.webview}
          source={{ uri: htmlUri }}
          originWhitelist={['*']}
        />
      )}
      <StatusBar style="auto" />
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
```

## Pros
- Leverages Expo's built-in asset management
- HTML files are cached automatically
- Can include multiple related assets (CSS, JS, images)
- Works well with Expo's update mechanism
- Supports hot reloading during development

## Cons
- More complex setup with async loading
- Requires expo-asset and expo-file-system dependencies
- Additional file system operations needed
- Slight delay on first load while assets are downloaded
- Still requires WebView for rendering