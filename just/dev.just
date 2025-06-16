# Development Module
# Development server and core workflows

# Start all development services (expo, vite, webview watcher)
dev:
    mprocs --names expo,vite,webview "just dev::serve" "just ui::watch" "just webview::string-watch"

# Start Expo development server
serve:
    expo start