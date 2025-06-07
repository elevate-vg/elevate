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
import { AppState } from 'react-native';
import * as YAML from 'js-yaml';

export default function App() {
  const [htmlUri, setHtmlUri] = useState<string | null>(null);
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
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        // App came back to foreground (e.g., after RetroArch exit)
        NavigationBar.setVisibilityAsync('hidden');
        sendStatusToWebView('APP_STATUS', 'Welcome back to launcher!');
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
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

      // Handle RetroArch launch requests
      if (data.type === 'LAUNCH_RETROARCH') {
        launchRetroArchGame(data);
      } else if (data.type === 'OPEN_RETROARCH_MAIN') {
        openRetroArchMain();
      } else if (data.type === 'RETROARCH_ACTION') {
        handleRetroArchAction(data.action);
      } else if (data.type === 'WRITE_FILE') {
        writeTextFile(data.content || 'Hello from WebView!');
      } else if (data.type === 'READ_FILE') {
        readTextFile();
      } else if (data.type === 'REQUIRES_ACK' && data.id) {
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
      sendStatusToWebView('ERROR', `Message parsing error: ${error.message}`);
    }
  };


  const sendStatusToWebView = (type: string, message: string) => {
    const statusMessage = JSON.stringify({
      type: type,
      message: message,
      timestamp: new Date().toISOString()
    });
    webViewRef.current?.postMessage(statusMessage);
  };

  const launchRetroArchGame = async (config: any) => {
    if (Platform.OS !== 'android') {
      sendStatusToWebView('ERROR', 'RetroArch launcher is only available on Android');
      return;
    }

    try {
      sendStatusToWebView('LAUNCH_STATUS', `Preparing to launch ${config.console.toUpperCase()} game...`);
      
      // Core mapping for different consoles
      const coreMap: Record<string, string> = {
        'mgba': 'mgba_libretro_android.so',
        'snes9x': 'snes9x_libretro_android.so',
        'genesis_plus_gx': 'genesis_plus_gx_libretro_android.so',
        'nestopia': 'nestopia_libretro_android.so',
        'pcsx_rearmed': 'pcsx_rearmed_libretro_android.so'
      };

      const coreFile = coreMap[config.core] || 'mgba_libretro_android.so';
      const corePath = `/data/data/com.retroarch.aarch64/cores/${coreFile}`;

      // Android Intent flags: NEW_TASK (0x10000000) | CLEAR_TOP (0x4000000)
      // This should allow proper return to launcher when RetroArch exits
      const flags = 0x10000000 | 0x4000000;

      sendStatusToWebView('LAUNCH_STATUS', `Launching ${config.console.toUpperCase()} with ${config.core} core...`);

      await IntentLauncher.startActivityAsync('android.intent.action.MAIN', {
        packageName: 'com.retroarch.aarch64',
        className: 'com.retroarch.browser.retroactivity.RetroActivityFuture',
        extra: {
          ROM: config.romPath,
          LIBRETRO: corePath,
          CONFIGFILE: config.configPath,
          QUITFOCUS: ''
        },
        flags: flags
      });

      sendStatusToWebView('LAUNCH_STATUS', `Successfully launched ${config.console.toUpperCase()} game!`);
    } catch (error) {
      console.error('RetroArch launch error:', error);
      sendStatusToWebView('ERROR', `Failed to launch RetroArch: ${error.message}`);
    }
  };

  const openRetroArchMain = async () => {
    if (Platform.OS !== 'android') {
      sendStatusToWebView('ERROR', 'RetroArch launcher is only available on Android');
      return;
    }

    try {
      sendStatusToWebView('LAUNCH_STATUS', 'Opening RetroArch main interface...');
      
      await IntentLauncher.startActivityAsync('android.intent.action.MAIN', {
        packageName: 'com.retroarch.aarch64'
      });

      sendStatusToWebView('LAUNCH_STATUS', 'RetroArch main interface opened successfully!');
    } catch (error) {
      console.error('RetroArch main launch error:', error);
      sendStatusToWebView('ERROR', `Failed to open RetroArch: ${error.message}`);
    }
  };

  const handleRetroArchAction = (action: string) => {
    sendStatusToWebView('LAUNCH_STATUS', `Processing action: ${action}`);
    
    switch (action) {
      case 'Open RetroArch Settings':
        sendStatusToWebView('LAUNCH_STATUS', 'Opening RetroArch settings...');
        break;
      case 'Scan ROMs':
        sendStatusToWebView('LAUNCH_STATUS', 'Scanning for ROMs...');
        break;
      case 'Show Saves':
        sendStatusToWebView('LAUNCH_STATUS', 'Loading save states...');
        break;
      case 'Controls':
        sendStatusToWebView('LAUNCH_STATUS', 'Opening controller configuration...');
        break;
      case 'About':
        sendStatusToWebView('LAUNCH_STATUS', 'RetroArch Launcher v1.0 - Gaming made easy!');
        break;
      default:
        sendStatusToWebView('LAUNCH_STATUS', `Unknown action: ${action}`);
    }
  };

  const writeTextFile = async (content: string) => {
    try {
      const filePath = `${FileSystem.documentDirectory}sample.yaml`;
      
      // Create YAML data structure
      const yamlData = {
        message: content,
        timestamp: new Date().toISOString(),
        platform: Platform.OS,
        app: {
          name: 'elevate-expo',
          version: '1.0.0'
        },
        metadata: {
          writeCount: Math.floor(Math.random() * 100) + 1,
          source: 'webview-request'
        }
      };

      const yamlString = YAML.dump(yamlData);
      await FileSystem.writeAsStringAsync(filePath, yamlString);
      sendStatusToWebView('FILE_WRITE_SUCCESS', `YAML file written successfully to: ${filePath}`);
      console.log('YAML file written to:', filePath);
    } catch (error) {
      console.error('YAML write error:', error);
      sendStatusToWebView('ERROR', `Failed to write YAML file: ${error.message}`);
    }
  };

  const readTextFile = async () => {
    try {
      const filePath = `${FileSystem.documentDirectory}sample.yaml`;
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      
      if (!fileInfo.exists) {
        sendStatusToWebView('FILE_READ_ERROR', 'YAML file does not exist. Write a file first.');
        return;
      }

      const yamlContent = await FileSystem.readAsStringAsync(filePath);
      const parsedYaml = YAML.load(yamlContent) as any;
      
      // Only return the platform value
      sendStatusToWebView('FILE_READ_SUCCESS', parsedYaml.platform || 'unknown');
      console.log('YAML content:', parsedYaml);
    } catch (error) {
      console.error('YAML read error:', error);
      sendStatusToWebView('ERROR', `Failed to read YAML file: ${error.message}`);
    }
  };

  const openRetroArch = async () => {
    // Legacy function - redirect to new main launcher
    await openRetroArchMain();
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />
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
                document.documentElement.style.backgroundColor = '#1a1a2e';
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
    backgroundColor: '#1a1a2e',
  },
  webviewContainer: {
    flex: 1,
    backgroundColor: '#1a1a2e',
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
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
