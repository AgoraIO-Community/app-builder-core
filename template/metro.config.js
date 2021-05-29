/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

const blacklist = require('metro-config/src/defaults/blacklist');

// blacklist is a function that takes an array of regexes and combines
// them with the default blacklist to return a single regex.

module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
  resolver: {
    blacklistRE: blacklist([/\.electron\/.*/]),
  },
};
