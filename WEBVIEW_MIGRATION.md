# WebView Content Loading Migration

This document explains the migration from require()-based loading to Metro's asset resolution system.

## Current Implementation (webview-manager.ts)

Uses dynamic require() with fallback chain:
```typescript
// Try require() from multiple paths
const content = require("../../../shared/ui/dist/webview-content.js");
```

**Issues:**
- Metro bundler doesn't optimize dynamic requires well
- Requires placeholder files for build-time resolution
- Complex fallback logic with try-catch chains

## New Implementation (webview-manager-v2.ts)

Uses Metro's asset resolution with Expo Asset API:
```typescript
// Metro bundles this automatically
const webviewHtmlAsset = require('../assets/webview-content.html');
const asset = Asset.fromModule(webviewHtmlAsset);
```

**Benefits:**
- Better bundling optimization by Metro
- Proper asset dependency tracking
- Cleaner code with async/sync variants
- Still maintains require() fallbacks for compatibility

## Migration Strategy

### Phase 1: Hybrid Approach (Current)
- Keep existing webview-manager.ts working
- Introduce webview-manager-v2.ts with Metro assets
- Build script generates both CommonJS and HTML asset
- Both systems available for testing

### Phase 2: Switch to Metro Assets
```typescript
// Replace in App.tsx or wherever webview-manager is used:
import { getWebViewHtml } from './services/webview-manager-v2';

// Use async version:
const htmlContent = await getWebViewHtml();

// Or sync version for immediate needs:
const htmlContent = getWebViewHtmlSync();
```

### Phase 3: Cleanup
- Remove old webview-manager.ts
- Remove CommonJS generation from build script
- Remove dist-placeholder system
- Simplify validation script

## Metro Configuration

Added to metro.config.js:
```javascript
// Add support for .html files as assets
config.resolver.assetExts.push("html");
```

## Build Process

Updated build script generates both formats:
1. **CommonJS**: `dist/webview-content.js` (backward compatibility)
2. **Metro Asset**: `assets/webview-content.html` (new approach)

## Testing

Both systems can be tested in parallel:
- webview-manager.ts: Current require() approach
- webview-manager-v2.ts: New Metro asset approach

Choose the approach that works best for your use case.