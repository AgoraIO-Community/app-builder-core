const HtmlWebpackPlugin = require('html-webpack-plugin');
const commons = require('./webpack.commons');
const {merge} = require('webpack-merge');

const isDevelopment = process.env.NODE_ENV === 'development';

module.exports = merge(commons, {
  // Enable optimizations in production
  mode: isDevelopment ? 'development' : 'production',
  // Main entry point for the web application
  entry: {
    main: './index.web.js',
  },
  plugins: [
    // Using html webpack plugin to utilize our index.html
    new HtmlWebpackPlugin({
      template: 'web/index.html',
    }),
  ],
  // Webpack dev server config
  devServer: {
    port: 9002,
    historyApiFallback: true, // Support for react-router
    contentBase: './',
  },
});
