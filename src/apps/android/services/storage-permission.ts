import * as FileSystem from "expo-file-system";
import { StorageAccessFramework } from "expo-file-system";

const PERMISSION_KEY = "saf_directory_permission";

/**
 * Store the directory URI permission for future use
 */
export async function storeDirectoryPermission(uri: string): Promise<void> {
  try {
    await FileSystem.writeAsStringAsync(
      FileSystem.documentDirectory + PERMISSION_KEY,
      uri
    );
  } catch (error) {
    console.error("Failed to store directory permission:", error);
  }
}

/**
 * Retrieve the stored directory URI permission
 */
export async function getStoredDirectoryPermission(): Promise<string | null> {
  try {
    const storedUri = await FileSystem.readAsStringAsync(
      FileSystem.documentDirectory + PERMISSION_KEY
    );
    return storedUri;
  } catch (error) {
    // File doesn't exist or can't be read
    return null;
  }
}

/**
 * Validate if the stored permission is still valid
 */
export async function validateStoredPermission(uri: string): Promise<boolean> {
  try {
    // Attempt a simple operation to test if permission is still valid
    await StorageAccessFramework.readDirectoryAsync(uri);
    return true;
  } catch (error) {
    // Permission is no longer valid
    console.warn("Stored permission is no longer valid:", error);
    return false;
  }
}

/**
 * Clear stored permission
 */
export async function clearStoredPermission(): Promise<void> {
  try {
    await FileSystem.deleteAsync(
      FileSystem.documentDirectory + PERMISSION_KEY,
      { idempotent: true }
    );
  } catch (error) {
    console.error("Failed to clear stored permission:", error);
  }
}

/**
 * Get directory permission with persistence
 * @param initialDirectory - Optional initial directory name/path to start the picker at
 * Returns the URI if permission is granted, null otherwise
 */
export async function getDirectoryPermissionWithPersistence(initialDirectory?: string): Promise<string | null> {
  // First, check if we have a stored permission
  const storedUri = await getStoredDirectoryPermission();
  
  if (storedUri) {
    // Validate that the permission is still valid
    const isValid = await validateStoredPermission(storedUri);
    
    if (isValid) {
      console.log("Using stored directory permission:", storedUri);
      return storedUri;
    } else {
      // Clear invalid permission
      await clearStoredPermission();
    }
  }
  
  // No valid stored permission, request new one
  try {
    let permissions;
    
    if (initialDirectory !== undefined) {
      // Handle different initial directory scenarios
      if (initialDirectory === '') {
        // Empty string - just request without initial directory (starts at last location)
        console.log("Requesting directory picker without initial directory");
        permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();
      } else if (initialDirectory.includes('/')) {
        // Path with subdirectories - not supported by getUriForDirectoryInRoot
        // Try to use just the root directory name
        const rootDir = initialDirectory.split('/')[0];
        console.log(`Path with subdirectories not supported. Using root directory: ${rootDir}`);
        
        try {
          const initialDirUri = StorageAccessFramework.getUriForDirectoryInRoot(rootDir);
          permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync(initialDirUri);
        } catch (error) {
          console.warn(`Failed to use ${rootDir} as initial directory, falling back to default picker`);
          permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();
        }
      } else {
        // Single directory name - use as-is
        try {
          const initialDirUri = StorageAccessFramework.getUriForDirectoryInRoot(initialDirectory);
          console.log("Starting picker at directory:", initialDirectory, "URI:", initialDirUri);
          permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync(initialDirUri);
        } catch (error) {
          console.warn(`Failed to use ${initialDirectory} as initial directory, falling back to default picker`);
          permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();
        }
      }
    } else {
      // No initial directory specified
      permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();
    }
    
    if (permissions.granted) {
      const uri = permissions.directoryUri;
      
      // Store the permission for future use
      await storeDirectoryPermission(uri);
      
      console.log("New directory permission granted and stored:", uri);
      return uri;
    }
  } catch (error) {
    console.error("Error requesting directory permission:", error);
  }
  
  return null;
}