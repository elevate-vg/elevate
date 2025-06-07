import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Animated, Platform, Alert } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { useKeepAwake } from 'expo-keep-awake';
import Constants from 'expo-constants';
import { WebView } from 'react-native-webview';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
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

  const initiateDataStream = () => {
    const streamData = [
      "🌡️ Temperature: 24.3°C (Sensor A1)",
      "📊 Memory Usage: 78% (8.2GB/10.5GB)",
      "🔋 Battery Level: 87% (Charging)",
      "📱 Network: 5G Signal Strong (-65dBm)",
      "💾 Storage: 45.2GB available",
      "🏃‍♂️ Steps Today: 8,247 steps",
      "💰 Portfolio: +$342.50 (+2.1%)",
      "🌐 API Latency: 89ms (Good)"
    ];

    streamData.forEach((data, index) => {
      setTimeout(() => {
        const streamMessage = JSON.stringify({
          type: 'STREAM_DATA',
          text: data,
          timestamp: new Date().toISOString(),
          source: 'React Native Stream'
        });
        webViewRef.current?.postMessage(streamMessage);
        console.log(`Sent stream message ${index + 1}:`, data);
      }, index * 1200); // 1.2 second intervals
    });

    // Send completion message
    setTimeout(() => {
      const completionMessage = JSON.stringify({
        type: 'STREAM_COMPLETE',
        text: '✅ Data stream completed',
        timestamp: new Date().toISOString(),
        source: 'React Native Stream'
      });
      webViewRef.current?.postMessage(completionMessage);
    }, streamData.length * 1200);
  };

  const openRetroArch = async () => {
    if (Platform.OS === 'android') {
      try {
        // Open RetroArch with specific configuration
        // Android Intent flags: CLEAR_TASK (0x8000) | CLEAR_TOP (0x4000000) | NO_HISTORY (0x40000000)
        const flags = 0x8000 | 0x4000000 | 0x40000000;

        await IntentLauncher.startActivityAsync('android.intent.action.MAIN', {
          packageName: 'com.retroarch.aarch64',
          className: 'com.retroarch.browser.retroactivity.RetroActivityFuture',
          extra: {
            ROM: '/storage/emulated/0/Download/minish.zip', // Example ROM path
            LIBRETRO: '/data/data/com.retroarch.aarch64/cores/mgba_libretro_android.so',
            CONFIGFILE: '/storage/emulated/0/Android/data/com.retroarch.aarch64/files/retroarch.cfg',
            QUITFOCUS: ''
          },
          flags: flags
        });
      } catch (error) {
        console.error('RetroArch launch error:', error);
        Alert.alert('Error', 'Unable to open RetroArch. Please ensure RetroArch is installed and the ROM path is correct.');
      }
    } else {
      Alert.alert('Info', 'RetroArch launcher is only available on Android');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />
      <View style={styles.header}>
        <Text style={styles.headerText}>React Native App</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={sendMessageToWebView}>
            <Text style={styles.buttonText}>💬 Send Message</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.streamButton]} onPress={initiateDataStream}>
            <Text style={styles.buttonText}>📡 Start Data Stream</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.retroarchButton]} onPress={openRetroArch}>
            <Text style={styles.buttonText}>🎮 Open RetroArch</Text>
          </TouchableOpacity>
        </View>
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
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    minWidth: 140,
    alignItems: 'center',
  },
  streamButton: {
    backgroundColor: '#4ecdc4',
  },
  retroarchButton: {
    backgroundColor: '#ff6b35',
  },
  buttonText: {
    color: '#667eea',
    fontWeight: 'bold',
    fontSize: 13,
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
