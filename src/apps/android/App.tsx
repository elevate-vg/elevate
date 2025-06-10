import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Platform, NativeModules, Text } from "react-native";
import { WebView } from "react-native-webview";
import { useState, useEffect, useRef } from "react";
import * as NavigationBar from "expo-navigation-bar";
import {
	activateKeepAwakeAsync,
	deactivateKeepAwake,
} from "expo-keep-awake";
import { EdgeToEdge } from "react-native-edge-to-edge";
import Constants from "expo-constants";
import { minimalRouter as router } from "../../shared/server/appRouter";
import { setupTrpcServer } from "./services/trpc-server";
import { createMessageHandler } from "./services/message-bridge";
import { getWebViewHtml, getWebViewConfig } from "./services/webview-manager";

export default function App() {
	const webViewRef = useRef<WebView>(null);
	const [htmlContent, setHtmlContent] = useState<string | null>(null);
	const [isReady, setIsReady] = useState(false);
	const [trpcHandler, setTrpcHandler] = useState<any>(null);

	useEffect(() => {
		try {
			console.log("Attempting to load WebView HTML...");
			const content = getWebViewHtml();
			console.log("HTML content loaded, setting state...");
			setHtmlContent(content);
		} catch (error) {
			console.error("Failed to load WebView HTML:", error);
		}

		// Configure immersive mode on Android
		if (Platform.OS === "android") {
			// Enable edge-to-edge mode (only works in development builds)
			try {
				if (EdgeToEdge?.setSystemUIChangeListener) {
					EdgeToEdge.setSystemUIChangeListener((insets) => {
						console.log("System UI insets:", insets);
					});
				}
			} catch (error) {
				console.log("EdgeToEdge not available in Expo Go:", error);
			}

			// Hide navigation bar
			NavigationBar.setVisibilityAsync("hidden");

			// Additional system UI hiding via native modules
			try {
				const { StatusBarManager } = NativeModules;
				if (StatusBarManager) {
					StatusBarManager.setHidden(true, "none");
				}
			} catch (error) {
				console.log("Native StatusBar control not available:", error);
			}
		}

		// Keep screen awake during gameplay (development only)
		if (__DEV__) {
			activateKeepAwakeAsync();
		}

		return () => {
			if (__DEV__) {
				deactivateKeepAwake();
			}
		};
	}, []);

	useEffect(() => {
		if (!htmlContent) return;

		const server = setupTrpcServer({
			webViewRef,
			router,
			onServerReady: () => setIsReady(true),
			onError: (error) => console.error("tRPC server error:", error),
		});

		setTrpcHandler(() => server.messageHandler);
	}, [htmlContent]);

	const messageHandler = trpcHandler
		? createMessageHandler(trpcHandler)
		: undefined;

	console.log("Render conditions:", { 
		hasHtmlContent: !!htmlContent, 
		isReady, 
		hasTrpcHandler: !!trpcHandler,
		htmlLength: htmlContent?.length 
	});

	return (
		<View style={styles.container}>
			<StatusBar hidden={true} />
			{htmlContent && isReady && trpcHandler ? (
				<WebView
					ref={webViewRef}
					source={{ html: htmlContent }}
					{...getWebViewConfig()}
					onMessage={messageHandler}
					onLoad={() => console.log("WebView loaded")}
					onLoadEnd={() => console.log("WebView load ended")}
					onError={(error) => console.error("WebView error:", error)}
				/>
			) : (
				<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'red' }}>
					<Text style={{ color: 'white' }}>
						Loading... HTML: {!!htmlContent ? 'YES' : 'NO'}, Ready: {isReady ? 'YES' : 'NO'}, tRPC: {!!trpcHandler ? 'YES' : 'NO'}
					</Text>
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#1a1a2e",
		paddingBottom: 0,
		marginBottom: 0,
	},
});
