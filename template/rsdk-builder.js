const childProcess = require('child_process');
const path = require('path');

const isElectron = ['linux', 'windows', 'mac'].includes(process.env.TARGET);
const isReactSdk = process.env.TARGET === 'rsdk';
const isWebSdk = process.env.TARGET === 'wsdk';

const exec = childProcess.exec;

const env = {
  NODE_ENV: 'production',
  BABEL_ENV: 'modern',
};
const babelConfigPath = path.resolve(__dirname, './babel.rsdk.config.js');
const srcDir = path.resolve('./src');
const extensions = [
      `.${process.env.TARGET}.tsx`,
      `.${process.env.TARGET}.ts`,
      isElectron && '.electron.tsx',
      isElectron && '.electron.ts',
      (isWebSdk || isReactSdk) && '.web.ts',
      (isWebSdk || isReactSdk) && '.web.tsx',
      '.tsx',
      '.ts',
      '.jsx',
      '.js',
      '.node'].filter(Boolean)
const ignore = [
  '**/*.test.js',
  '**/*.test.ts',
  '**/*.test.tsx',
  '**/*.spec.ts',
  '**/*.spec.tsx',
  '**/*.d.ts',
];

const babelArgs = [
  '--config-file',
  babelConfigPath,
  '--extensions',
  `"${extensions.join(',')}"`,
  srcDir,
  '--out-dir',
  './dist/rsdk/',
  '--ignore',
  // Need to put these patterns in quotes otherwise they might be evaluated by the used terminal.
  `"${ignore.join('","')}"`,
];

const command = ['./node_modules/.bin/babel', ...babelArgs].join(' ');
console.log(command)

const com = exec(command, {env: {...process.env, ...env}});
com.on('error',(data)=>{
  console.log(data)
})

com.on('exit',(data, ...rest)=>{
  console.log(data,rest)
})
