import React from 'react';

interface StatusDisplayProps {
	status: string;
}

export function StatusDisplay({ status }: StatusDisplayProps) {
	return (
		<div className="status">
			{status || 'Initializing tRPC client...'}
		</div>
	);
}