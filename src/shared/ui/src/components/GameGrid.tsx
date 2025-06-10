import React, { useEffect, useRef, useState } from "react";
import {
	useFocusable,
	setFocus,
} from "@noriginmedia/norigin-spatial-navigation";

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

function FocusableGameCard({
	game,
	onLaunch,
	focusKey,
}: FocusableGameCardProps) {
	const [focusedByMouse, setFocusedByMouse] = useState(false);
	const { ref, focused } = useFocusable({
		focusKey,
		onEnterPress: () => {
			onLaunch(game);
		},
	});

	// Scroll into view when focused via keyboard only
	useEffect(() => {
		if (focused && ref.current && !focusedByMouse) {
			ref.current.scrollIntoView({
				behavior: "instant",
				block: "nearest",
				inline: "center",
			});
		}
		// Reset mouse focus flag when focus changes
		if (!focused) {
			setFocusedByMouse(false);
		}
	}, [focused, focusedByMouse, ref]);

	const handleMouseEnter = () => {
		setFocusedByMouse(true);
		setFocus(focusKey);
	};

	return (
		<div
			ref={ref}
			className={`game-card ${focused ? "focused" : ""}`}
			onClick={() => onLaunch(game)}
			onMouseEnter={handleMouseEnter}
			data-nav-id={game.id}
		>
			<img className="box-art" src={game.boxArt} alt={game.title} />
			<div className="game-overlay">
				<div className="game-title">{game.title}</div>
			</div>
		</div>
	);
}

export function GameGrid({ games, onGameLaunch }: GameGridProps) {
	const gridRef = useRef<HTMLDivElement>(null);

	const handleWheel = (e: React.WheelEvent) => {
		// Convert vertical scroll to horizontal scroll with faster speed
		if (gridRef.current && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
			e.preventDefault();
			gridRef.current.scrollLeft += e.deltaY * 1.5;
		}
	};

	return (
		<div className="launcher-grid" ref={gridRef} onWheel={handleWheel}>
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
