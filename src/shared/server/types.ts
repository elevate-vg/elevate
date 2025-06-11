import { z } from "zod";
import {
	gameConfigSchema,
	fileOperationSchema,
	statusUpdateSchema,
	RomFileSchema,
	LocalRomMetadataSchema,
	GameEntrySchema,
	ScannerConfigSchema,
} from "./schemas";

// Export inferred types from schemas
export type GameConfig = z.infer<typeof gameConfigSchema>;
export type FileOperation = z.infer<typeof fileOperationSchema>;
export type StatusUpdate = z.infer<typeof statusUpdateSchema>;
export type RomFile = z.infer<typeof RomFileSchema>;
export type LocalRomMetadata = z.infer<typeof LocalRomMetadataSchema>;
export type GameEntry = z.infer<typeof GameEntrySchema>;
export type ScannerConfig = z.infer<typeof ScannerConfigSchema>;

// Re-export Platform type from scanner
export type { Platform } from "../scanner/types";