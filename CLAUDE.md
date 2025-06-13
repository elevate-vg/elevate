# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Expo React Native application with WebView integration. The app demonstrates bidirectional communication between React Native and a WebView containing a React application.

## Architecture

### Key Features

- **Asset Loading**: HTML files are loaded using Expo's Asset API, copied to a WebView-accessible location
- **Message Passing**: Bidirectional communication between React Native and WebView using `postMessage`/`onMessage`
- **Android Intents**: RetroArch launcher button that sends Android intents with game ROM parameters
- **Android Optimizations**: Hidden navigation/status bars, landscape orientation, edge-to-edge display

### Development Environment

- Uses Nix flake for reproducible Android development environment
- Configured for Android SDK 34 with NDK support
- TypeScript with strict mode enabled

### Effect.js Usage Guidelines

For optimal bundle size and tree-shaking, always use named imports from Effect:

```typescript
// ✅ Good - Tree-shaking friendly
import { tryPromise, gen, fail } from 'effect/Effect';
import { runPromise, runPromiseExit } from 'effect/Effect';
import { isSuccess, isFailure } from 'effect/Exit';
import { failureOption } from 'effect/Cause';

// ❌ Bad - Imports entire module
import * as Effect from 'effect/Effect';
import { Effect } from 'effect';
```

### Testing Strategy

- **Unit Tests**: Vitest with mocked Expo modules
- **Integration Tests**: React Native components for device testing
- **TDD Approach**: Write tests first, implement to make them pass

## Memories

- No barrel exports
- Use named imports from Effect.js for tree-shaking
- File operations use expo-file-system and expo-crypto
- All tests pass with comprehensive error scenario coverage
- Use bun never npm or node