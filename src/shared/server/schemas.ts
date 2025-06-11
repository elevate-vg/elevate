import { z } from "zod";
import { PlatformSchema } from "../scanner/schemas";

// Core game configuration schemas
export const gameConfigSchema = z.object({
	romPath: z.string().min(1, "ROM path is required"),
	core: z.enum([
		"mgba",
		"snes9x",
		"genesis_plus_gx",
		"nestopia",
		"pcsx_rearmed",
	]),
	console: z.enum(["gb", "gba", "snes", "genesis", "nes", "psx"]),
	configPath: z
		.string()
		.optional()
		.default(
			"/storage/emulated/0/Android/data/com.retroarch.aarch64/files/retroarch.cfg",
		),
});

export const fileOperationSchema = z.object({
	content: z.string(),
	filename: z.string().optional(),
});

export const statusUpdateSchema = z.object({
	type: z.enum([
		"LAUNCH_STATUS",
		"ERROR",
		"FILE_WRITE_SUCCESS",
		"FILE_READ_SUCCESS",
		"APP_STATUS",
	]),
	message: z.string(),
	timestamp: z.string().datetime().optional(),
});

// ROM Scanner Schemas
export const RomFileSchema = z.object({
	path: z.string(),
	name: z.string(),
	extension: z.string(),
	size: z.number().positive(),
	lastModified: z.date(),
});

export const LocalRomMetadataSchema = z.object({
	hash: z.string(), // MD5 or SHA1 hash of the ROM
	platform: PlatformSchema,
	title: z.string(),
	region: z.string().optional(),
	language: z.string().optional(),
	developer: z.string().optional(),
	publisher: z.string().optional(),
	releaseDate: z.string().optional(),
	genre: z.array(z.string()).optional(),
	description: z.string().optional(),
	coverArtUrl: z.string().url().optional(),
	retroarchCore: z.string().optional(),
});

export const GameEntrySchema = z.object({
	id: z.string(), // UUID or hash-based ID
	file: RomFileSchema,
	metadata: LocalRomMetadataSchema.optional(),
	dateAdded: z.date(),
	lastPlayed: z.date().optional(),
	playCount: z.number().int().nonnegative().default(0),
	isFavorite: z.boolean().default(false),
	customName: z.string().optional(),
	customCoverPath: z.string().optional(),
});

export const ScannerConfigSchema = z.object({
	directories: z.array(z.string()),
	extensions: z.array(z.string()).default([
		".gb", ".gbc", ".gba", ".smc", ".sfc", ".nes", 
		".md", ".gen", ".smd", ".iso", ".cue", ".bin",
		".z64", ".n64", ".nds", ".3ds", ".cia"
	]),
	recursive: z.boolean().default(true),
	ignoreHidden: z.boolean().default(true),
	minFileSize: z.number().positive().default(1024), // 1KB minimum
	maxFileSize: z.number().positive().default(4 * 1024 * 1024 * 1024), // 4GB maximum
});
