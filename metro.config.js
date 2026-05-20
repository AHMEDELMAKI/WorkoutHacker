const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
	watchFolders: [path.resolve(__dirname, 'ESP-connection-main')],
	resolver: {
		// Map the package name to the local src so Metro loads TS/TSX directly
		extraNodeModules: {
			'@workout-hacker/esp-connection': path.resolve(__dirname, 'ESP-connection-main', 'src'),
		},
	},
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
