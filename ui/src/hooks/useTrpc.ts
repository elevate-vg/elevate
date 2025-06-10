import { useState, useEffect, useCallback } from 'react';
import { initializeTrpcClient, getUserFriendlyErrorMessage, STATUS_MESSAGES, ERROR_MESSAGES } from '../utils/trpc';
import { AppState, TestResult } from '../types/trpc';

export function useTrpc() {
	const [state, setState] = useState<AppState>({
		status: '',
		output: null,
		isLoading: false,
		client: null,
	});

	const updateStatus = useCallback((message: string) => {
		setState(prev => ({ ...prev, status: message }));
	}, []);

	const updateOutput = useCallback((content: any) => {
		setState(prev => ({ ...prev, output: content }));
	}, []);

	const handleError = useCallback((error: any, context = 'Unknown') => {
		const errorMessage = error?.message || error || 'Unknown error';
		console.error(`[${context}]`, errorMessage);

		const userFriendlyMessage = getUserFriendlyErrorMessage(errorMessage);
		updateStatus(`❌ ${userFriendlyMessage}`);
		updateOutput({
			type: 'error',
			context,
			message: userFriendlyMessage,
			details: errorMessage,
		});
		setState(prev => ({ ...prev, isLoading: false }));
	}, [updateStatus, updateOutput]);

	const initializeClient = useCallback(() => {
		try {
			if (!window.ReactNativeWebView) {
				handleError(ERROR_MESSAGES.WEBVIEW_NOT_AVAILABLE, 'Initialization');
				return;
			}

			const client = initializeTrpcClient();
			setState(prev => ({ ...prev, client }));
			updateStatus(STATUS_MESSAGES.CLIENT_READY);

			// Make test functions globally available for backward compatibility
			window.trpcClient = client;
		} catch (error) {
			handleError(error, 'Initialization');
		}
	}, [handleError, updateStatus]);

	const testQuery = useCallback(async () => {
		if (!state.client) {
			handleError(ERROR_MESSAGES.CLIENT_NOT_INITIALIZED, 'Query');
			return;
		}

		try {
			setState(prev => ({ ...prev, isLoading: true }));
			updateStatus(STATUS_MESSAGES.SENDING_QUERY);

			const result = await state.client.hello.query({
				name: 'Vite + Real tRPC Client',
			});

			updateStatus(STATUS_MESSAGES.QUERY_SUCCESS);
			updateOutput({
				type: 'query',
				result: result,
			});
		} catch (error) {
			handleError(error, 'Query');
		} finally {
			setState(prev => ({ ...prev, isLoading: false }));
		}
	}, [state.client, handleError, updateStatus, updateOutput]);

	const testMutation = useCallback(async () => {
		if (!state.client) {
			handleError(ERROR_MESSAGES.CLIENT_NOT_INITIALIZED, 'Mutation');
			return;
		}

		try {
			setState(prev => ({ ...prev, isLoading: true }));
			updateStatus(STATUS_MESSAGES.SENDING_MUTATION);

			const result = await state.client.echo.mutate({
				message:
					'Hello from Vite + Real tRPC Client at ' +
					new Date().toLocaleTimeString(),
			});

			updateStatus(STATUS_MESSAGES.MUTATION_SUCCESS);
			updateOutput({
				type: 'mutation',
				result: result,
			});
		} catch (error) {
			handleError(error, 'Mutation');
		} finally {
			setState(prev => ({ ...prev, isLoading: false }));
		}
	}, [state.client, handleError, updateStatus, updateOutput]);

	useEffect(() => {
		initializeClient();
		
		// Make test functions globally available for backward compatibility
		window.testQuery = testQuery;
		window.testMutation = testMutation;

		return () => {
			// Cleanup
			delete window.testQuery;
			delete window.testMutation;
			delete window.trpcClient;
		};
	}, [initializeClient, testQuery, testMutation]);

	return {
		status: state.status,
		output: state.output,
		isLoading: state.isLoading,
		client: state.client,
		testQuery,
		testMutation,
	};
}