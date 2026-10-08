const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  resolver: {
    // CI builds should not depend on a running Watchman service.
    useWatchman: process.env.CI !== 'true',
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
