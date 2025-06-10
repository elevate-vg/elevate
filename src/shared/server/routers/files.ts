import { router, publicProcedure } from "../trpc";
import { fileOperationSchema } from "../schemas";
import * as FileSystem from "expo-file-system";
import * as YAML from "js-yaml";
import { Platform } from "react-native";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const filesRouter = router({
	writeYaml: publicProcedure
		.input(fileOperationSchema)
		.mutation(async ({ input }) => {
			const filename = input.filename || "sample.yaml";
			const filePath = `${FileSystem.documentDirectory}${filename}`;

			const yamlData = {
				message: input.content,
				timestamp: new Date().toISOString(),
				platform: Platform.OS,
				app: {
					name: "elevate-expo",
					version: "1.0.0",
				},
				metadata: {
					writeCount: Math.floor(Math.random() * 100) + 1,
					source: "trpc-request",
				},
			};

			const yamlString = YAML.dump(yamlData);
			await FileSystem.writeAsStringAsync(filePath, yamlString);

			return {
				success: true,
				filePath,
				size: yamlString.length,
				content: yamlData,
			};
		}),

	readYaml: publicProcedure
		.input(z.object({ filename: z.string().optional() }))
		.query(async ({ input }) => {
			const filename = input.filename || "sample.yaml";
			const filePath = `${FileSystem.documentDirectory}${filename}`;
			const fileInfo = await FileSystem.getInfoAsync(filePath);

			if (!fileInfo.exists) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: `YAML file '${filename}' does not exist. Write a file first.`,
				});
			}

			const yamlContent = await FileSystem.readAsStringAsync(filePath);
			const parsedYaml = YAML.load(yamlContent) as any;

			return {
				success: true,
				platform: parsedYaml.platform || "unknown",
				content: parsedYaml,
				fileInfo: {
					size: fileInfo.size || 0,
					modificationTime: fileInfo.modificationTime || 0,
					uri: fileInfo.uri,
				},
			};
		}),

	list: publicProcedure.query(async () => {
		const files = await FileSystem.readDirectoryAsync(
			FileSystem.documentDirectory || "",
		);
		const yamlFiles = files.filter(
			(f) => f.endsWith(".yaml") || f.endsWith(".yml"),
		);

		return {
			files: yamlFiles,
			directory: FileSystem.documentDirectory,
			count: yamlFiles.length,
		};
	}),
});
