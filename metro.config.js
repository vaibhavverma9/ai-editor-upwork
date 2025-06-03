// metro.config.js  (root)
const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

const projectRoot   = __dirname;
const workspaceRoot = path.resolve(projectRoot);

const config = getDefaultConfig(projectRoot);

// 🚩  Use extraNodeModules instead of alias
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,   // keep whatever Expo already added
  '@assets':     path.join(workspaceRoot, 'packages/assets'),
  '@ui':         path.join(workspaceRoot, 'packages/ui/src'),
  '@constants':  path.join(workspaceRoot, 'packages/constants'),
  '@components': path.join(workspaceRoot, 'packages/components'),
  '@functions':  path.join(workspaceRoot, 'packages/functions'),
  '@hooks':      path.join(workspaceRoot, 'packages/hooks'),
  '@scripts':    path.join(workspaceRoot, 'packages/scripts'),
  '@styles':     path.join(workspaceRoot, 'packages/styles'),
  '@supabase':   path.join(workspaceRoot, 'packages/supabase'),
};

// 🔁  Watch the shared packages for HMR
config.watchFolders = [
  path.join(workspaceRoot, 'packages'),
];

module.exports = config;
