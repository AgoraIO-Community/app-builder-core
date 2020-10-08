const {notarize} = require('electron-notarize');
const {projectName, appleId} = require('./config.json');

exports.default = async function notarizing(context) {
  const {electronPlatformName, appOutDir} = context;
  if (electronPlatformName !== 'darwin') {
    return;
  }

  const appName = context.packager.appInfo.productFilename;

  return await notarize({
    appBundleId: `com.${projectName.toLowerCase()}`,
    appPath: `${appOutDir}/${appName}.app`,
    appleId,
    appleIdPassword: '@keychain:AC_PASSWORD',
  });
};
