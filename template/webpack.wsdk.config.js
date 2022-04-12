const commons = require('./webpack.commons');
const {merge} = require('webpack-merge');
const path = require('path');
const configVars = require('./configTransform');

const isDevelopment = process.env.NODE_ENV === 'development';

module.exports = merge(commons, {
  // Enable optimizations in production
  mode: isDevelopment ? 'development' : 'production',
  // Main entry point for the web application
  entry: {
    main: './index.wsdk.js',
  },
  output: {
    path: path.resolve(
      __dirname,
      `../Builds/web-sdk`,
    ),
    filename: 'app-builder-web-sdk.js',
    library: 'AgoraAppBuilder',
    libraryTarget: 'var',
  },
  // Webpack dev server config
  devServer: {
    port: 9000,
    historyApiFallback: true, // Support for react-router
    contentBase: './',
  },
});
