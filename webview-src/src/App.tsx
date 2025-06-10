import React from 'react';
import { useTrpc } from './hooks/useTrpc';
import { StatusDisplay } from './components/StatusDisplay';
import { TestButtons } from './components/TestButtons';
import { OutputPanel } from './components/OutputPanel';
import './App.css';

export function App() {
	const { status, output, isLoading, testQuery, testMutation } = useTrpc();

	return (
		<div>
			<h1>The ok Vite + Real tRPC Client</h1>
			<StatusDisplay status={status} />
			<TestButtons
				onTestQuery={testQuery}
				onTestMutation={testMutation}
				isLoading={isLoading}
			/>
			<OutputPanel output={output} />
		</div>
	);
}
