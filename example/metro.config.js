// Lets the example consume the library's TypeScript source directly (../src),
// while resolving react / react-native / react-native-svg from THIS app's
// node_modules only, so there is never a duplicate-React problem.

const { getDefaultConfig } = require('expo/metro-config');
const exclusionList = require('metro-config/src/defaults/exclusionList');
const path = require('path');

const projectRoot = __dirname;
const libRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// Watch the library source so edits hot-reload in the example.
config.watchFolders = [path.resolve(libRoot, 'src')];

// Resolve all packages from the example's own node_modules.
config.resolver.nodeModulesPaths = [path.resolve(projectRoot, 'node_modules')];
config.resolver.disableHierarchicalLookup = true;

// Never resolve anything out of the library's own node_modules (avoids dupes).
config.resolver.blockList = exclusionList([
  new RegExp(`${path.resolve(libRoot, 'node_modules')}/.*`),
]);

module.exports = config;
