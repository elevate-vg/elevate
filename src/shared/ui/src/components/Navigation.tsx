import React from "react";
import { useNavigate, useLocation } from "@tanstack/react-router";

export function Navigation() {
	const navigate = useNavigate();
	const location = useLocation();

	const navItems = [
		{ path: "/", label: "Games", id: "nav-games" },
		{ path: "/scanner", label: "Scanner", id: "nav-scanner" },
		{ path: "/settings", label: "Settings", id: "nav-settings" },
	];

	const handleNavigation = (path: string) => {
		navigate({ to: path });
	};

	return (
		<nav className="navigation">
			{navItems.map((item) => (
				<button
					key={item.path}
					id={item.id}
					className={`nav-item ${location.pathname === item.path ? "active" : ""}`}
					onClick={() => handleNavigation(item.path)}
					data-focusable="true"
				>
					{item.label}
				</button>
			))}
		</nav>
	);
}