// No additional config is required for electron renderer process
// So just re-exporting the commons
// This file is bootstrapped from electron-webpack.json

const commons = require('./webpack.commons');
module.exports = commons;
