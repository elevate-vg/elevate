import React from 'react';

interface TestButtonsProps {
	onTestQuery: () => void;
	onTestMutation: () => void;
	isLoading: boolean;
}

export function TestButtons({ onTestQuery, onTestMutation, isLoading }: TestButtonsProps) {
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
		</div>
	);
}