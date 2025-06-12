import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';

/**
 * Loads WebView content using Metro's asset resolution system
 * This approach leverages Expo's Asset API for better bundling
 */

// Import the HTML asset - Metro will bundle this automatically
const webviewHtmlAsset = require('../assets/webview-content.html');

let cachedHtmlContent: string | null = null;

/**
 * Loads WebView HTML content using Expo's Asset API
 * Falls back to cached content or fallback HTML if asset loading fails
 */
export async function getWebViewHtmlFromAsset(): Promise<string> {
  // Return cached content if available
  if (cachedHtmlContent) {
    return cachedHtmlContent;
  }

  try {
    // Load the asset
    const asset = Asset.fromModule(webviewHtmlAsset);
    await asset.downloadAsync();

    if (asset.localUri) {
      // Read the HTML content from the asset
      const htmlContent = await FileSystem.readAsStringAsync(asset.localUri);
      cachedHtmlContent = htmlContent;
      return htmlContent;
    }
  } catch (error) {
    console.warn('Failed to load WebView content from asset:', error);
  }

  // Fallback to basic HTML
  const fallbackHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>Fallback</title>
</head>
<body style="margin: 0; padding: 20px; background: #ff0000; color: white; font-family: Arial, sans-serif;">
    <div style="text-align: center; margin-top: 50px;">
        <h1>WebView Content Missing</h1>
        <p>The WebView content could not be loaded from assets.</p>
        <p>Please run: npm run ui::build</p>
    </div>
</body>
</html>
  `;

  return fallbackHtml;
}

/**
 * Synchronous version that returns cached content or fallback
 * Use this when you need immediate access to content
 */
export function getWebViewHtmlSync(): string {
  if (cachedHtmlContent) {
    return cachedHtmlContent;
  }

  // Return fallback immediately if no cached content
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>Loading</title>
</head>
<body style="margin: 0; padding: 20px; background: #333; color: white; font-family: Arial, sans-serif;">
    <div style="text-align: center; margin-top: 50px;">
        <h1>Loading WebView Content...</h1>
        <p>Please wait while content loads from assets.</p>
    </div>
</body>
</html>
  `;
}