import { join } from "path";

/**
 * Centralized path configuration for WebView content
 * This ensures all scripts and services reference the same paths
 */

// Base paths relative to project root
const PROJECT_ROOT = join(__dirname, "../../../../");

export const WEBVIEW_PATHS = {
	// Source files
	viteOutputHtml: join(PROJECT_ROOT, "src/apps/android/generated/index.html"),
	
	// Generated files
	webviewContentJs: join(PROJECT_ROOT, "src/shared/ui/dist/webview-content.js"),
	webviewContentPlaceholder: join(PROJECT_ROOT, "src/shared/ui/dist-placeholder/webview-content.js"),
	
	// Directories
	distDir: join(PROJECT_ROOT, "src/shared/ui/dist"),
	placeholderDir: join(PROJECT_ROOT, "src/shared/ui/dist-placeholder"),
	generatedDir: join(PROJECT_ROOT, "src/apps/android/generated"),
} as const;

// Relative paths for require() statements in webview-manager.ts
export const WEBVIEW_RELATIVE_PATHS = {
	dist: "../../../shared/ui/dist/webview-content.js",
	placeholder: "../../../shared/ui/dist-placeholder/webview-content.js",
} as const;

// Validation configuration
export const VALIDATION_CONFIG = {
	minimumFileSize: 1000, // 1KB minimum
	requiredHtmlPattern: "<!doctype html>",
} as const;