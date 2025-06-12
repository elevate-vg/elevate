import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";
import path from "path";

export default defineConfig({
	root: "src/shared/ui",
	build: {
		outDir: "../../apps/android/generated",
		emptyOutDir: true,
		rollupOptions: {
			input: path.resolve(__dirname, "src/shared/ui/index.html"),
		},
	},
	server: {
		host: true,
		allowedHosts: ["aka"],
	},
	plugins: [react(), viteSingleFile()],
	esbuild: {
		jsx: "automatic",
	},
	define: {
		// Mock react-native for web build
		"import.meta.env.PLATFORM": '"web"',
		global: "globalThis",
	},
	resolve: {
		alias: {
			"react-native": path.resolve(__dirname, "src/__mocks__/react-native.ts"),
			"expo-file-system": path.resolve(__dirname, "src/__mocks__/expo-file-system.ts"),
			"expo-intent-launcher": path.resolve(__dirname, "src/__mocks__/expo-intent-launcher.ts"),
		},
	},
	optimizeDeps: {
		exclude: ["react-native", "expo-file-system", "expo-intent-launcher"],
	},
});
