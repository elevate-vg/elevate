import { createTRPCProxyClient } from "@trpc/client";
import superjson from "superjson";

// =============================================================================
// CONSTANTS & CONFIGURATION
// =============================================================================

const MESSAGE_TYPES = {
	TRPC_REQUEST: "trpc-request",
	TRPC_RESPONSE: "trpc-response",
};

const ERROR_MESSAGES = {
	WEBVIEW_NOT_AVAILABLE: "ReactNativeWebView not available",
	CLIENT_NOT_INITIALIZED: "tRPC client not initialized",
	MESSAGE_PROCESSING_ERROR: "Error processing message",
	INITIALIZATION_ERROR: "Failed to initialize tRPC client",
	SUBSCRIBE_ERROR: "Error in subscribe",
	QUERY_FAILED: "Query failed",
	MUTATION_FAILED: "Mutation failed",
	TRPC_ERROR: "tRPC Error",
	CONNECTION_ERROR: "Connection to React Native failed",
	INVALID_RESPONSE: "Invalid response format",
};

const STATUS_MESSAGES = {
	CLIENT_READY: "✅ Real tRPC client ready! (Vite bundled)",
	WEBVIEW_NOT_FOUND: "! ReactNativeWebView not found",
	SENDING_QUERY: "Sending query via real tRPC...",
	QUERY_SUCCESS: "✅ Query successful!",
	SENDING_MUTATION: "Sending mutation via real tRPC...",
	MUTATION_SUCCESS: "✅ Mutation successful!",
};

const CONFIG = {
	transformer: superjson,
};

// =============================================================================
// TRPC CLIENT & COMMUNICATION
// =============================================================================

let trpcClient = null;

/**
 * Creates a properly formatted tRPC message with serialized input
 */
function createTrpcMessage(op) {
	const serializedInput = CONFIG.transformer.serialize(op.input);

	return {
		id: op.id,
		method: op.type,
		params: {
			path: op.path,
			input: serializedInput,
		},
	};
}

/**
 * Sends message to React Native host with error handling
 */
function sendMessageToNative(message, observer) {
	if (window.ReactNativeWebView) {
		window.ReactNativeWebView.postMessage(
			JSON.stringify({
				type: MESSAGE_TYPES.TRPC_REQUEST,
				trpc: message,
			}),
		);
		return true;
	} else {
		const error = new Error(ERROR_MESSAGES.WEBVIEW_NOT_AVAILABLE);
		observer.error(error);
		return false;
	}
}

/**
 * Parses incoming messages and identifies tRPC responses
 */
function parseIncomingMessage(event, opId) {
	const data =
		typeof event.data === "string" ? JSON.parse(event.data) : event.data;

	let trpcMessage = null;
	if (data.type === MESSAGE_TYPES.TRPC_RESPONSE && data.trpc) {
		trpcMessage = data.trpc;
	} else if (data.trpc && data.trpc.id === opId) {
		trpcMessage = data.trpc;
	} else if (data.id === opId) {
		trpcMessage = data;
	}

	return trpcMessage && trpcMessage.id === opId ? trpcMessage : null;
}

/**
 * Processes tRPC responses and calls appropriate observer methods
 */
function processResponse(trpcMessage, observer) {
	if (trpcMessage.error) {
		try {
			const deserializedError = CONFIG.transformer.deserialize(
				trpcMessage.error,
			);
			observer.error(
				new Error(deserializedError.message || ERROR_MESSAGES.TRPC_ERROR),
			);
		} catch (deserializeError) {
			observer.error(new Error(ERROR_MESSAGES.INVALID_RESPONSE));
		}
	} else if (trpcMessage.result) {
		try {
			const deserializedData = CONFIG.transformer.deserialize(
				trpcMessage.result.data || trpcMessage.result,
			);
			observer.next({
				result: {
					type: "data",
					data: deserializedData,
				},
			});
			observer.complete();
		} catch (deserializeError) {
			observer.error(new Error(ERROR_MESSAGES.INVALID_RESPONSE));
		}
	}
}

/**
 * Creates message handler with proper event binding/unbinding
 */
function createMessageHandler(op, observer) {
	const messageHandler = (event) => {
		try {
			const trpcMessage = parseIncomingMessage(event, op.id);

			if (trpcMessage) {
				processResponse(trpcMessage, observer);
			}
		} catch (error) {
			observer.error(new Error(ERROR_MESSAGES.MESSAGE_PROCESSING_ERROR));
		}
	};

	window.addEventListener("message", messageHandler);
	document.addEventListener("message", messageHandler);

	return {
		unsubscribe: () => {
			window.removeEventListener("message", messageHandler);
			document.removeEventListener("message", messageHandler);
		},
	};
}

/**
 * Creates a custom tRPC link that uses React Native WebView postMessage for communication
 */
function createPostMessageLink() {
	return () =>
		({ op, next }) => {
			return {
				subscribe: (observer) => {
					try {
						const message = createTrpcMessage(op);

						if (!sendMessageToNative(message, observer)) {
							return;
						}

						return createMessageHandler(op, observer);
					} catch (error) {
						observer.error(new Error(ERROR_MESSAGES.SUBSCRIBE_ERROR));
					}
				},
			};
		};
}

/**
 * Initialize the tRPC client with custom postMessage link
 */
function initializeTrpcClient() {
	try {
		const customPostMessageLink = createPostMessageLink();

		trpcClient = createTRPCProxyClient({
			transformer: CONFIG.transformer,
			links: [customPostMessageLink],
		});

		updateStatus(STATUS_MESSAGES.CLIENT_READY);
	} catch (error) {
		handleError(error, "Initialization");
	}
}

// =============================================================================
// UI UTILITIES
// =============================================================================

/**
 * Update status display element
 */
function updateStatus(message) {
	document.getElementById("status").textContent = message;
}

/**
 * Update output display element with formatted content
 */
function updateOutput(content) {
	document.getElementById("output").textContent = JSON.stringify(
		content,
		null,
		2,
	);
}

// =============================================================================
// ERROR HANDLING
// =============================================================================

/**
 * Centralized error handling with user-friendly messages
 */
function handleError(error, context = "Unknown") {
	const errorMessage = error?.message || error || "Unknown error";
	console.error(`[${context}]`, errorMessage);

	const userFriendlyMessage = getUserFriendlyErrorMessage(errorMessage);
	updateStatus(`❌ ${userFriendlyMessage}`);
	updateOutput({
		type: "error",
		context,
		message: userFriendlyMessage,
		details: errorMessage,
	});
}

/**
 * Convert technical errors to user-friendly messages
 */
function getUserFriendlyErrorMessage(errorMessage) {
	if (errorMessage.includes("ReactNativeWebView")) {
		return "Connection to app unavailable";
	}
	if (errorMessage.includes("not initialized")) {
		return "Client not ready";
	}
	if (errorMessage.includes("timeout") || errorMessage.includes("network")) {
		return "Connection timeout";
	}
	if (errorMessage.includes("parse") || errorMessage.includes("JSON")) {
		return "Invalid response format";
	}
	return "Something went wrong";
}

// =============================================================================
// TEST FUNCTIONS
// =============================================================================

/**
 * Test tRPC query functionality
 */
async function testQuery() {
	if (!trpcClient) {
		handleError(ERROR_MESSAGES.CLIENT_NOT_INITIALIZED, "Query");
		return;
	}

	try {
		updateStatus(STATUS_MESSAGES.SENDING_QUERY);

		const result = await trpcClient.hello.query({
			name: "Vite + Real tRPC Client",
		});

		updateStatus(STATUS_MESSAGES.QUERY_SUCCESS);
		updateOutput({
			type: "query",
			result: result,
		});
	} catch (error) {
		handleError(error, "Query");
	}
}

/**
 * Test tRPC mutation functionality
 */
async function testMutation() {
	if (!trpcClient) {
		handleError(ERROR_MESSAGES.CLIENT_NOT_INITIALIZED, "Mutation");
		return;
	}

	try {
		updateStatus(STATUS_MESSAGES.SENDING_MUTATION);

		const result = await trpcClient.echo.mutate({
			message:
				"Hello from Vite + Real tRPC Client at " +
				new Date().toLocaleTimeString(),
		});

		updateStatus(STATUS_MESSAGES.MUTATION_SUCCESS);
		updateOutput({
			type: "mutation",
			result: result,
		});
	} catch (error) {
		handleError(error, "Mutation");
	}
}

// =============================================================================
// INITIALIZATION
// =============================================================================

window.addEventListener("load", () => {
	try {
		if (!window.ReactNativeWebView) {
			handleError(ERROR_MESSAGES.WEBVIEW_NOT_AVAILABLE, "Initialization");
			return;
		}

		initializeTrpcClient();

		// Make test functions globally available
		window.trpcClient = trpcClient;
		window.testQuery = testQuery;
		window.testMutation = testMutation;
	} catch (error) {
		handleError(error, "Load");
	}
});
