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
});
