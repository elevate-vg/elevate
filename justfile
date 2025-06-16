# Elevate - Just Recipes
# Modern task runner for React Native / Expo development
# Import all module files

mod dev 'just/dev.just'
mod ui 'just/ui.just'
mod webview 'just/webview.just'
mod android 'just/android.just'
mod test 'just/test.just'

# Default recipe - show available recipes
default:
    @just --list --list-submodules

