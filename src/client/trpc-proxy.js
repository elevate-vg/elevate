/**
 * Simple tRPC Proxy for WebView communication
 * This creates a basic proxy that mimics tRPC API for testing
 */

let requestId = 0;
const pendingRequests = new Map();

/**
 * Send a request to React Native and wait for response
 */
function sendRequest(procedure, input, type = 'query') {
  return new Promise((resolve, reject) => {
    const id = ++requestId;
    
    // Create message in format expected by the tRPC adapter
    const message = {
      type: 'trpc-request',
      id,
      method: type,
      procedure,
      input
    };

    // Store the promise callbacks
    pendingRequests.set(id, { resolve, reject });

    console.log('Sending request:', message);

    // Send to React Native
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify(message));
    } else {
      console.error('ReactNativeWebView not available');
      reject(new Error('ReactNativeWebView not available'));
      return;
    }

    // Set timeout
    setTimeout(() => {
      if (pendingRequests.has(id)) {
        pendingRequests.delete(id);
        reject(new Error('Request timeout (10s)'));
      }
    }, 10000);
  });
}

/**
 * Handle responses from React Native
 */
function handleResponse(data) {
  console.log('Received response:', data);
  
  if (data.type === 'response' && typeof data.id !== 'undefined') {
    const pendingRequest = pendingRequests.get(data.id);
    if (pendingRequest) {
      pendingRequests.delete(data.id);
      
      if (data.error) {
        console.error('Request failed:', data.error);
        pendingRequest.reject(new Error(data.error.message || JSON.stringify(data.error)));
      } else {
        console.log('Request succeeded:', data.result);
        pendingRequest.resolve(data.result);
      }
    } else {
      console.warn('Received response for unknown request ID:', data.id);
    }
  }
}

/**
 * Set up message listeners
 */
function setupMessageListeners() {
  console.log('Setting up message listeners...');
  
  // Primary listener for WebView messages
  window.addEventListener('message', (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('Window message received:', data);
      handleResponse(data);
    } catch (error) {
      console.error('Error parsing window message:', error, event.data);
    }
  });

  // Document listener (backup for some WebView implementations)
  document.addEventListener('message', (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('Document message received:', data);
      handleResponse(data);
    } catch (error) {
      console.error('Error parsing document message:', error, event.data);
    }
  });
  
  console.log('Message listeners ready');
}

/**
 * Create the tRPC proxy client
 */
export function createTrpcProxy() {
  console.log('Creating tRPC proxy...');
  
  // Set up message handling
  setupMessageListeners();

  // Create API object matching the minimal router
  const api = {
    hello: {
      query: (input) => {
        console.log('hello.query called with:', input);
        return sendRequest('hello', input, 'query');
      }
    },
    echo: {
      mutate: (input) => {
        console.log('echo.mutate called with:', input);
        return sendRequest('echo', input, 'mutation');
      }
    }
  };

  console.log('tRPC proxy created successfully');
  return api;
}

// Debug utilities
if (typeof window !== 'undefined') {
  window._trpcDebug = {
    sendRequest,
    pendingRequests,
    handleResponse
  };
  console.log('tRPC debug utilities attached to window');
}

console.log('tRPC proxy module loaded');