import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Platform, NativeModules, Text, Button, Alert } from "react-native";
import { WebView } from "react-native-webview";
import { useState, useEffect, useRef } from "react";
import * as NavigationBar from "expo-navigation-bar";
import {
	activateKeepAwakeAsync,
	deactivateKeepAwake,
} from "expo-keep-awake";
import { SystemBars } from "react-native-edge-to-edge";
import * as FileSystem from "expo-file-system";
import { minimalRouter as router } from "../../shared/server/appRouter";
import { setupTrpcServer } from "./services/trpc-server";
import { createMessageHandler } from "./services/message-bridge";
import { getWebViewHtml, getWebViewConfig } from "./services/webview-manager";
import { TestRomScannerHook } from "./TestRomScannerHook";

export default function App() {
	const webViewRef = useRef<WebView>(null);
	const [htmlContent, setHtmlContent] = useState<string | null>(null);
	const [isReady, setIsReady] = useState(false);
	const [trpcHandler, setTrpcHandler] = useState<((event: { nativeEvent: { data: string } }) => void) | null>(null);

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
			// Enable edge-to-edge mode using SystemBars
			try {
				SystemBars.setHidden(true);
			} catch (error) {
				console.log("SystemBars not available in Expo Go:", error);
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

	const handlePickFolder = async () => {
		try {
			// Request directory permissions using Storage Access Framework
			const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

			if (permissions.granted) {
				const uri = permissions.directoryUri;
				Alert.alert('Folder Access Granted', `Directory URI: ${uri}`);

				// You can now list files in the directory
				const files = await FileSystem.StorageAccessFramework.readDirectoryAsync(uri);
				console.log('Files in directory:', files);
			} else {
				Alert.alert('Permission Denied', 'Folder access was denied');
			}
		} catch (error) {
			Alert.alert('Error', `Failed to access folder: ${error}`);
		}
	};

	console.log("Render conditions:", {
		hasHtmlContent: !!htmlContent,
		isReady,
		hasTrpcHandler: !!trpcHandler,
		htmlLength: htmlContent?.length
	});

	return (
		<View style={styles.container}>
			<StatusBar hidden={true} />
			<Button title="Pick Folder" onPress={handlePickFolder} />
      <TestRomScannerHook />
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
