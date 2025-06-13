import React, { useState } from "react";
import { useTrpc } from "../hooks/useTrpc";
import { StatusDisplay } from "../components/StatusDisplay";
import { TestButtons } from "../components/TestButtons";
import { OutputPanel } from "../components/OutputPanel";
import { GameGrid } from "../components/GameGrid";

// Sample game data - this would eventually come from the ROM scanner
const sampleGames = [
	{
		id: "0",
		title: "The Minish Cap",
		boxArt:
			"https://cdn2.steamgriddb.com/thumb/e98002ab38ca88f2ca5e461cc99c5d2b.jpg",
		romPath: "/storage/emulated/0/snowscape/gaming/roms/minish.zip",
		core: "mgba",
		console: "gba",
	},
	{
		id: "1",
		title: "Tetris: Hard Drop",
		boxArt:
			"https://cdn2.steamgriddb.com/thumb/036036d598e3d81b103ce8b3c6786dfb.jpg",
		romPath: "/storage/emulated/0/snowscape/gaming/roms/tetris.nes",
		core: "nestopia",
		console: "nes",
	},
	{
		id: "2",
		title: "Donkey Kong",
		boxArt:
			"https://cdn2.steamgriddb.com/thumb/8c690fdb96c00586c26b5ce86d21b55f.jpg",
		romPath: "/storage/emulated/0/snowscape/gaming/roms/dk.gb",
		core: "mgba",
		console: "gb",
	},
	{
		id: "3",
		title: "ScourgeBringer",
		boxArt:
			"https://cdn2.steamgriddb.com/grid/f68724cd9da08a80a5eaa5cc60bbe1ab.jpg",
		romPath: "ScourgeBringer", // For Android games, this is just the display name
		core: "android",
		console: "android",
		packageName: "com.pid.scourgebringer",
		className: "crc645d6a1e7bece73b70.Program",
	},
];

export function Games() {
	const {
		status,
		output,
		isLoading,
		testQuery,
		testMutation,
		launchGame,
		launchZelda,
		writeYaml,
		readYaml,
	} = useTrpc();
	const [isDebugCollapsed, setIsDebugCollapsed] = useState(true);
	const [isLaunching, setIsLaunching] = useState(false);

	const handleGameLaunch = (game: any) => {
		// Start fade to black animation
		setIsLaunching(true);

		// Wait for fade animation to complete, then launch game
		setTimeout(() => {
			console.log("Launching game:", game);
			launchGame(game);

			// Reset launching state after a brief delay to allow RetroArch to take over
			setTimeout(() => {
				setIsLaunching(false);
			}, 1000);
		}, 250); // 250ms matches the CSS animation duration
	};

	const isDevelopment = import.meta.env.DEV;

	return (
		<div className="games-page">
			<GameGrid games={sampleGames} onGameLaunch={handleGameLaunch} />

			{/* Fade to black overlay */}
			{isLaunching && <div className="fade-overlay" />}

			{isDevelopment && (
				<button
					className="debug-toggle"
					onClick={() => setIsDebugCollapsed(!isDebugCollapsed)}
				>
					{isDebugCollapsed ? "▲" : "▼"}
				</button>
			)}

			{isDevelopment && !isDebugCollapsed && (
				<div className="bottom-controls">
					<div className="debug-section">
						<div className="quick-actions">
							<TestButtons
								onTestQuery={testQuery}
								onTestMutation={testMutation}
								onLaunchZelda={launchZelda}
								onWriteYaml={writeYaml}
								onReadYaml={readYaml}
								isLoading={isLoading}
							/>
						</div>
						<StatusDisplay status={status} />
						<OutputPanel output={output} />
					</div>
				</div>
			)}
		</div>
	);
}
