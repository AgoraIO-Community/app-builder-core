const {projectName} = require('./config.json');
module.exports = {
  appId: `com.${projectName.toLowerCase()}`,
  productName: projectName,
  directories: {
    output: './out',
    app: './.electron',
  },
  linux: {
    target: ['AppImage'],
  },
  mac: {
    target: ['dmg'],
  },
  win: {
    target: [
      {
        target: 'nsis',
        arch: ['ia32'],
      },
    ],
  },
};
