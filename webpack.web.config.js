const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const commons = require('./webpack.commons');
const {merge} = require('webpack-merge');
const path = require('path');

const isDevelopment = process.env.NODE_ENV === 'development';

module.exports = merge(commons, {
  mode: isDevelopment ? 'development' : 'production',
  devtool: isDevelopment ? 'eval-source-map' : undefined,
  entry: {
    main: './index.web.js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'web/index.html',
    }),
    isDevelopment && new ReactRefreshWebpackPlugin(),
  ].filter(Boolean),
  resolve: {
    extensions: ['web.tsx', 'web.ts', '.tsx', '.ts', '.jsx', '.js'],
    alias: {
      'react-native$': 'react-native-web',
      'agora-react-native-rtm': path.join(__dirname, 'bridge/rtm/web'),
      'react-native-agora': path.join(__dirname, 'bridge/rtc/web'),
    },
  },
  devServer: {
    port: 9000,
    historyApiFallback: true,
    contentBase: './',
  },
});
