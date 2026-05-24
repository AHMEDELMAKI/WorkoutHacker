const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(__dirname, '..');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  watchFolders: [path.resolve(__dirname, '../core')],
  resolver: {
    nodeModulesPaths: [
      path.resolve(projectRoot, 'node_modules'),
      path.resolve(workspaceRoot, 'node_modules'),
      path.resolve(workspaceRoot, 'core/node_modules'),
    ],
  },
  reporter: {
    update(event) {
      if (event.type === 'client_log') {
        process.stdout.write(`[metro-client-log] level=${event.level} data=${JSON.stringify(event.data)}\n`);
        return;
      }

      if (event.type === 'bundling_error') {
        const message = event.error instanceof Error ? event.error.stack || event.error.message : String(event.error);
        process.stderr.write(`[metro-bundling-error] ${message}\n`);
        return;
      }

      if (event.type === 'error') {
        const message = event.error instanceof Error ? event.error.stack || event.error.message : String(event.error);
        process.stderr.write(`[metro-error] ${message}\n`);
      }
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
