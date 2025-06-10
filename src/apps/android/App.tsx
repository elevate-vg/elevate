import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Platform, NativeModules } from "react-native";
import { WebView } from "react-native-webview";
import { useState, useEffect, useRef } from "react";
import * as NavigationBar from "expo-navigation-bar";
import {
	activateKeepAwakeAsync,
	deactivateKeepAwake,
} from "expo-keep-awake";
import { EdgeToEdge } from "react-native-edge-to-edge";
import { minimalRouter as router } from "../../shared/server/appRouter";
import { setupTrpcServer } from "./services/trpc-server";
import { createMessageHandler } from "./services/message-bridge";
import { loadWebViewAsset, getWebViewConfig } from "./services/webview-manager";

export default function App() {
	const webViewRef = useRef<WebView>(null);
	const [htmlUri, setHtmlUri] = useState<string | null>(null);
	const [isReady, setIsReady] = useState(false);
	const [trpcHandler, setTrpcHandler] = useState<any>(null);

	useEffect(() => {
		loadWebViewAsset().then(setHtmlUri);

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

		// Keep screen awake during gameplay
		activateKeepAwakeAsync();

		return () => {
			deactivateKeepAwake();
		};
	}, []);

	useEffect(() => {
		if (!htmlUri) return;

		const server = setupTrpcServer({
			webViewRef,
			router,
			onServerReady: () => setIsReady(true),
			onError: (error) => console.error("tRPC server error:", error),
		});

		setTrpcHandler(() => server.messageHandler);
	}, [htmlUri]);

	const messageHandler = trpcHandler
		? createMessageHandler(trpcHandler)
		: undefined;

	return (
		<View style={styles.container}>
			<StatusBar hidden={true} />
			{htmlUri && isReady && trpcHandler && (
				<WebView
					ref={webViewRef}
					source={{ uri: htmlUri }}
					{...getWebViewConfig()}
					onMessage={messageHandler}
				/>
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
