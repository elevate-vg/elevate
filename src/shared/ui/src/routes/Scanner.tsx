import React, { useState } from "react";

export function Scanner() {
	const [scanResults, setScanResults] = useState<any[]>([]);
	const [isScanning, setIsScanning] = useState(false);
	const [lastScanDate, setLastScanDate] = useState<string | null>(null);

	const handleScan = async () => {
		setIsScanning(true);
		try {
			// Simulate scanning process
			await new Promise(resolve => setTimeout(resolve, 2000));
			
			// Mock scan results
			const mockResults = [
				{
					id: "scan-1",
					title: "Super Mario Bros",
					platform: "nes",
					path: "/storage/roms/mario.nes",
					size: "40KB"
				},
				{
					id: "scan-2", 
					title: "Pokemon Red",
					platform: "gb",
					path: "/storage/roms/pokemon.gb",
					size: "1MB"
				}
			];
			
			setScanResults(mockResults);
			setLastScanDate(new Date().toLocaleString());
		} catch (error) {
			console.error('Scan failed:', error);
		} finally {
			setIsScanning(false);
		}
	};

	return (
		<div className="scanner-page">
			<div className="scanner-header">
				<h1>ROM Scanner</h1>
				<p>Scan your device for ROM files to add to your game library</p>
			</div>

			<div className="scanner-controls">
				<button 
					className="scan-button"
					onClick={handleScan}
					disabled={isScanning}
				>
					{isScanning ? "Scanning..." : "Start Scan"}
				</button>
				
				{lastScanDate && (
					<p className="last-scan">
						Last scan: {lastScanDate}
					</p>
				)}
			</div>

			<div className="scan-results">
				<h2>Scan Results ({scanResults.length} found)</h2>
				
				{scanResults.length === 0 && !isScanning && (
					<p className="no-results">
						No scan performed yet. Click "Start Scan" to find ROM files.
					</p>
				)}

				{scanResults.map((rom) => (
					<div key={rom.id} className="rom-item">
						<div className="rom-info">
							<h3>{rom.title}</h3>
							<p className="rom-details">
								Platform: {rom.platform.toUpperCase()} | Size: {rom.size}
							</p>
							<p className="rom-path">{rom.path}</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}