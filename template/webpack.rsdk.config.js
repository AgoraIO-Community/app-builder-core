const commons = require('./webpack.commons');
const {merge} = require('webpack-merge');

const isDevelopment = process.env.NODE_ENV === 'development';

module.exports = merge(commons, {
  // Enable optimizations in production
  mode: 'development',
  // Main entry point for the web application
  entry: {
    main: './index.rsdk.js',
  },
  output: {
    filename: 'app-builder-react-sdk.js',
    library: 'AgoraAppBuilder',
    libraryTarget: 'var'
  },
});
