import type { Platform } from "./schemas";

/**
 * React Native compatible path utilities
 * These are simplified versions since React Native doesn't have Node.js path module
 */
export const path = {
	/**
	 * Join path segments together
	 */
	join: (...segments: string[]): string => {
		const joined = segments
			.filter((segment) => segment && segment.length > 0)
			.join("/")
			.replace(/\/+/g, "/") // Replace multiple slashes with single slash
			.replace(/\/\.$/, "") // Remove trailing /.
			.replace(/^\.\//, "") // Remove leading ./
			.replace(/\/$/, ""); // Remove trailing slash

		// Preserve leading slash if first segment had one
		if (
			segments.length > 0 &&
			segments[0] &&
			segments[0].startsWith("/") &&
			!joined.startsWith("/")
		) {
			return "/" + joined;
		}

		return joined || ".";
	},

	/**
	 * Get the last portion of a path (filename)
	 */
	basename: (filepath: string, ext?: string): string => {
		const parts = filepath.split("/").filter((p) => p);
		if (parts.length === 0) return "";

		let filename = parts[parts.length - 1];

		// Remove extension if provided
		if (ext && filename.endsWith(ext)) {
			filename = filename.substring(0, filename.length - ext.length);
		}

		return filename;
	},

	/**
	 * Get the directory name of a path
	 */
	dirname: (filepath: string): string => {
		// Handle root path
		if (filepath === "/") return "/";

		// Remove trailing slashes
		const cleaned = filepath.replace(/\/+$/, "");

		// Split and filter
		const parts = cleaned.split("/");

		// Handle absolute paths
		if (filepath.startsWith("/")) {
			if (parts.length <= 2) return "/";
			parts.pop();
			return parts.join("/");
		}

		// Handle relative paths
		if (parts.length <= 1) return ".";
		parts.pop();
		return parts.join("/") || ".";
	},

	/**
	 * Get the extension of a file
	 */
	extname: (filepath: string): string => {
		const filename = path.basename(filepath);
		const lastDot = filename.lastIndexOf(".");

		if (lastDot === -1 || lastDot === 0) return "";
		return filename.substring(lastDot);
	},
};

/**
 * Mapping of file extensions to platforms
 */
const EXTENSION_TO_PLATFORM: Record<string, Platform> = {
	// Nintendo
	".nes": "nintendo-entertainment-system",
	".smc": "super-nintendo-entertainment-system",
	".sfc": "super-nintendo-entertainment-system",
	".gb": "game-boy",
	".gbc": "game-boy-color",
	".gba": "game-boy-advance",
	".z64": "nintendo-64",
	".n64": "nintendo-64",
	".v64": "nintendo-64",
	".gcm": "gamecube",
	".iso": "unknown", // Could be multiple platforms
	".wbfs": "wii",
	".wad": "wii",
	".nds": "nintendo-ds",
	".3ds": "nintendo-3ds",
	".cia": "nintendo-3ds",
	".xci": "nintendo-switch",
	".nsp": "nintendo-switch",

	// Sega
	".sms": "sega-master-system",
	".gg": "sega-master-system", // Game Gear
	".md": "sega-genesis",
	".gen": "sega-genesis",
	".smd": "sega-genesis",
	".32x": "sega-32x",
	".cue": "unknown", // Could be multiple platforms
	".gdi": "sega-dreamcast",

	// Sony
	".bin": "unknown", // Could be multiple platforms
	".pbp": "sony-playstation-portable",
	".cso": "sony-playstation-portable",

	// Atari
	".a26": "atari-2600",
	".a52": "atari-5200",
	".a78": "atari-7800",

	// Arcade
	".zip": "unknown", // Could be arcade or other
};

/**
 * Common ROM naming patterns to remove
 */
const CLEANUP_PATTERNS = [
	/\[.*?\]/g, // Remove [tags]
	/\(.*?\)/g, // Remove (tags)
	/\{.*?\}/g, // Remove {tags}
	/v\d+\.\d+/gi, // Remove version numbers like v1.0
	/Rev\s?\d+/gi, // Remove revision numbers
	/\s+[-_]\s+/g, // Replace ' - ' or ' _ ' with single space
	/[-_]+/g, // Replace multiple dashes/underscores with single space
	/\s+/g, // Replace multiple spaces with single space
	/^\s+|\s+$/g, // Trim whitespace
];

/**
 * Clean a ROM title by removing common tags and patterns
 */
export function cleanTitle(filename: string): string {
	// Remove extension first
	let title = filename;
	const ext = path.extname(filename);
	if (ext) {
		title = title.substring(0, title.length - ext.length);
	}

	// Apply cleanup patterns
	CLEANUP_PATTERNS.forEach((pattern) => {
		title = title.replace(pattern, " ");
	});

	// Final cleanup
	title = title
		.replace(/\s+/g, " ") // Ensure single spaces
		.trim(); // Remove leading/trailing whitespace

	// Capitalize first letter of each word
	title = title
		.split(" ")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(" ");

	return title || filename; // Fallback to original if cleaning resulted in empty string
}

/**
 * Infer platform from file extension
 */
export function inferPlatformFromExtension(extension: string): Platform | null {
	const ext = extension.toLowerCase();
	const platform = EXTENSION_TO_PLATFORM[ext];

	if (!platform || platform === "unknown") {
		// Try to make educated guesses for ambiguous extensions
		if (ext === ".iso") {
			return null; // Too ambiguous
		}
		if (ext === ".bin" || ext === ".cue") {
			return "sony-playstation"; // Most common for these extensions
		}
		if (ext === ".zip") {
			return "arcade"; // Most common for zip files in ROM context
		}
		return null;
	}

	return platform;
}

/**
 * Get all supported file extensions
 */
export function getSupportedExtensions(): string[] {
	return Object.keys(EXTENSION_TO_PLATFORM);
}

/**
 * Check if a file extension is supported
 */
export function isSupportedExtension(extension: string): boolean {
	return extension.toLowerCase() in EXTENSION_TO_PLATFORM;
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
	const units = ["B", "KB", "MB", "GB"];
	let size = bytes;
	let unitIndex = 0;

	while (size >= 1024 && unitIndex < units.length - 1) {
		size /= 1024;
		unitIndex++;
	}

	return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Generate a unique ID for a game entry based on file hash
 * In a real implementation, this would compute MD5 or SHA1
 */
export function generateGameId(filePath: string, fileSize: number): string {
	// For now, use a simple combination of path and size
	// In production, this should be replaced with actual file hashing
	const sanitizedPath = filePath.replace(/[^a-zA-Z0-9]/g, "");
	return `${sanitizedPath}-${fileSize}`;
}

