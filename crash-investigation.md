# App Crash Investigation Report

## Problem
The Expo app crashes on launch after staging certain changes, despite the last commit producing a working preview APK build.

## Root Cause Analysis

### Issue Identified
The crash is caused by the `assets/web` directory being added to `.gitignore` in the staged changes. This prevents the WebView content from being properly loaded by the app.

### Technical Details

1. **Asset Loading Mechanism**: The app loads WebView content using:
   ```typescript
   // src/services/webview-manager.ts:6
   const asset = Asset.fromModule(require('../../assets/web/index.html'));
   ```

2. **Build Process**: 
   - Source files are in `webview-src/`
   - Vite builds from `webview-src/` to `assets/web/` using `vite-plugin-singlefile`
   - The built `assets/web/index.html` contains inlined JavaScript and CSS

3. **The Problem**: Adding `assets/web` to `.gitignore` means:
   - The built HTML file may not be available at runtime
   - Expo's Asset.fromModule() fails to locate the required file
   - App crashes during WebView initialization

### Staged Changes Analysis

The problematic changes in `.gitignore`:
```diff
 *.tsbuildinfo
 .direnv
 *.apk
+assets/web
```

### Immediate Fix Applied
Removed `assets/web` from `.gitignore` to restore functionality.

## Alternative Solutions (If Not Committing Built Assets)

If you prefer not to commit the built `assets/web/index.html` file, consider these approaches:

### Option 1A: Runtime Generation
- Modify `webview-manager.ts` to build HTML content at runtime
- Read from `webview-src/` and process with a lightweight bundler
- Generate the HTML string dynamically

### Option 1B: Pre-build Hook
- Add Vite build step to Expo's prebuild process
- Configure `app.config.js` to run `npm run ui::build` before bundling
- Keep `assets/web` in `.gitignore` but ensure it's built before app compilation

### Option 1C: String Bundling
- Convert built HTML to a TypeScript string constant
- Import the HTML content as a module
- Use WebView's `source={{ html: htmlString }}` instead of `source={{ uri: htmlUri }}`

### Recommended Approach
**Option 1C (String Bundling)** is recommended because:
- No runtime build overhead
- Reliable asset loading
- Clean separation of source and built assets
- Compatible with Expo's bundling process

## Build Process Overview

Current workflow:
```
webview-src/index.html + webview-src/main.js 
    ↓ (vite build)
assets/web/index.html (single file with inlined JS/CSS)
    ↓ (expo bundle)
App bundle with WebView content
```

## Files Involved

- **App.tsx**: Main app component that loads WebView
- **src/services/webview-manager.ts**: Asset loading logic
- **vite.config.js**: Build configuration for WebView content
- **webview-src/**: Source files for WebView content
- **assets/web/**: Built WebView content (currently required at runtime)
- **.gitignore**: Controls which files are tracked in git

## Resolution Status
✅ **Immediate fix applied**: Removed `assets/web` from `.gitignore`
⏳ **Pending decision**: Choose long-term approach for asset management