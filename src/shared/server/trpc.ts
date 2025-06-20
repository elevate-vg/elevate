import { initTRPC } from "@trpc/server";
import { ZodError } from "zod";
import superjson from "superjson";

export const t = initTRPC.create({
	isServer: false,
	allowOutsideOfServer: true,
	transformer: superjson,
	errorFormatter({ shape, error }) {
		return {
			...shape,
			data: {
				...shape.data,
				zodError:
					error.cause instanceof ZodError ? error.cause.flatten() : null,
			},
		};
	},
});

export const router = t.router;
export const publicProcedure = t.procedure;
