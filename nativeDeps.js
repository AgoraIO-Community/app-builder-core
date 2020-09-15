module.exports.default = [
  process.env.TARGET !== 'linux' ? 'agora-electron-sdk' : false,
].filter(Boolean);
