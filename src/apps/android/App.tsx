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
import * as DocumentPicker from "expo-document-picker";
import { minimalRouter as router } from "../../shared/server/appRouter";
import { setupTrpcServer } from "./services/trpc-server";
import { createMessageHandler } from "./services/message-bridge";
import { getWebViewHtml, getWebViewConfig } from "./services/webview-manager";

export default function App() {
	const webViewRef = useRef<WebView>(null);
	const [htmlContent, setHtmlContent] = useState<string | null>(null);
	const [isReady, setIsReady] = useState(false);
	const [trpcHandler, setTrpcHandler] = useState<((event: { nativeEvent: { data: string } }) => void) | null>(null);

	useEffect(() => {
		const loadWebViewContent = async () => {
			try {
				console.log("Attempting to load WebView HTML from assets...");
				const content = await getWebViewHtml();
				console.log("HTML content loaded, setting state...");
				setHtmlContent(content);
			} catch (error) {
				console.error("Failed to load WebView HTML:", error);
			}
		};

		loadWebViewContent();

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

	// Function to recursively get all files in a directory
	async function getAllFilesRecursively(directoryUri: string) {
		const allFiles: Array<{
			name: string;
			uri: string;
			size: number;
			modificationTime: number;
		}> = [];
		
		async function traverseDirectory(uri: string) {
			try {
				const items = await FileSystem.readDirectoryAsync(uri);
				
				for (const item of items) {
					const itemUri = `${uri}/${item}`;
					const info = await FileSystem.getInfoAsync(itemUri);
					
					if (info.isDirectory) {
						// Recursively traverse subdirectories
						await traverseDirectory(itemUri);
					} else {
						// Add file to our list
						allFiles.push({
							name: item,
							uri: itemUri,
							size: info.size || 0,
							modificationTime: info.modificationTime || 0
						});
					}
				}
			} catch (error) {
				console.error(`Error reading directory ${uri}:`, error);
			}
		}
		
		await traverseDirectory(directoryUri);
		return allFiles;
	}

	// Function to pick a folder and get all files
	async function handlePickFolder() {
		try {
			// Pick a directory
			const result = await DocumentPicker.getDocumentAsync({
				type: 'directory',
				copyToCacheDirectory: false,
				multiple: false,
			});
			
			if (!result.canceled && result.assets && result.assets[0]) {
				const folderUri = result.assets[0].uri;
				
				// Get all files recursively
				const allFiles = await getAllFilesRecursively(folderUri);
				
				console.log(`Found ${allFiles.length} files:`);
				allFiles.forEach(file => {
					console.log(`- ${file.name} (${file.size} bytes)`);
				});
				
				return allFiles;
			}
		} catch (error) {
			console.error('Error picking folder or listing files:', error);
		}
	}

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
