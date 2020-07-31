const commons = require('./webpack.commons');
const electronCommons = require('./webpack.electron.commons');
const {merge} = require('webpack-merge');

module.exports = merge(electronCommons, {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: './electron/main.js',
});
