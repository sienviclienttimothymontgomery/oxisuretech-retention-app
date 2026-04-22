const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Monorepo support: watch all files within the workspace
config.watchFolders = [workspaceRoot, ...(config.watchFolders || [])];

// Monorepo support: resolve packages from both mobile and workspace node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Block duplicated packages from workspaceRoot to avoid 'Duplicate module' errors during runtime
config.resolver.blockList = [
  new RegExp(
    path.resolve(workspaceRoot, 'node_modules/react-native/.*')
  ),
  new RegExp(
    path.resolve(workspaceRoot, 'node_modules/react/.*')
  ),
];

module.exports = config;
