# WebView Communication Guide

## Communication Methods (Same for All Proposals)

The communication method is identical for all three proposals - only the HTML loading differs. Here's how to implement bidirectional communication:

## React Native → WebView

### 1. Using `injectedJavaScript` (On Load)
```tsx
const injectedJS = `
  window.userToken = 'abc123';
  window.appVersion = '1.0.0';
  true; // Required on Android
`;

<WebView
  source={{ html: htmlContent }}
  injectedJavaScript={injectedJS}
/>
```

### 2. Using `postMessage` (Dynamic)
```tsx
const webViewRef = useRef<WebView>(null);

const sendToWebView = (data: any) => {
  webViewRef.current?.postMessage(JSON.stringify(data));
};

// In your component
<WebView
  ref={webViewRef}
  source={{ html: htmlContent }}
/>

// Send message
<Button onPress={() => sendToWebView({ type: 'UPDATE', value: 42 })} />
```

**In HTML:**
```html
<script>
  window.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);
    console.log('Received from RN:', data);
  });
</script>
```

## WebView → React Native

### 1. Using `window.ReactNativeWebView.postMessage`

**In HTML:**
```html
<script>
  function sendToReactNative(data) {
    window.ReactNativeWebView.postMessage(JSON.stringify(data));
  }
  
  // Example usage
  sendToReactNative({ type: 'BUTTON_CLICK', id: 'submit' });
</script>
```

**In React Native:**
```tsx
<WebView
  source={{ html: htmlContent }}
  onMessage={(event) => {
    const data = JSON.parse(event.nativeEvent.data);
    console.log('Received from WebView:', data);
  }}
/>
```

## Complete Example (Works with All Proposals)

### Proposal 1 Implementation:
```tsx
import { WebView } from 'react-native-webview';
import { useRef } from 'react';

export default function App() {
  const webViewRef = useRef<WebView>(null);

  const sendMessage = () => {
    webViewRef.current?.postMessage(JSON.stringify({
      type: 'GREETING',
      message: 'Hello from React Native!'
    }));
  };

  return (
    <View style={styles.container}>
      <Button title="Send to WebView" onPress={sendMessage} />
      <WebView
        ref={webViewRef}
        source={{ uri: 'asset:///assets/index.html' }}
        onMessage={(event) => {
          const data = JSON.parse(event.nativeEvent.data);
          Alert.alert('From WebView', data.message);
        }}
      />
    </View>
  );
}
```

### Proposal 2 Implementation:
```tsx
const htmlContent = `
  <html>
  <body>
    <button onclick="sendMessage()">Send to React Native</button>
    <div id="messages"></div>
    <script>
      function sendMessage() {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'BUTTON_CLICK',
          message: 'Hello from WebView!'
        }));
      }
      
      window.addEventListener('message', (event) => {
        const data = JSON.parse(event.data);
        document.getElementById('messages').innerHTML += 
          '<p>Received: ' + data.message + '</p>';
      });
    </script>
  </body>
  </html>
`;

// Same WebView setup as Proposal 1
```

### Proposal 3 Implementation:
```tsx
// After loading the HTML file with Expo Asset...
<WebView
  ref={webViewRef}
  source={{ uri: htmlUri }}
  onMessage={(event) => {
    const data = JSON.parse(event.nativeEvent.data);
    // Handle message
  }}
/>
// Communication code is identical
```

## Advanced Patterns

### 1. Request-Response Pattern
```tsx
const [messageId, setMessageId] = useState(0);
const pendingCallbacks = useRef(new Map());

const callWebViewFunction = (method: string, params: any) => {
  return new Promise((resolve) => {
    const id = messageId;
    setMessageId(id + 1);
    
    pendingCallbacks.current.set(id, resolve);
    
    webViewRef.current?.postMessage(JSON.stringify({
      id,
      method,
      params
    }));
  });
};

// Handle responses
onMessage={(event) => {
  const data = JSON.parse(event.nativeEvent.data);
  if (data.id && pendingCallbacks.current.has(data.id)) {
    pendingCallbacks.current.get(data.id)(data.result);
    pendingCallbacks.current.delete(data.id);
  }
}}
```

### 2. Event Emitter Pattern
```tsx
class WebViewBridge extends EventEmitter {
  constructor(private webViewRef: RefObject<WebView>) {
    super();
  }
  
  send(type: string, payload: any) {
    this.webViewRef.current?.postMessage(JSON.stringify({ type, payload }));
  }
  
  handleMessage(event: WebViewMessageEvent) {
    const data = JSON.parse(event.nativeEvent.data);
    this.emit(data.type, data.payload);
  }
}

// Usage
const bridge = new WebViewBridge(webViewRef);
bridge.on('user-action', (payload) => {
  console.log('User action:', payload);
});
```

## Important Notes

1. **All proposals use the same communication API** - the loading method doesn't affect messaging
2. **Always stringify data** - WebView message passing only supports strings
3. **Add error handling** - Wrap JSON.parse in try-catch blocks
4. **Consider security** - Validate messages if loading external content
5. **Performance** - Batch messages when possible to reduce bridge overhead

## TypeScript Types
```tsx
interface WebViewMessage {
  type: string;
  payload?: any;
  id?: number;
  error?: string;
}

interface WebViewBridge {
  send(message: WebViewMessage): void;
  on(type: string, handler: (payload: any) => void): void;
  call(method: string, params?: any): Promise<any>;
}
```