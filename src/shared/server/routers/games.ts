import { router, publicProcedure } from "../trpc";
import { gameConfigSchema } from "../schemas";
import * as IntentLauncher from "expo-intent-launcher";
import { Platform } from "react-native";
import { TRPCError } from "@trpc/server";
import * as FileSystem from "expo-file-system";
import * as YAML from "js-yaml";
import { z } from "zod";

const coreMap: Record<string, string> = {
	mgba: "mgba_libretro_android.so",
	snes9x: "snes9x_libretro_android.so",
	genesis_plus_gx: "genesis_plus_gx_libretro_android.so",
	nestopia: "nestopia_libretro_android.so",
	pcsx_rearmed: "pcsx_rearmed_libretro_android.so",
};

const platformToCoreMap: Record<string, string> = {
	gb: "mgba",
	gbc: "mgba", 
	gba: "mgba",
	nes: "nestopia",
	snes: "snes9x",
	genesis: "genesis_plus_gx",
	ps1: "pcsx_rearmed",
	// Add more mappings as needed
};

export const gamesRouter = router({
	launch: publicProcedure
		.input(gameConfigSchema)
		.mutation(async ({ input }) => {
			if (Platform.OS !== "android") {
				throw new TRPCError({
					code: "PRECONDITION_FAILED",
					message: "RetroArch launcher is only available on Android",
				});
			}

			try {
				const coreFile = coreMap[input.core];
				const corePath = `/data/data/com.retroarch.aarch64/cores/${coreFile}`;

				await IntentLauncher.startActivityAsync("android.intent.action.MAIN", {
					packageName: "com.retroarch.aarch64",
					className: "com.retroarch.browser.retroactivity.RetroActivityFuture",
					extra: {
						ROM: input.romPath,
						LIBRETRO: corePath,
						CONFIGFILE: input.configPath,
						QUITFOCUS: "",
					},
					flags: 0x10000000 | 0x4000000, // NEW_TASK | CLEAR_TOP
				});

				return {
					success: true,
					game: {
						name: input.romPath.split("/").pop() || "Unknown",
						console: input.console,
						core: input.core,
					},
					launchTime: new Date().toISOString(),
				};
			} catch (error) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: `Failed to launch RetroArch: ${error instanceof Error ? error.message : "Unknown error"}`,
					cause: error,
				});
			}
		}),

	openMain: publicProcedure.mutation(async () => {
		if (Platform.OS !== "android") {
			throw new TRPCError({
				code: "PRECONDITION_FAILED",
				message: "RetroArch is only available on Android",
			});
		}

		await IntentLauncher.startActivityAsync("android.intent.action.MAIN", {
			packageName: "com.retroarch.aarch64",
		});

		return {
			success: true,
			action: "main_opened",
			timestamp: new Date().toISOString(),
		};
	}),

	listAvailableCores: publicProcedure.query(() => {
		return Object.entries(coreMap).map(([key, value]) => ({
			id: key,
			filename: value,
			displayName: key.toUpperCase(),
		}));
	}),

	listScanned: publicProcedure.query(async () => {
		try {
			const filePath = `${FileSystem.documentDirectory}scanned-games.yaml`;
			const fileInfo = await FileSystem.getInfoAsync(filePath);

			if (!fileInfo.exists) {
				return {
					games: [],
					totalCount: 0,
					lastScanDate: null,
				};
			}

			const yamlContent = await FileSystem.readAsStringAsync(filePath);
			const parsedYaml = YAML.load(yamlContent) as any;
			
			if (!parsedYaml || !parsedYaml.games || !Array.isArray(parsedYaml.games)) {
				return {
					games: [],
					totalCount: 0,
					lastScanDate: null,
				};
			}

			// Convert GameEntry format to Game format for the UI
			const games = parsedYaml.games.map((gameEntry: any, index: number) => {
				const platform = gameEntry.platform || 'unknown';
				const core = platformToCoreMap[platform] || 'mgba';
				const primaryFile = gameEntry.files?.[0];
				
				return {
					id: gameEntry.id || index.toString(),
					title: gameEntry.release?.title || 'Unknown Game',
					boxArt: `https://via.placeholder.com/300x400/1a1a1a/ffffff?text=${encodeURIComponent(gameEntry.release?.title || 'Game')}`,
					romPath: primaryFile?.path || '',
					core: core,
					console: platform,
					// Additional metadata for display
					developer: gameEntry.release?.developer,
					releaseYear: gameEntry.release?.releaseYear,
					genre: gameEntry.release?.genre,
					fileSize: primaryFile?.size || 0,
				};
			});

			return {
				games: games,
				totalCount: games.length,
				lastScanDate: parsedYaml.metadata?.scanDate || fileInfo.modificationTime,
			};
		} catch (error) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: `Failed to read scanned games: ${error instanceof Error ? error.message : "Unknown error"}`,
				cause: error,
			});
		}
	}),
});
