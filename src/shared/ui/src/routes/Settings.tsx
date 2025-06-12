import React from "react";

export function Settings() {
	return (
		<div className="settings-page">
			<div className="settings-header">
				<h1>Settings</h1>
				<p>Configure your game launcher preferences</p>
			</div>

			<div className="settings-sections">
				<section className="settings-section">
					<h2>ROM Paths</h2>
					<div className="setting-item">
						<label>Default ROM Directory</label>
						<input 
							type="text" 
							defaultValue="/storage/emulated/0/ROMs"
							className="settings-input"
						/>
					</div>
				</section>

				<section className="settings-section">
					<h2>Display</h2>
					<div className="setting-item">
						<label>
							<input type="checkbox" defaultChecked />
							Show game metadata
						</label>
					</div>
					<div className="setting-item">
						<label>
							<input type="checkbox" defaultChecked />
							Enable spatial navigation
						</label>
					</div>
				</section>

				<section className="settings-section">
					<h2>RetroArch</h2>
					<div className="setting-item">
						<label>RetroArch Package</label>
						<select className="settings-select">
							<option value="com.retroarch">RetroArch</option>
							<option value="com.retroarch.aarch64">RetroArch (64-bit)</option>
						</select>
					</div>
				</section>

				<section className="settings-section">
					<h2>Debug</h2>
					<div className="setting-item">
						<label>
							<input type="checkbox" />
							Enable debug mode
						</label>
					</div>
					<div className="setting-item">
						<label>
							<input type="checkbox" />
							Show spatial navigation debug
						</label>
					</div>
				</section>
			</div>
		</div>
	);
}