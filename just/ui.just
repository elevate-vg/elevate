# UI Module
# User interface building and serving

# Watch and rebuild UI on changes
watch:
    vite build --watch

# Build UI for production
build:
    vite build && just webview::string

# Serve UI development server
serve:
    vite dev