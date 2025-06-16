# WebView Module
# WebView content generation and validation

# Generate webview string from built HTML
string:
    node scripts/build-webview-string.js

# Watch for webview changes and regenerate string
string-watch:
    chokidar "src/apps/android/generated/index.html" -c "just webview::string"

# Copy webview content to placeholder (fallback)
string-placeholder:
    cp src/shared/ui/dist/webview-content.js src/shared/ui/dist-placeholder/webview-content.js || echo 'Placeholder copy failed, but continuing...'

# Validate webview content integrity
validate:
    node scripts/validate-webview-content.js