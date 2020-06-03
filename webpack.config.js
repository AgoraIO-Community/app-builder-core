const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

const isDevelopment = true;
const path = require('path');

module.exports = {
    mode: isDevelopment ? 'development' : 'production',
    devtool: 'eval-source-map',
    entry:{
        main: './index.web.js'
    },
    module: {
        rules: [
            {
                test: /\.[jt]sx?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: true,
                        presets: [
                            '@babel/preset-react',
                            ['@babel/preset-typescript', {
                                'allExtensions': true,
                                'isTSX': true
                            }],
                            '@babel/preset-env'
                            
                        ],
                        plugins: [
                            "@babel/plugin-proposal-class-properties",
                            isDevelopment &&
                            require.resolve('react-refresh/babel')
                        ].filter(Boolean),
                    }
                }
            }
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'web/index.html',
        }),
        isDevelopment && new ReactRefreshWebpackPlugin(),
    ].filter(Boolean),
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx"],
        alias: {
            'react-native$': 'react-native-web',
            'react-native-agora': path.join(__dirname,'bridge/web')
        }
    },
    devServer: {
        port: 9000
    }
}
