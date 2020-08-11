const electronCommons = require('./webpack.electron.commons');
const {merge} = require('webpack-merge');
const path = require('path');

module.exports = merge(electronCommons, {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: path.join(__dirname, 'electron/main.js'),
});
