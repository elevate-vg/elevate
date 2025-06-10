import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";
import path from "path";

export default defineConfig({
	root: "ui",
	build: {
		outDir: "../assets/web",
		emptyOutDir: true,
		rollupOptions: {
			input: path.resolve(__dirname, "ui/index.html"),
		},
	},
	plugins: [react(), viteSingleFile()],
	esbuild: {
		jsx: "automatic",
	},
});
