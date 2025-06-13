import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [TanStackRouterVite({
		routesDirectory: path.resolve(__dirname, './src/routes'),
		generatedRouteTree: path.resolve(__dirname, './src/routeTree.gen.ts')
	}), react(), tailwindcss()],
	root: __dirname,
	server: {
		host: true,
		allowedHosts: ["aka"],
		port: 5174, // Different port from the main UI server
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
			"@shared": path.resolve(__dirname, "../../shared"),
		},
	},
});
