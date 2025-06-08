# tRPC PostMessage Pattern Implementation Proposal
## Revised Architecture: Server in React Native

## How the Pattern Works

The `trpc-in-app-comm.tsx` demonstrates a sophisticated approach to replacing simple postMessage communication with type-safe tRPC procedures. Key components:

**Original Pattern Analysis**:
- Creates tRPC router with typed procedures (`hello` query, `greet` mutation)
- Uses `createPostMessageHandler` to listen for `request` type messages
- Responds via `postMessage` with `response` type messages
- Maintains full TypeScript type safety across the communication boundary

**Transport Layer**:
- Messages are categorized by `type` field (`request`/`response`)
- Event listeners filter messages to avoid cross-talk
- Automatic serialization/deserialization of complex data types

## Recommended Architecture: Server in React Native

### Why Server Should Live in React Native

1. **Natural Responsibility Separation**:
   - React Native: Platform operations (file system, intents, native APIs)
   - WebView: UI, user interaction, presentation layer

2. **Better Control Flow**:
   ```typescript
   // Natural: UI requests → Native executes → UI updates
   webView.onGameClick() → RN.launchGame() → webView.updateStatus()
   
   // vs Current: Native asks WebView to orchestrate
   webView.launchGame() → RN.executeIntent() → webView.manageState()
   ```

3. **Superior Testing & Debugging**:
   - React Native server easier to test and mock
   - Better DevTools experience
   - Cleaner error handling in native context

## Implementation Proposal

### Phase 1: Proof of Concept Integration

**Required Dependencies**:
```json
{
  "@trpc/client": "^10.45.0",
  "@trpc/server": "^10.45.0", 
  "@elasticbottle/trpc-post-message": "^1.0.0",
  "zod": "^3.22.0"
}
```

**1. Create tRPC Server in React Native** (`services/trpcServer.ts`):
```typescript
import { initTRPC } from '@trpc/server';
import { createPostMessageHandler } from '@elasticbottle/trpc-post-message/adapter';
import { z } from 'zod';
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import { Platform } from 'react-native';

const t = initTRPC.create();

// Input schemas
const gameConfigSchema = z.object({
  romPath: z.string(),
  core: z.string(),
  console: z.string(),
  configPath: z.string().optional()
});

const fileContentSchema = z.object({
  content: z.string()
});

export const nativeRouter = t.router({
  // Game launching - owned by React Native
  games: t.router({
    launch: t.procedure
      .input(gameConfigSchema)
      .mutation(async ({ input }) => {
        if (Platform.OS !== 'android') {
          throw new Error('RetroArch launcher only available on Android');
        }

        const coreMap: Record<string, string> = {
          'mgba': 'mgba_libretro_android.so',
          'snes9x': 'snes9x_libretro_android.so',
          'genesis_plus_gx': 'genesis_plus_gx_libretro_android.so',
          'nestopia': 'nestopia_libretro_android.so',
          'pcsx_rearmed': 'pcsx_rearmed_libretro_android.so'
        };

        const coreFile = coreMap[input.core] || 'mgba_libretro_android.so';
        const corePath = `/data/data/com.retroarch.aarch64/cores/${coreFile}`;
        const configPath = input.configPath || '/storage/emulated/0/Android/data/com.retroarch.aarch64/files/retroarch.cfg';

        await IntentLauncher.startActivityAsync('android.intent.action.MAIN', {
          packageName: 'com.retroarch.aarch64',
          className: 'com.retroarch.browser.retroactivity.RetroActivityFuture',
          extra: {
            ROM: input.romPath,
            LIBRETRO: corePath,
            CONFIGFILE: configPath,
            QUITFOCUS: ''
          },
          flags: 0x10000000 | 0x4000000 // NEW_TASK | CLEAR_TOP
        });

        return { 
          success: true, 
          gameInfo: input,
          launchTime: new Date().toISOString()
        };
      }),

    openMain: t.procedure
      .mutation(async () => {
        if (Platform.OS !== 'android') {
          throw new Error('RetroArch only available on Android');
        }

        await IntentLauncher.startActivityAsync('android.intent.action.MAIN', {
          packageName: 'com.retroarch.aarch64'
        });

        return { success: true, action: 'main_opened' };
      })
  }),

  // File operations - owned by React Native
  files: t.router({
    writeYaml: t.procedure
      .input(fileContentSchema)
      .mutation(async ({ input }) => {
        const filePath = `${FileSystem.documentDirectory}sample.yaml`;
        
        const yamlData = {
          message: input.content,
          timestamp: new Date().toISOString(),
          platform: Platform.OS,
          app: {
            name: 'elevate-expo',
            version: '1.0.0'
          },
          metadata: {
            writeCount: Math.floor(Math.random() * 100) + 1,
            source: 'trpc-request'
          }
        };

        const YAML = require('js-yaml');
        const yamlString = YAML.dump(yamlData);
        await FileSystem.writeAsStringAsync(filePath, yamlString);
        
        return { 
          success: true, 
          filePath, 
          content: yamlData 
        };
      }),

    readYaml: t.procedure
      .query(async () => {
        const filePath = `${FileSystem.documentDirectory}sample.yaml`;
        const fileInfo = await FileSystem.getInfoAsync(filePath);
        
        if (!fileInfo.exists) {
          throw new Error('YAML file does not exist. Write a file first.');
        }

        const yamlContent = await FileSystem.readAsStringAsync(filePath);
        const YAML = require('js-yaml');
        const parsedYaml = YAML.load(yamlContent) as any;
        
        return { 
          success: true,
          platform: parsedYaml.platform || 'unknown',
          content: parsedYaml,
          readTime: new Date().toISOString()
        };
      })
  }),

  // Platform info
  platform: t.router({
    getInfo: t.procedure
      .query(() => ({
        os: Platform.OS,
        version: Platform.Version,
        timestamp: new Date().toISOString()
      }))
  })
});

export type NativeRouter = typeof nativeRouter;
```

**2. tRPC Server Setup in App.tsx**:
```typescript
import { createPostMessageHandler } from '@elasticbottle/trpc-post-message/adapter';
import { nativeRouter } from './services/trpcServer';

export default function App() {
  const webViewRef = useRef<WebView>(null);
  
  // Initialize tRPC server
  useEffect(() => {
    const handler = createPostMessageHandler({
      router: nativeRouter,
      postMessage: ({ message }) => {
        webViewRef.current?.postMessage(JSON.stringify({
          type: 'trpc-response',
          ...message
        }));
      },
      addEventListener: (listener) => {
        // Register with existing message handler
        const handler = (e: any) => {
          try {
            const data = JSON.parse(e.nativeEvent.data);
            if (data.type === 'trpc-request') {
              listener({ data });
            }
          } catch (error) {
            console.error('tRPC message parsing error:', error);
          }
        };
        return handler;
      }
    });
  }, []);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      // Route tRPC requests to server
      if (data.type === 'trpc-request') {
        // Handled by tRPC server
        return;
      }
      
      // Keep existing legacy handlers for gradual migration
      if (data.type === 'LAUNCH_RETROARCH') {
        launchRetroArchGame(data);
      }
      // ... other existing handlers
    } catch (error) {
      console.error('Message handling error:', error);
    }
  };

  // ... rest of component
}
```

**3. WebView tRPC Client** (`assets/web/trpc-client.js`):
```javascript
// Add to existing index.html as inline script
const client = createTRPCProxyClient({
  links: [postMessageLink({
    postMessage: ({ message }) => {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'trpc-request',
          ...message
        }));
      }
    },
    addEventListener: (listener) => {
      const handler = (event) => {
        try {
          let data = event.data;
          if (typeof data === 'string') {
            data = JSON.parse(data);
          }
          if (data.type === 'trpc-response') {
            listener(event);
          }
        } catch (error) {
          console.error('tRPC response parsing error:', error);
        }
      };
      
      window.addEventListener('message', handler);
      document.addEventListener('message', handler);
      return handler;
    },
    removeEventListener: (listener) => {
      window.removeEventListener('message', listener);
      document.removeEventListener('message', listener);
    }
  })]
});

// Replace existing functions with tRPC calls
async function launchRetroArchWithHardcodedSettings(romPath, core) {
  try {
    updateStatus(`Launching ${core.toUpperCase()} game...`);
    
    const result = await client.games.launch.mutate({
      romPath,
      core,
      console: 'gba' // or derive from core
    });
    
    updateStatus(`✅ Game launched successfully!`);
    return result;
  } catch (error) {
    updateStatus(`❌ Launch failed: ${error.message}`);
    throw error;
  }
}

async function writeFile() {
  try {
    updateStatus('Writing YAML file...');
    
    const result = await client.files.writeYaml.mutate({
      content: `Hello from WebView! Current time: ${new Date().toISOString()}`
    });
    
    updateStatus(`✅ ${result.filePath} written successfully`);
    return result;
  } catch (error) {
    updateStatus(`❌ Write failed: ${error.message}`);
    throw error;
  }
}

async function readFile() {
  try {
    updateStatus('Reading YAML file...');
    
    const result = await client.files.readYaml.query();
    
    updateStatus(`📖 Platform: ${result.platform}`);
    return result;
  } catch (error) {
    updateStatus(`❌ Read failed: ${error.message}`);
    throw error;
  }
}
```

### Phase 2: Gradual Migration Strategy

**Step 1**: Implement tRPC server alongside existing system
- Add tRPC server to React Native with native operations
- Add tRPC client to WebView for UI interactions
- Both systems work in parallel during transition

**Step 2**: Create function adapters in WebView
```javascript
// Gradual replacement - can switch implementations easily
const gameAPI = {
  launch: USE_TRPC ? 
    (config) => client.games.launch.mutate(config) :
    (config) => legacyLaunchRetroArch(config),
    
  openMain: USE_TRPC ?
    () => client.games.openMain.mutate() :
    () => legacyOpenRetroArchMain()
};
```

**Step 3**: Replace WebView functions systematically
- Update game launch functions to use tRPC
- Replace file operations with tRPC procedures
- Add proper TypeScript types and error handling
- Remove legacy postMessage handlers

### Benefits of This Architecture

1. **Natural Ownership**: Native operations live in native layer
2. **Better Testing**: React Native server easier to test and mock
3. **Cleaner Separation**: WebView = UI, React Native = platform operations
4. **Type Safety**: Native operations are fully type-safe
5. **Superior Error Handling**: Native errors handled in proper context
6. **Future Scalability**: Native API can serve multiple WebViews or other clients

### Migration Timeline

- **Week 1**: Add dependencies, create tRPC server in React Native for file operations
- **Week 2**: Test integration, add game launch procedures to tRPC server
- **Week 3**: Update WebView to use tRPC client, maintain legacy fallbacks
- **Week 4**: Remove legacy postMessage handlers, full tRPC implementation

## Current System Analysis

### Existing Message Types (to be replaced):
- `LAUNCH_RETROARCH` → `client.games.launch.mutate()`
- `OPEN_RETROARCH_MAIN` → `client.games.openMain.mutate()`
- `WRITE_FILE` → `client.files.writeYaml.mutate()`
- `READ_FILE` → `client.files.readYaml.query()`
- `RETROARCH_ACTION` → `client.games.action.mutate()`

### Integration Benefits:
1. **Type-safe game configurations** with Zod validation
2. **Proper error handling** with tRPC error types
3. **Better developer experience** with autocomplete and refactoring
4. **Maintainable architecture** with clear responsibility separation
5. **Future-proof design** for additional native integrations

This approach creates a more maintainable and testable architecture where React Native owns platform operations and WebView focuses on presentation, leading to better separation of concerns and easier debugging.
