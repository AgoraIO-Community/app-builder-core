// const HtmlWebpackPlugin = require('html-webpack-plugin');
// const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const isDevelopment = process.env.NODE_ENV === 'development';
const path = require('path');
module.exports = {
  // Main entry point for the web application
  entry: {
    main: path.resolve(__dirname, 'electron/main/index.js'),
  },
  watch: isDevelopment,
  target: 'electron-main',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, '.electron'),
  },
};
