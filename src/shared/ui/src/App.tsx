import React, { useEffect } from 'react';
import { init, setKeyMap, setFocus } from '@noriginmedia/norigin-spatial-navigation';
import { useTrpc } from './hooks/useTrpc';
import { StatusDisplay } from './components/StatusDisplay';
import { TestButtons } from './components/TestButtons';
import { OutputPanel } from './components/OutputPanel';
import { GameGrid } from './components/GameGrid';
import './App.css';

// Sample game data
const sampleGames = [
	{
		id: '0',
		title: 'The Minish Cap',
		boxArt: 'https://cdn2.steamgriddb.com/thumb/e98002ab38ca88f2ca5e461cc99c5d2b.jpg',
		romPath: '/storage/emulated/0/Download/roms/minish.zip',
		core: 'mgba',
		console: 'gba'
	},
	{
		id: '1',
		title: 'Tetris: Hard Drop',
		boxArt: 'https://cdn2.steamgriddb.com/thumb/036036d598e3d81b103ce8b3c6786dfb.jpg',
		romPath: '/storage/emulated/0/Download/roms/tetris.nes',
		core: 'nestopia',
		console: 'nes'
	},
	{
		id: '2',
		title: 'Donkey Kong',
		boxArt: 'https://cdn2.steamgriddb.com/thumb/8c690fdb96c00586c26b5ce86d21b55f.jpg',
		romPath: '/storage/emulated/0/Download/roms/dk.gb',
		core: 'mgba',
		console: 'gb'
	},
	{
		id: '3',
		title: 'The Minish Cap 2',
		boxArt: 'https://cdn2.steamgriddb.com/thumb/e98002ab38ca88f2ca5e461cc99c5d2b.jpg',
		romPath: '/storage/emulated/0/Download/roms/minish.zip',
		core: 'mgba',
		console: 'gba'
	}
];

export function App() {
	const { status, output, isLoading, testQuery, testMutation, launchZelda, writeYaml, readYaml } = useTrpc();

	useEffect(() => {
		// Initialize spatial navigation
		init({
			// Enable debug mode (can be disabled in production)
			debug: false,
			// Visualize focus for debugging
			visualDebug: false
		});

		// Set custom key mappings (optional - includes gamepad support)
		setKeyMap({
			'left': [37, 65], // Arrow Left, A key
			'up': [38, 87],   // Arrow Up, W key
			'right': [39, 68], // Arrow Right, D key
			'down': [40, 83],  // Arrow Down, S key
			'enter': [13]      // Enter key
		});

		// Set initial focus to first game after a brief delay
		setTimeout(() => {
			setFocus('game-0');
		}, 100);

		return () => {
			// Cleanup is handled automatically by the library
		};
	}, []);

	const handleGameLaunch = (game: any) => {
		// This would typically use the tRPC client to launch the game
		console.log('Launching game:', game);
		// For now, just use the existing launchZelda function as an example
		launchZelda();
	};

	return (
		<div className="main-content">
			<GameGrid games={sampleGames} onGameLaunch={handleGameLaunch} />
			
			<div className="bottom-controls">
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
	);
}
