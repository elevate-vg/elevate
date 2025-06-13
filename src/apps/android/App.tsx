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
import { StorageAccessFramework } from "expo-file-system";
import { minimalRouter as router } from "../../shared/server/appRouter";
import { setupTrpcServer } from "./services/trpc-server";
import { createMessageHandler } from "./services/message-bridge";
import { getWebViewHtml, getWebViewConfig } from "./services/webview-manager";
import { getDirectoryPermissionWithPersistence, clearStoredPermission } from "./services/storage-permission";

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

	// Function to pick a folder and get all files
	async function handlePickFolder() {
		try {
			// Get directory permission with persistence
			const uri = await getDirectoryPermissionWithPersistence();

			if (uri) {
				// Recursively get all files in directory and subdirectories
				const getAllFiles = async (directoryUri: string): Promise<string[]> => {
					const allFiles: string[] = [];

					try {
						const items = await StorageAccessFramework.readDirectoryAsync(directoryUri);

						for (const itemUri of items) {
							try {
								const info = await FileSystem.getInfoAsync(itemUri, { md5: false });

								if (info.exists) {
									if (info.isDirectory) {
										// Recursively search subdirectory
										const subDirFiles = await getAllFiles(itemUri);
										allFiles.push(...subDirFiles);
									} else {
										// Add file to results
										allFiles.push(itemUri);
									}
								}
							} catch (error) {
								console.warn(`Could not access ${itemUri}:`, error);
							}
						}
					} catch (error) {
						console.warn(`Could not read directory ${directoryUri}:`, error);
					}

					return allFiles;
				};

				// Get all files recursively
				const allFiles = await getAllFiles(uri);

				Alert.alert('Files Found', `Found ${allFiles.length} files:\n\n${allFiles.slice(0, 10).join('\n')}${allFiles.length > 10 ? `\n\n... and ${allFiles.length - 10} more` : ''}`);
			} else {
				Alert.alert('Permission Denied', 'No directory permission was granted.');
			}
		} catch (error) {
			console.error('Error picking folder or listing files:', error);
			Alert.alert('Error', 'Failed to access directory. Please try again.');
		}
	}

	// Function to pick a folder starting from a specific directory
	async function handlePickFolderWithInitialDir(initialDir: string) {
		try {
			// Clear stored permission first to force new picker with initial directory
			await clearStoredPermission();

			// Get directory permission with initial directory
			const uri = await getDirectoryPermissionWithPersistence(initialDir);

			if (uri) {
				// Recursively get all files in directory and subdirectories
				const getAllFiles = async (directoryUri: string): Promise<string[]> => {
					const allFiles: string[] = [];

					try {
						const items = await StorageAccessFramework.readDirectoryAsync(directoryUri);

						for (const itemUri of items) {
							try {
								const info = await FileSystem.getInfoAsync(itemUri, { md5: false });

								if (info.exists) {
									if (info.isDirectory) {
										// Recursively search subdirectory
										const subDirFiles = await getAllFiles(itemUri);
										allFiles.push(...subDirFiles);
									} else {
										// Add file to results
										allFiles.push(itemUri);
									}
								}
							} catch (error) {
								console.warn(`Could not access ${itemUri}:`, error);
							}
						}
					} catch (error) {
						console.warn(`Could not read directory ${directoryUri}:`, error);
					}

					return allFiles;
				};

				// Get all files recursively
				const allFiles = await getAllFiles(uri);

				Alert.alert('Files Found', `Found ${allFiles.length} files in ${initialDir}:\n\n${allFiles.slice(0, 10).join('\n')}${allFiles.length > 10 ? `\n\n... and ${allFiles.length - 10} more` : ''}`);
			} else {
				Alert.alert('Permission Denied', 'No directory permission was granted.');
			}
		} catch (error) {
			console.error('Error picking folder or listing files:', error);
			Alert.alert('Error', 'Failed to access directory. Please try again.');
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
      <View style={{ flexDirection: 'column', gap: 10, padding: 10 }}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button title="Pick Folder" onPress={handlePickFolder} />
          <Button title="Clear Permission" onPress={async () => {
            await clearStoredPermission();
            Alert.alert('Permission Cleared', 'Stored directory permission has been cleared.');
          }} />
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button title="Pick from Snowscape" onPress={() => handlePickFolderWithInitialDir('snowscape')} />
        </View>
      </View>
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
