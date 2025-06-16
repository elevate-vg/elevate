# Android Build Module
# APK building and deployment
# Set timestamp for builds

timestamp := `date +%Y%m%d-%H%M%S`

# Build both preview and development APKs
build: build-preview build-dev

# Prepare for build (shared steps)
prep:
    just ui::build
    just webview::validate

# Build preview APK
build-preview: prep
    eas build --platform android --profile preview --local --output ./builds/elevate-preview-{{ timestamp }}.apk

# Build development APK
build-dev: prep
    eas build --platform android --profile development --local --output ./builds/elevate-development-{{ timestamp }}.apk
