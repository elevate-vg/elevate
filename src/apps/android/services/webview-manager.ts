export function getWebViewHtml(): string {
	try {
		// Import the built HTML file as a string  
		const htmlContent = require("../../../shared/ui/dist/webview-content.js");
		console.log("WebView HTML loaded successfully, length:", htmlContent?.length);
		console.log("HTML starts with:", htmlContent?.substring(0, 100));
		return htmlContent;
	} catch (error) {
		console.error("Error loading HTML content:", error);
		console.error("Full error:", error);
		
		// Fallback: return a basic HTML page
		const fallbackHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>Fallback</title>
</head>
<body style="margin: 0; padding: 20px; background: #1a1a2e; color: white; font-family: Arial, sans-serif;">
    <div style="text-align: center; margin-top: 50px;">
        <h1>WebView Content Missing</h1>
        <p>The WebView content could not be loaded.</p>
        <p>Please run: npm run ui::build</p>
    </div>
</body>
</html>
		`;
		
		console.log("Using fallback HTML");
		return fallbackHtml;
	}
}

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
