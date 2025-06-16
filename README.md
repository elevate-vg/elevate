# 🚀 Elevate

> A game launcher for android

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](https://www.typescriptlang.org/)
[![Expo](https://img.shields.io/badge/Expo-000020?logo=expo&logoColor=white)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React_Native-20232A?logo=react&logoColor=61DAFB)](https://reactnative.dev/)

## 🛠️ Prerequisites

### System Requirements

- **Nix Package Manager** - For reproducible development environment
- **Android SDK 34** - With NDK support
- **Bun** - Package manager (not npm/node)

### Nix Configuration

This project uses a Nix flake for consistent development environments:

```bash
# Enter development shell
nix develop
```

The flake provides:
- Android SDK 34 with build tools
- NDK for native development
- All required development dependencies

## 📥 Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd elevate-expo
   ```

2. **Enter Nix development environment:**
   ```bash
   nix develop
   ```

3. **Install dependencies:**
   ```bash
   bun install
   ```

4. **Setup Android environment:**
   ```bash
   # Configure local Android properties if needed
   # android/local.properties should be automatically configured by Nix
   ```

## 🚀 Usage

### Development Workflow

Start the complete development environment:

```bash
# Starts Expo dev server, WebView watcher, and UI build watcher
bun run dev
```

This command runs three processes concurrently:
- **Expo Server** - React Native development server
- **UI Watcher** - Vite build watcher for WebView content
- **WebView String Watcher** - Monitors and rebuilds WebView content strings

### Individual Commands

```bash
# Start Expo development server only
bun run android::serve

# Build UI components with watcher
bun run ui::watch

# Serve UI development server
bun run ui::serve

# Build WebView content string
bun run webview::string

# Validate WebView content
bun run validate::webview
```

### Building APKs

```bash
# Build both preview and development APKs
bun run android::build

# Build preview APK only
bun run android::build::preview

# Build development APK only
bun run android::build::development
```

Built APKs are saved to the `builds/` directory with timestamps.

### Testing

```bash
# Run tests once
bun run test

# Run tests in watch mode
bun run test:watch
```

## 🏗️ Architecture

### Core Components

- **React Native App** (`src/apps/android/`) - Main mobile application
- **WebView Content** (`src/shared/ui/`) - React-based web interface
- **ROM Scanner** (`src/shared/scanner/`) - File system scanning with Effect.js
- **TRPC Server** (`src/shared/server/`) - Type-safe API communication
- **Message Bridge** - Bidirectional communication layer

### Key Technologies

- **Expo 53** - React Native framework with managed workflow
- **React 19** - Latest React with concurrent features
- **Effect.js** - Functional programming library with tree-shaking
- **TRPC** - End-to-end type safety for API calls
- **Vite** - Fast build tool for WebView content
- **Vitest** - Modern testing framework

### Effect.js Guidelines

For optimal bundle size, always use named imports:

```typescript
// ✅ Good - Tree-shaking friendly
import { tryPromise, gen, fail } from 'effect/Effect';
import { runPromise, runPromiseExit } from 'effect/Effect';

// ❌ Bad - Imports entire module
import * as Effect from 'effect/Effect';
```

## 🧪 Testing Strategy

- **Unit Tests** - Vitest with mocked Expo modules
- **Integration Tests** - React Native components for device testing
- **TDD Approach** - Write tests first, implement to make them pass
- **Error Scenarios** - Comprehensive coverage of failure cases

## 📁 Project Structure

```
src/
├── apps/
│   ├── android/           # Main React Native app
│   └── web-experiment/    # Web UI experiments
├── shared/
│   ├── scanner/           # ROM scanning logic
│   ├── server/            # TRPC API server
│   └── ui/                # WebView React components
└── __mocks__/             # Test mocks
```

## 🔧 Development Environment

### Nix Flake Benefits

- **Reproducible Builds** - Consistent environment across machines
- **Android SDK Management** - Automatic SDK and NDK setup
- **Dependency Isolation** - No global package conflicts
- **Team Consistency** - Same versions for all developers

### Editor Integration

Recommended for Neovim users:
- Use `nvr` for integration
- Open `:Neotree git_status` before making changes

## 🤝 Contributing

1. Follow existing code conventions and patterns
2. Use named imports from Effect.js for tree-shaking
3. Write tests first (TDD approach)
4. Ensure all tests pass before committing
5. Use bun (never npm or node) for package management

## 📜 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

Built with modern React Native tooling and functional programming principles for optimal performance and developer experience.
