const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
    mode: 'development',
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
                        presets: ['@babel/preset-env',
                            '@babel/preset-react',
                            ['@babel/preset-typescript', {
                                'allExtensions': true,
                                'isTSX': true
                            }]
                        ],
                    }
                }
            }
        ],
    },
    plugins: [new HtmlWebpackPlugin({
        template: 'web/index.html',
    })],
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx"],
        alias: {
            'react-native$': 'react-native-web',
        }
    },
    devServer: {
        port: 9000
    }
}