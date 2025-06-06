# Vite React App in WebView - Best Approach

## Recommended: Modified Proposal 3 with Local Web Server

For a full Vite app with multiple assets (JS chunks, CSS, images), you need a local web server because:

1. **Vite outputs multiple files** - index.html, JS chunks, CSS files, assets
2. **Module imports need proper URLs** - `<script type="module">` requires http(s):// or file://
3. **Asset paths must resolve correctly** - Images, fonts, lazy-loaded chunks

## Implementation Strategy

### Option A: Local Static Server (Recommended)
```tsx
import { WebView } from 'react-native-webview';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import StaticServer from 'react-native-static-server';

export default function App() {
  const [serverUrl, setServerUrl] = useState<string | null>(null);

  useEffect(() => {
    async function setupServer() {
      // 1. Copy Vite build output to accessible location
      const distPath = `${FileSystem.documentDirectory}dist/`;
      
      // Copy all assets from your Vite build
      await FileSystem.makeDirectoryAsync(distPath, { intermediates: true });
      
      // You'll need to copy your entire dist folder here
      // This is typically done during build process
      
      // 2. Start local server
      const server = new StaticServer(8080, distPath);
      const url = await server.start();
      setServerUrl(url);
    }
    
    setupServer();
  }, []);

  return serverUrl ? (
    <WebView
      source={{ uri: serverUrl }}
      originWhitelist={['*']}
      allowFileAccess={true}
      javaScriptEnabled={true}
      domStorageEnabled={true}
    />
  ) : null;
}
```

### Option B: Build-Time Integration (Better)

1. **Modify your Vite config** to output for React Native:
```js
// vite.config.js
export default {
  base: './', // Use relative paths
  build: {
    outDir: '../elevate-expo/assets/webapp',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        // Ensure consistent chunk names
        entryFileNames: 'js/[name].js',
        chunkFileNames: 'js/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  }
}
```

2. **Create a post-build script** to prepare assets:
```js
// scripts/prepare-webapp.js
const fs = require('fs');
const path = require('path');

// Read index.html
let html = fs.readFileSync('./dist/index.html', 'utf8');

// Convert to base64 data URLs for all assets
html = html.replace(/src="\.\/js\//g, 'src="data:text/javascript;base64,');
html = html.replace(/href="\.\/assets\//g, 'href="data:text/css;base64,');

// Or create a manifest of all files
const manifest = {
  'index.html': html,
  'js/main.js': fs.readFileSync('./dist/js/main.js', 'base64'),
  // ... other files
};

fs.writeFileSync('./webapp-bundle.json', JSON.stringify(manifest));
```

3. **Load in React Native**:
```tsx
import webappBundle from './assets/webapp-bundle.json';

const htmlWithAssets = webappBundle['index.html']
  .replace('{{MAIN_JS}}', `data:text/javascript;base64,${webappBundle['js/main.js']}`);

<WebView
  source={{ html: htmlWithAssets }}
  originWhitelist={['*']}
/>
```

## Comparison for Vite Apps

| Approach | Pros | Cons |
|----------|------|------|
| **Proposal 1** | Simple | Won't work - can't resolve multiple assets |
| **Proposal 2** | Works for single file | Impractical for full Vite app |
| **Proposal 3** | Good foundation | Needs modification for multiple files |
| **Local Server** | Handles all assets properly | Additional complexity |
| **Build Integration** | Most reliable | Requires build tooling |

## Recommended Architecture

```
your-project/
├── webapp/               # Vite React app
│   ├── src/
│   ├── dist/            # Build output
│   └── vite.config.js
├── mobile/              # Expo app
│   ├── App.tsx
│   ├── scripts/
│   │   └── bundle-webapp.js
│   └── assets/
│       └── webapp/      # Copied from webapp/dist
└── package.json         # Monorepo root
```

## Best Practices

1. **Use a monorepo** structure to manage both apps
2. **Build Vite app first**, then copy to Expo assets
3. **Consider using a local web server** for development
4. **For production**, bundle all assets into the app
5. **Set proper WebView props** for React apps:
   ```tsx
   <WebView
     source={{ uri: serverUrl }}
     originWhitelist={['*']}
     allowFileAccess={true}
     allowFileAccessFromFileURLs={true}
     allowUniversalAccessFromFileURLs={true}
     javaScriptEnabled={true}
     domStorageEnabled={true}
     startInLoadingState={true}
     mixedContentMode="always"
   />
   ```

## Alternative: React Native Web

Consider if you actually need WebView:
- If sharing code between web and mobile, use **React Native Web**
- Build once, run everywhere with shared components
- No WebView communication overhead

## Conclusion

For a full Vite app: Use **Modified Proposal 3** with either:
1. **Local static server** (development)
2. **Build-time bundling** (production)

This ensures all your Vite assets (chunks, CSS, images) load correctly.