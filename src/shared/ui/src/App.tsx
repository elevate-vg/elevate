import React, { useEffect } from 'react';
import { init, setKeyMap, setFocus } from '@noriginmedia/norigin-spatial-navigation';
import { useTrpc } from './hooks/useTrpc';
import { StatusDisplay } from './components/StatusDisplay';
import { TestButtons } from './components/TestButtons';
import { OutputPanel } from './components/OutputPanel';
import './App.css';

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

		// Log to verify initialization
		// console.log('Spatial navigation initialized');

		// Set initial focus after a brief delay to ensure components are mounted
		setTimeout(() => {
			setFocus('test-query');
		}, 100);

		return () => {
			// Cleanup is handled automatically by the library
		};
	}, []);

	return (
		<div>
			<h1>The ok Vite + Real tRPC Client</h1>
			<StatusDisplay status={status} />
			<TestButtons
				onTestQuery={testQuery}
				onTestMutation={testMutation}
				onLaunchZelda={launchZelda}
				onWriteYaml={writeYaml}
				onReadYaml={readYaml}
				isLoading={isLoading}
			/>
			<OutputPanel output={output} />
		</div>
	);
}
