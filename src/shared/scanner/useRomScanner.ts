import { useState, useCallback } from "react";
import { runPromise, runPromiseExit } from "effect/Effect";
import { isSuccess, isFailure } from "effect/Exit";
import { failureOption } from "effect/Cause";
import * as FileSystem from "expo-file-system";
import { scanRoms, exportToYaml, saveYamlToFile } from "./scanner";
import type { GameEntry } from "./types";

// Scanner configuration types
export interface ScannerConfig {
	scanPaths: string[];
	supportedExtensions: string[];
	exportPath?: string;
}

// Hook state types
export interface ScannerState {
	games: GameEntry[];
	isLoading: boolean;
	error: string | null;
	lastScanDate: Date | null;
	totalGames: number;
}

// Scanner actions
export interface ScannerActions {
	scanForGames: () => Promise<void>;
	exportToYamlFile: (customPath?: string) => Promise<string | null>;
	clearResults: () => void;
	clearError: () => void;
}

// Default configuration
const DEFAULT_CONFIG: ScannerConfig = {
	scanPaths: [
		`${FileSystem.documentDirectory}roms`,
		`${FileSystem.documentDirectory}games`,
	],
	supportedExtensions: [
		".nes",
		".sfc",
		".smc",
		".snes",
		".gb",
		".gbc",
		".gba",
		".n64",
		".z64",
		".gen",
		".md",
		".genesis",
		".iso",
		".pbp",
		".nds",
	],
	exportPath: `${FileSystem.documentDirectory}scan-results.yaml`,
};

export function useRomScanner(config?: Partial<ScannerConfig>) {
	const finalConfig: ScannerConfig = {
		...DEFAULT_CONFIG,
		...config,
	};

	const [state, setState] = useState<ScannerState>({
		games: [],
		isLoading: false,
		error: null,
		lastScanDate: null,
		totalGames: 0,
	});

	const scanForGames = useCallback(async () => {
		setState((prev) => ({
			...prev,
			isLoading: true,
			error: null,
		}));

		try {
			const exit = await runPromiseExit(
				scanRoms(finalConfig.scanPaths, finalConfig.supportedExtensions),
			);

			if (isSuccess(exit)) {
				const games = exit.value;
				setState((prev) => ({
					...prev,
					games,
					totalGames: games.length,
					lastScanDate: new Date(),
					isLoading: false,
					error: null,
				}));
			} else if (isFailure(exit)) {
				const failureOpt = failureOption(exit.cause);
				const errorMessage =
					failureOpt._tag === "Some"
						? failureOpt.value.message
						: "Unknown scanning error";

				setState((prev) => ({
					...prev,
					isLoading: false,
					error: errorMessage,
				}));
			}
		} catch (error) {
			setState((prev) => ({
				...prev,
				isLoading: false,
				error:
					error instanceof Error
						? error.message
						: "Unexpected error during scan",
			}));
		}
	}, [finalConfig.scanPaths, finalConfig.supportedExtensions]);

	const exportToYamlFile = useCallback(
		async (customPath?: string): Promise<string | null> => {
			if (state.games.length === 0) {
				setState((prev) => ({
					...prev,
					error: "No games to export. Run a scan first.",
				}));
				return null;
			}

			setState((prev) => ({
				...prev,
				error: null,
			}));

			try {
				const yamlContent = exportToYaml(state.games);
				const exportPath =
					customPath ||
					finalConfig.exportPath ||
					`${FileSystem.documentDirectory}scan-results.yaml`;

				const result = await runPromise(
					saveYamlToFile(yamlContent, exportPath),
				);
				return result;
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : "Failed to export YAML";
				setState((prev) => ({
					...prev,
					error: errorMessage,
				}));
				return null;
			}
		},
		[state.games, finalConfig.exportPath],
	);

	const clearResults = useCallback(() => {
		setState((prev) => ({
			...prev,
			games: [],
			totalGames: 0,
			lastScanDate: null,
			error: null,
		}));
	}, []);

	const clearError = useCallback(() => {
		setState((prev) => ({
			...prev,
			error: null,
		}));
	}, []);

	const actions: ScannerActions = {
		scanForGames,
		exportToYamlFile,
		clearResults,
		clearError,
	};

	return {
		...state,
		...actions,
		config: finalConfig,
	};
}

export default useRomScanner;

