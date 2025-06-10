import React, { useEffect, useRef } from 'react';
import { useFocusable } from '@noriginmedia/norigin-spatial-navigation';

interface Game {
	id: string;
	title: string;
	boxArt: string;
	romPath: string;
	core: string;
	console: string;
}

interface GameGridProps {
	games: Game[];
	onGameLaunch: (game: Game) => void;
}

interface FocusableGameCardProps {
	game: Game;
	onLaunch: (game: Game) => void;
	focusKey: string;
}

function FocusableGameCard({ game, onLaunch, focusKey }: FocusableGameCardProps) {
	const { ref, focused } = useFocusable({
		focusKey,
		onEnterPress: () => {
			onLaunch(game);
		}
	});

	return (
		<div
			ref={ref}
			className={`game-card ${focused ? 'focused' : ''}`}
			onClick={() => onLaunch(game)}
			data-nav-id={game.id}
		>
			<img
				className="box-art"
				src={game.boxArt}
				alt={game.title}
			/>
			<div className="game-overlay">
				<div className="game-title">{game.title}</div>
			</div>
		</div>
	);
}

export function GameGrid({ games, onGameLaunch }: GameGridProps) {
	const gridRef = useRef<HTMLDivElement>(null);

	return (
		<div className="launcher-grid" ref={gridRef}>
			{games.map((game) => (
				<FocusableGameCard
					key={game.id}
					game={game}
					onLaunch={onGameLaunch}
					focusKey={`game-${game.id}`}
				/>
			))}
		</div>
	);
}