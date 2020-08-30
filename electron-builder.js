module.exports = {
  appId: 'io.agora.saas',
  directories: {
    output: './out',
  },
  linux: {
    target: ['AppImage'],
  },
  mac: {
    target: ['dmg'],
  },
};
