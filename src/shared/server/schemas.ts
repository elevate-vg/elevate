import { z } from "zod";

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
