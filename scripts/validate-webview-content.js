#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { WEBVIEW_PATHS, VALIDATION_CONFIG } = require('../config/webview-paths');

// Paths to check
const REQUIRED_FILES = [
  {
    path: WEBVIEW_PATHS.viteOutputHtml,
    description: 'Vite build output (HTML file)'
  },
  {
    path: WEBVIEW_PATHS.webviewContentJs,
    description: 'WebView content module (CommonJS)'
  },
  {
    path: path.join(__dirname, '../src/apps/android/assets/webview-content.html'),
    description: 'WebView content asset (Metro)'
  }
];

function validateWebViewContent() {
  console.log('🔍 Validating WebView content...\n');
  
  let hasErrors = false;
  
  for (const file of REQUIRED_FILES) {
    process.stdout.write(`Checking ${file.description}... `);
    
    if (!fs.existsSync(file.path)) {
      console.error('❌ MISSING');
      console.error(`  File not found: ${file.path}`);
      console.error('  Please run: npm run ui::build\n');
      hasErrors = true;
      continue;
    }
    
    const stats = fs.statSync(file.path);
    if (stats.size < VALIDATION_CONFIG.minimumFileSize) {
      console.error(`❌ TOO SMALL (${stats.size} bytes)`);
      console.error(`  File appears to be empty or corrupted`);
      console.error('  Please rebuild: npm run ui::build\n');
      hasErrors = true;
      continue;
    }
    
    console.log(`✅ OK (${Math.round(stats.size / 1024)}KB)`);
  }
  
  // Additional validation: Check if webview-content.js contains actual HTML
  const webviewContentPath = WEBVIEW_PATHS.webviewContentJs;
  if (fs.existsSync(webviewContentPath)) {
    try {
      const content = require(webviewContentPath);
      if (!content || typeof content !== 'string' || !content.includes(VALIDATION_CONFIG.requiredHtmlPattern)) {
        console.error('\n❌ WebView content validation failed:');
        console.error('  The webview-content.js file exists but does not contain valid HTML');
        console.error('  Please rebuild: npm run ui::build');
        hasErrors = true;
      }
    } catch (error) {
      console.error('\n❌ Failed to load webview-content.js:');
      console.error(`  ${error.message}`);
      hasErrors = true;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  
  if (hasErrors) {
    console.error('\n❌ Validation FAILED');
    console.error('Build cannot proceed without valid WebView content.\n');
    process.exit(1);
  } else {
    console.log('\n✅ Validation PASSED');
    console.log('WebView content is ready for packaging.\n');
  }
}

// Run validation
validateWebViewContent();