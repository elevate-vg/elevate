import React from 'react';

interface TestButtonsProps {
	onTestQuery: () => void;
	onTestMutation: () => void;
	onLaunchZelda: () => void;
	onWriteYaml: () => void;
	onReadYaml: () => void;
	isLoading: boolean;
}

export function TestButtons({ onTestQuery, onTestMutation, onLaunchZelda, onWriteYaml, onReadYaml, isLoading }: TestButtonsProps) {
	return (
		<div>
			<button 
				className="button" 
				onClick={onTestQuery}
				disabled={isLoading}
			>
				Test Query (hello)
			</button>
			<button 
				className="button" 
				onClick={onTestMutation}
				disabled={isLoading}
			>
				Test Mutation (echo)
			</button>
			<button 
				className="button" 
				onClick={onLaunchZelda}
				disabled={isLoading}
			>
				🎮 Launch Zelda: Minish Cap
			</button>
			<button 
				className="button" 
				onClick={onWriteYaml}
				disabled={isLoading}
			>
				📝 Write YAML File
			</button>
			<button 
				className="button" 
				onClick={onReadYaml}
				disabled={isLoading}
			>
				📖 Read YAML File
			</button>
		</div>
	);
}