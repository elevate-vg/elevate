/**
 * Centralized path configuration for WebView content
 * This file is used by Node.js scripts (CommonJS)
 */

const path = require('path');

// Base paths relative to this config file
const PROJECT_ROOT = path.join(__dirname, '..');

const WEBVIEW_PATHS = {
  // Source files
  viteOutputHtml: path.join(PROJECT_ROOT, 'src/apps/android/generated/index.html'),
  
  // Generated files
  webviewContentJs: path.join(PROJECT_ROOT, 'src/shared/ui/dist/webview-content.js'),
  webviewContentPlaceholder: path.join(PROJECT_ROOT, 'src/shared/ui/dist-placeholder/webview-content.js'),
  
  // Directories
  distDir: path.join(PROJECT_ROOT, 'src/shared/ui/dist'),
  placeholderDir: path.join(PROJECT_ROOT, 'src/shared/ui/dist-placeholder'),
  generatedDir: path.join(PROJECT_ROOT, 'src/apps/android/generated'),
};

// Validation configuration
const VALIDATION_CONFIG = {
  minimumFileSize: 1000, // 1KB minimum
  requiredHtmlPattern: '<!doctype html>',
};

module.exports = {
  WEBVIEW_PATHS,
  VALIDATION_CONFIG
};