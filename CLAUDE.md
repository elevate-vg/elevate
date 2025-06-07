# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Expo React Native application with WebView integration. The app demonstrates bidirectional communication between React Native and a WebView containing a React application.

## Development Commands

```bash
# Start Expo development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run in web browser
npm run web

# Enter Nix development shell (for Android development)
nix develop
```

## Architecture

### Core Components

1. **React Native App** (`App.tsx`): Main application that hosts a WebView
   - Uses `expo-navigation-bar` to hide Android navigation
   - Implements `expo-keep-awake` for Expo Go development
   - Loads HTML from assets using `expo-asset` and `expo-file-system`
   - Handles bidirectional messaging with WebView

2. **WebView Content** (`assets/web/`):
   - `index.html`: Loads React via CDN with Babel transpilation
   - `index.js`: React app with TanStack Query integration
   - Implements message passing with React Native host

### Key Features

- **Asset Loading**: HTML files are loaded using Expo's Asset API, copied to a WebView-accessible location
- **Message Passing**: Bidirectional communication between React Native and WebView using `postMessage`/`onMessage`
- **Android Optimizations**: Hidden navigation/status bars, landscape orientation, edge-to-edge display

### Development Environment

- Uses Nix flake for reproducible Android development environment
- Configured for Android SDK 34 with NDK support
- TypeScript with strict mode enabled

## Important Considerations

- WebView content uses CDN-loaded React (not bundled)
- File URIs require specific WebView props: `allowFileAccess`, `allowFileAccessFromFileURLs`, `allowUniversalAccessFromFileURLs`
- The app is configured for landscape orientation by default
- When modifying WebView content, ensure proper message serialization (JSON.stringify/parse)