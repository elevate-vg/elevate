import { router, publicProcedure } from "./trpc";
import { z } from "zod";
import { gamesRouter } from "./routers/games";
import { filesRouter } from "./routers/files";
import { Platform } from "react-native";

export const minimalRouter = router({
	hello: publicProcedure
		.input(z.object({ name: z.string() }))
		.query(({ input }) => {
			return {
				greeting: `Hello ${input.name} from React Native!`,
				timestamp: new Date(), // Return actual Date object for superjson testing
				timestampISO: new Date().toISOString(),
			};
		}),

	echo: publicProcedure
		.input(z.object({ message: z.string() }))
		.mutation(({ input }) => {
			console.log("Received echo:", input.message);
			return {
				echo: input.message,
				reversed: input.message.split("").reverse().join(""),
				length: input.message.length,
				receivedAt: new Date(), // Return actual Date object for superjson testing
				metadata: new Map([
					["source", "webview"],
					["processed", "true"],
				]), // Test Map serialization
			};
		}),

	// Routes from appRouter
	games: gamesRouter,
	files: filesRouter,

	platform: router({
		getInfo: publicProcedure.query(() => ({
			os: Platform.OS,
			version: Platform.Version,
			isAndroid: Platform.OS === "android",
			isIOS: Platform.OS === "ios",
			timestamp: new Date().toISOString(),
		})),

		checkFeature: publicProcedure
			.input(
				z.object({
					feature: z.enum(["retroarch", "filesystem", "intents"]),
				}),
			)
			.query(({ input }) => {
				const features = {
					retroarch: Platform.OS === "android",
					filesystem: true,
					intents: Platform.OS === "android",
				};

				return {
					available: features[input.feature],
					feature: input.feature,
					platform: Platform.OS,
				};
			}),
	}),
});

export type MinimalRouter = typeof minimalRouter;
