// TypeScript type definitions for tRPC communication

export interface TrpcMessage {
	id: string;
	method: string;
	params: {
		path: string;
		input: any;
	};
}

export interface TrpcResponse {
	id: string;
	result?: {
		type: string;
		data: any;
	};
	error?: any;
}

export interface WebViewMessage {
	type: string;
	trpc: TrpcMessage | TrpcResponse;
}

export interface AppState {
	status: string;
	output: any;
	isLoading: boolean;
	client: any | null;
}

export interface TestResult {
	type: 'query' | 'mutation' | 'error';
	result?: any;
	context?: string;
	message?: string;
	details?: string;
}

// React Native WebView types
declare global {
	interface Window {
		ReactNativeWebView?: {
			postMessage: (message: string) => void;
		};
		trpcClient?: any;
		testQuery?: () => Promise<void>;
		testMutation?: () => Promise<void>;
	}
}