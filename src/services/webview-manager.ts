import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';

export async function loadWebViewAsset(): Promise<string> {
  try {
    const asset = Asset.fromModule(require('../../dist/ui/index.html'));
    await asset.downloadAsync();

    const fileUri = `${FileSystem.documentDirectory}index.html`;
    await FileSystem.copyAsync({
      from: asset.localUri!,
      to: fileUri
    });

    return fileUri.startsWith('file://') ? fileUri : `file://${fileUri}`;
  } catch (error) {
    console.error('Error loading HTML asset:', error);
    throw error;
  }
}

export function getWebViewConfig() {
  return {
    style: { flex: 1, backgroundColor: 'transparent' },
    originWhitelist: ['file://*', '*'],
    allowFileAccess: true,
    allowFileAccessFromFileURLs: true,
    allowUniversalAccessFromFileURLs: true,
    onError: (error: any) => {
      console.error('WebView error:', error);
    }
  };
}