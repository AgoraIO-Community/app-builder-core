const commons = require('./webpack.commons');
const path = require('path');
const {merge} = require('webpack-merge');

const isDevelopment = process.env.NODE_ENV === 'development';

module.exports = merge(commons, {
  // Enable optimizations in production
  mode: isDevelopment ? 'development' : 'production',
  // externals: [
  //   nodeExternals({allowlist: [/agora.*/, /fpe.*/]}),
  // ],
  externals: {
    react: 'react',
    'react-dom': 'react-dom',
    'react-router': 'react-router',
    'react-router-dom': 'react-router-dom',
    '@apollo/client': '@apollo/client',
  },
  // Main entry point for the web application
  entry: {
    main: './index.rsdk.tsx',
  },
  target: 'node',
  output: {
    path: path.resolve(__dirname, `../Builds/react-sdk`),
    filename: 'index.js',
    library:{
      type: 'commonjs2',
    } 
  },
  // watch: isDevelopment
});
