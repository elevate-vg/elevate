const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

// Watch the entire project from root
config.watchFolders = [projectRoot];

// Add support for .mjs files
config.resolver.sourceExts.push("mjs");

// Add support for .html files as assets
config.resolver.assetExts.push("html");

module.exports = config;
