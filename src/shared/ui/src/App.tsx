import React, { useEffect } from "react";
import { RouterProvider } from "@tanstack/react-router";
import {
	init,
	setKeyMap,
	setFocus,
} from "@noriginmedia/norigin-spatial-navigation";
import { router } from "./router";
import "./App.css";

export function App() {
	useEffect(() => {
		// Initialize spatial navigation
		init({
			// Enable debug mode (can be disabled in production)
			debug: false,
			// Visualize focus for debugging
			visualDebug: false,
		});

		// Set custom key mappings (optional - includes gamepad support)
		setKeyMap({
			left: [37, 65], // Arrow Left, A key
			up: [38, 87], // Arrow Up, W key
			right: [39, 68], // Arrow Right, D key
			down: [40, 83], // Arrow Down, S key
			enter: [13], // Enter key
		});

		// Set initial focus to first game after a brief delay
		setTimeout(() => {
			setFocus("game-0");
		}, 100);

		return () => {
			// Cleanup is handled automatically by the library
		};
	}, []);

	return (
		<div className="main-content">
			<RouterProvider router={router} />
		</div>
	);
}
