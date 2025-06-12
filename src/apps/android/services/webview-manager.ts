import { getWebViewHtmlFromAsset, getWebViewHtmlSync as getWebViewHtmlSyncFromAsset } from "./webview-asset-loader";

// Cache for the loaded HTML content to avoid multiple requires
let cachedHtmlContent: string | null = null;

/**
 * Enhanced WebView manager that supports both Metro assets and fallback require()
 * This provides better bundling through Metro's asset system while maintaining compatibility
 */

const FALLBACK_HTML = `
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
        <p>The WebView content could not be loaded.</p>
        <p>Please run: npm run ui::build</p>
    </div>
</body>
</html>
`;

/**
 * Attempts to load content using static requires
 * @returns The content if successful, null otherwise
 */
function tryLoadContentFromRequire(): string | null {
	try {
		// Try to load from dist first
		const distContent = require("../../../shared/ui/dist/webview-content.js");
		if (distContent) {
			return distContent;
		}
	} catch {
		// Ignore error, try next option
	}

	try {
		// Try to load from placeholder
		const placeholderContent = require("../../../shared/ui/dist-placeholder/webview-content.js");
		if (placeholderContent) {
			return placeholderContent;
		}
	} catch {
		// Ignore error
	}

	return null;
}

/**
 * Gets the WebView HTML content with a cascading fallback strategy:
 * 1. Try Metro asset system (best bundling)
 * 2. Try cached require() content 
 * 3. Try dynamic require() from dist
 * 4. Try dynamic require() from placeholder
 * 5. Return fallback HTML
 */
export async function getWebViewHtml(): Promise<string> {
	// Strategy 1: Try Metro asset system first (best approach)
	try {
		const assetContent = await getWebViewHtmlFromAsset();
		if (assetContent && assetContent.includes('<!DOCTYPE html>')) {
			cachedHtmlContent = assetContent;
			return assetContent;
		}
	} catch (error) {
		console.warn('Asset loading failed, falling back to require():', error);
	}

	// Strategy 2: Return cached content if available
	if (cachedHtmlContent) {
		return cachedHtmlContent;
	}

	// Strategy 3: Try require() fallbacks
	const content = tryLoadContentFromRequire();
	if (content) {
		cachedHtmlContent = content;
		return content;
	}

	// Strategy 5: Return fallback HTML as last resort
	return FALLBACK_HTML;
}

/**
 * Synchronous version that uses cached content or immediate fallbacks
 * Use this when you need immediate access to content without async loading
 */
export function getWebViewHtmlSync(): string {
	// Try cached content first
	if (cachedHtmlContent) {
		return cachedHtmlContent;
	}

	// Try sync asset loader
	try {
		const syncAssetContent = getWebViewHtmlSyncFromAsset();
		if (syncAssetContent && syncAssetContent.includes('<!DOCTYPE html>')) {
			cachedHtmlContent = syncAssetContent;
			return syncAssetContent;
		}
	} catch (error) {
		// Asset sync loading failed, continue to require() fallbacks
	}

	// Try require() fallbacks
	const content = tryLoadContentFromRequire();
	if (content) {
		cachedHtmlContent = content;
		return content;
	}

	// Return fallback HTML
	return FALLBACK_HTML;
}

/**
 * WebView configuration for React Native WebView component
 */
export function getWebViewConfig() {
	return {
		style: {
			flex: 1,
			backgroundColor: "transparent",
			marginBottom: 0,
			paddingBottom: 0,
		},
		originWhitelist: ["file://*", "*"],
		allowFileAccess: true,
		allowFileAccessFromFileURLs: true,
		allowUniversalAccessFromFileURLs: true,
		hideKeyboardAccessoryView: true,
		keyboardDisplayRequiresUserAction: false,
		onError: (error: any) => {
			console.error("WebView error:", error);
		},
	};
}