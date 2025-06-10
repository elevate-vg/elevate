import React from 'react';

interface OutputPanelProps {
	output: any;
}

export function OutputPanel({ output }: OutputPanelProps) {
	const displayContent = output ? JSON.stringify(output, null, 2) : 'Output will appear here...';

	return (
		<div className="output">
			{displayContent}
		</div>
	);
}