const commons = require('./webpack.commons');
const electronCommons = require('./webpack.electron.commons');
const {merge} = require('webpack-merge');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const isDevelopment = process.env.NODE_ENV === 'development';
const path = require('path');

module.exports = merge(commons, electronCommons, {
  plugins: [
    isDevelopment &&
      new ReactRefreshWebpackPlugin({
        overlay: {
          sockIntegration: 'whm',
        },
      }),
  ].filter(Boolean),
  resolve: {
    extensions: ['.electron.tsx', '.tsx', '.electron.ts', '.ts', '.jsx', '.js'],
    alias: {
      'react-native$': 'react-native-web',
      'agora-react-native-rtm': path.join(__dirname, 'bridge/rtm/web'),
      'react-native-agora': path.join(__dirname, 'bridge/rtc/web'),
    },
  },
});
