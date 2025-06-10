# Migration Plan: Converting WebView App to React + TypeScript

## Current State Analysis

The current webview-src app is a vanilla JavaScript application that:
- Uses ES modules and Vite for bundling
- Implements a **highly customized tRPC client** for React Native WebView communication via postMessage
- Has basic UI with vanilla HTML/CSS/JS
- Builds to a single file using vite-plugin-singlefile

**⚠️ CRITICAL**: The tRPC client is heavily customized for the niche use case of React Native WebView communication and must be preserved exactly.

## Migration Steps

### Phase 1: React Setup and Basic Migration

#### 1. Update Package Dependencies
- [ ] Add React and React-DOM to webview-src/package.json
- [ ] Add TypeScript support (@types/react, @types/react-dom, typescript)
- [ ] Add Vite React plugin (@vitejs/plugin-react)
- [ ] Keep existing tRPC dependencies **unchanged**

#### 2. Configure Vite for React + TypeScript
- [ ] Update vite.config.js to include React plugin with TypeScript support
- [ ] Ensure single-file output is maintained
- [ ] Configure TSX/TypeScript transformation
- [ ] Add tsconfig.json for webview-src directory

#### 3. Create React + TypeScript Project Structure
```
webview-src/
├── index.html          # Entry point (minimal, React root)
├── tsconfig.json       # TypeScript configuration
├── src/
│   ├── main.tsx         # React app entry point (TypeScript)
│   ├── App.tsx          # Main app component (TypeScript)
│   ├── hooks/
│   │   └── useTrpc.ts   # Custom tRPC hook (PRESERVE existing logic)
│   ├── utils/
│   │   └── trpc.ts      # tRPC client setup (MIGRATE existing code exactly)
│   ├── types/
│   │   └── trpc.ts      # TypeScript type definitions
│   └── components/
│       ├── StatusDisplay.tsx
│       ├── TestButtons.tsx
│       └── OutputPanel.tsx
└── package.json
```

### Phase 2: Component Migration

#### 4. Convert HTML Structure to React + TypeScript Components
- [ ] Create App.tsx as main component with proper TypeScript interfaces
- [ ] Extract StatusDisplay.tsx component for status messages
- [ ] Extract TestButtons.tsx component for action buttons
- [ ] Extract OutputPanel.tsx component for results display
- [ ] Convert inline styles to CSS modules or styled-components with TypeScript support

#### 5. ⚠️ CAREFULLY Migrate tRPC Logic to React Hooks
**CRITICAL**: The existing tRPC client implementation is highly specialized and must be preserved:

- [ ] **COPY** (don't rewrite) the entire tRPC client logic from main.js to utils/trpc.ts
- [ ] Add TypeScript types WITHOUT changing the core functionality
- [ ] Create useTrpc hook that **wraps** (doesn't replace) the existing tRPC client
- [ ] Convert global functions (testQuery, testMutation) to React component methods **while preserving exact logic**
- [ ] Implement React state management for status, output, and client state
- [ ] Add proper error boundaries with TypeScript error types
- [ ] **TEST thoroughly** that postMessage communication still works exactly as before

#### 6. TypeScript State Management
- [ ] Use React useState with proper TypeScript types for UI state (status, output, loading states)
- [ ] Implement useEffect for tRPC client initialization with TypeScript
- [ ] Add proper cleanup in useEffect return functions
- [ ] Define TypeScript interfaces for all state objects

### Phase 3: TypeScript Enhancement and Optimization

#### 7. Comprehensive TypeScript Integration
- [ ] Add proper TypeScript types for tRPC responses (without modifying the actual client)
- [ ] Type the React Native WebView communication interface
- [ ] Add proper error typing with custom error interfaces
- [ ] Create type definitions for the custom postMessage protocol
- [ ] Ensure strict TypeScript compliance

#### 8. Testing Setup (Optional)
- [ ] Add Vitest for unit testing with TypeScript support
- [ ] Create tests for tRPC communication (test the wrapper, not the core client)
- [ ] Test React components in isolation with proper TypeScript types

#### 9. Performance Optimization
- [ ] Implement React.memo with TypeScript for components that don't need frequent re-renders
- [ ] Optimize re-renders with useCallback and useMemo with proper TypeScript generics
- [ ] Ensure single-file build remains efficient

### Phase 4: Final Integration

#### 10. Update Build Process for TypeScript
- [ ] Verify Vite builds correctly with React + TypeScript
- [ ] Test single-file output works in React Native WebView
- [ ] Update any build scripts in root package.json if needed
- [ ] Ensure TypeScript compilation is included in build process

#### 11. Comprehensive Testing and Validation
- [ ] **CRITICAL**: Test tRPC communication still works exactly as before
- [ ] Verify React Native WebView integration with TypeScript build
- [ ] Test hot reload during development with TypeScript
- [ ] Validate production build with TypeScript compilation
- [ ] Test all existing tRPC queries and mutations
- [ ] Verify postMessage protocol is unchanged

## Key Considerations

### ⚠️ CRITICAL: Preserving Custom tRPC Implementation
- **DO NOT** replace or rewrite the custom tRPC postMessage communication - it's highly specialized
- **DO NOT** use standard tRPC React hooks - they won't work with our WebView setup
- The custom createPostMessageLink() function must be preserved exactly
- All message serialization/deserialization logic must remain unchanged
- Single-file build output is required for React Native WebView
- All existing tRPC queries and mutations must continue working

### React + TypeScript Specific Considerations
- Use functional components with hooks and proper TypeScript typing
- Implement proper cleanup in useEffect for event listeners with TypeScript
- **DO NOT** use React Query/TanStack Query - it would conflict with our custom implementation
- Maintain the existing error handling patterns but adapt to React state with TypeScript types
- Add TypeScript interfaces for all props, state, and function parameters

### Build Considerations
- Vite + React + TypeScript should produce similar single-file output
- Bundle size should remain reasonable for mobile WebView
- Ensure all dependencies are properly bundled including TypeScript compilation
- TypeScript should compile to efficient JavaScript for the WebView

## Dependencies to Add to webview-src/package.json

```json
{
  "dependencies": {
	"react": "19.0.0",
    "react-dom": "19.0.0"
  },
  "devDependencies": {
    "@types/react": "*",
    "@types/react-dom": "*",
    "@vitejs/plugin-react": "^4.0.0",
  }
}
```

## Expected Benefits

1. **Better Development Experience**: Hot reload, component dev tools, TypeScript intellisense
2. **Type Safety**: Full TypeScript support with compile-time error checking
3. **Maintainability**: Component-based architecture with TypeScript interfaces
4. **Extensibility**: Easier to add new features with React + TypeScript ecosystem
5. **Testing**: Better testing capabilities with React Testing Library and TypeScript
6. **State Management**: More predictable state updates with React hooks and TypeScript

## Risk Mitigation

- **CRITICAL**: Keep the existing vanilla JS version as backup until React+TS version is fully tested
- Test thoroughly with React Native WebView before removing old implementation
- **NEVER modify the core tRPC client logic** - only wrap it in React hooks
- Ensure bundle size doesn't significantly increase
- Verify performance is maintained on mobile devices
- Test that TypeScript compilation doesn't break WebView compatibility
- Validate that all postMessage communication still works exactly as before
