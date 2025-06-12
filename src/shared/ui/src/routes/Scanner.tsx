import React from "react";
import { RomScanner } from "../components/RomScanner";

export function Scanner() {
	return (
		<div style={{
			padding: "1rem",
			height: "100%",
			display: "flex",
			flexDirection: "column",
		}}>
			<div style={{
				marginBottom: "1rem",
			}}>
				<h1 style={{
					fontSize: "2rem",
					margin: "0 0 0.5rem 0",
					color: "#fff",
				}}>ROM Scanner</h1>
				<p style={{
					margin: 0,
					color: "rgba(255, 255, 255, 0.7)",
				}}>Scan your device for ROM files to add to your game library</p>
			</div>

			<div style={{ 
				flex: 1,
				position: "relative",
				borderRadius: "0.75rem",
				overflow: "hidden",
			}}>
				<RomScanner />
			</div>
		</div>
	);
}