import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Animated } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { useKeepAwake } from 'expo-keep-awake';
import Constants from 'expo-constants';
import { WebView } from 'react-native-webview';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import { useState, useEffect, useRef } from 'react';

export default function App() {
  const [htmlUri, setHtmlUri] = useState<string | null>(null);
  const [messageCounter, setMessageCounter] = useState(0);
  const [webViewLoaded, setWebViewLoaded] = useState(false);
  const webViewRef = useRef<WebView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Only use keep awake when running in Expo Go
  if (Constants.executionEnvironment === 'storeClient') {
    useKeepAwake();
  }

  useEffect(() => {
    // Hide navigation bar on Android
    NavigationBar.setVisibilityAsync('hidden');
  }, []);

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

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('Received from WebView:', data);
      
      // Check if this message requires acknowledgment
      if (data.type === 'REQUIRES_ACK' && data.id) {
        // Show the alert first
        alert(`React Native received: ${data.data}`);
        
        // Send acknowledgment back to WebView
        const ackMessage = JSON.stringify({
          type: 'ACK',
          originalId: data.id,
          status: 'received',
          timestamp: new Date().toISOString()
        });
        
        // Send ACK after a short delay to simulate processing
        setTimeout(() => {
          webViewRef.current?.postMessage(ackMessage);
          console.log('Sent ACK for message:', data.id);
        }, 500);
      } else {
        // Regular message without ACK requirement
        alert(`React Native received: ${data.data}`);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  };

  const sendMessageToWebView = () => {
    const message = `Hello from React Native! Message #${messageCounter + 1}`;
    webViewRef.current?.postMessage(message);
    setMessageCounter(messageCounter + 1);
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />
      <View style={styles.header}>
        <Text style={styles.headerText}>React Native App</Text>
        <TouchableOpacity style={styles.button} onPress={sendMessageToWebView}>
          <Text style={styles.buttonText}>Send to WebView</Text>
        </TouchableOpacity>
      </View>
      {htmlUri && (
        <View style={styles.webviewContainer}>
          <Animated.View style={[styles.webview, { opacity: fadeAnim }]}>
            <WebView
              ref={webViewRef}
              style={styles.webview}
              source={{ uri: htmlUri }}
              originWhitelist={['file://*', '*']}
              allowFileAccess={true}
              allowFileAccessFromFileURLs={true}
              allowUniversalAccessFromFileURLs={true}
              onMessage={handleMessage}
              onLoadEnd={() => {
                setWebViewLoaded(true);
                Animated.timing(fadeAnim, {
                  toValue: 1,
                  duration: 300,
                  useNativeDriver: true,
                }).start();
              }}
              startInLoadingState={false}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              injectedJavaScriptBeforeContentLoaded={`
                document.documentElement.style.backgroundColor = '#667eea';
                document.body.style.backgroundColor = 'transparent';
                true;
              `}
            />
          </Animated.View>
          {!webViewLoaded && (
            <View style={styles.loadingOverlay}>
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    backgroundColor: '#667eea',
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  headerText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  button: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  buttonText: {
    color: '#667eea',
    fontWeight: 'bold',
  },
  webviewContainer: {
    flex: 1,
    backgroundColor: '#667eea',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
