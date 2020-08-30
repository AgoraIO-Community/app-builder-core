// No additional config is required for electron renderer process
// So just re-exporting the commons
// This file is bootstrapped from electron-webpack.json

const { merge } = require('webpack-merge');
const isDevelopment = process.env.NODE_ENV === 'development';
const path = require('path');

const commons = require('./webpack.commons');
module.exports = merge(commons, {
    mode: isDevelopment ? 'development' : 'production',
    entry: {
        main: path.resolve(__dirname, 'electron/renderer/index.js')
    },
    target: 'node',
    node: {
        __dirname: false,
    },
    module: {
        rules: [
            {
                test: /\.node$/,
                loader: 'node-loader',
            },
        ],
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, '.electron'),
    },
    devServer: {
        port: 9002,
        hot: true,
        writeToDisk: true,
    }
});
