/*
********************************************
 Copyright © 2021 Agora Lab, Inc., all rights reserved.
 AppBuilder and all associated components, source code, APIs, services, and documentation 
 (the “Materials”) are owned by Agora Lab, Inc. and its licensors. The Materials may not be 
 accessed, used, modified, or distributed for any purpose without a license from Agora Lab, Inc.  
 Use without a license or in violation of any license terms and conditions (including use for 
 any purpose competitive to Agora Lab, Inc.’s business) is strictly prohibited. For more 
 information visit https://appbuilder.agora.io. 
*********************************************
*/
const {series, parallel} = require('gulp');
const {spawn} = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const del = require('del');
const config = require('./config.json')

const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const webpackConfig = require('./webpack.renderer.config');

const BUILD_PATH =
  process.env.TARGET === 'wsdk'
    ? path.join(__dirname, '../Builds/web-sdk')
    : process.env.TARGET === 'rsdk'
    ? path.join(__dirname, '../Builds/react-sdk')
    : process.env.TARGET === 'android'
    ? path.join(__dirname, '../Builds/android')
    : path.join(__dirname, '../Builds/.electron');

const runCli = (cmd, cb) => {
  const [arg1, ...arg2] = cmd.split(' ');
  const proc = spawn(arg1, arg2, {
    stdio: 'inherit',
    shell: true,
  });
  proc.on('exit', cb);
};

const general = {
  clean: () => {
    return del([`${BUILD_PATH}/**/*`], {force: true});
  },
  packageJson: async (cb) => {
    let package = JSON.parse(
      await fs.readFile(path.join(__dirname, 'package.json')),
    );
    let {
      name,
      version,
      private,
      author,
      description,
      dependencies,
      optionalDependencies,
    } = package;
    let nativeDeps = require('./nativeDeps').default;
    let natives = {};
    let searchDeps = {
      ...dependencies,
      ...optionalDependencies,
    };
    nativeDeps.map((k) => {
      natives[k] = searchDeps[k];
    });

    let newPackage = {
      name,
      version,
      private,
      author,
      description,
      // dependencies: natives,
      // agora_electron: {
      //   electron_version: '5.0.8',
      //   prebuilt: true,
      // },
    };
    if (process.env.TARGET === 'rsdk') {
      newPackage.main = 'app-builder-react-sdk.js';
    }
    if (process.env.TARGET === 'wsdk') {
      newPackage.main = 'app-builder-web-sdk.umd2.js';
    }
    await fs.writeFile(
      path.join(BUILD_PATH, 'package.json'),
      JSON.stringify(newPackage, null, 2),
    );
    return;
  },
  createBuildDirectory: () => {
    return fs.mkdir(BUILD_PATH, {recursive: true});
  },
};

const electron = {
  webpack_renderer: (cb) => {
    runCli('webpack --config webpack.renderer.config.js', cb);
  },

  webpack_main: (cb) => {
    runCli('webpack --config ./webpack.main.config.js', cb);
  },

  build: (cb) => {
    runCli('electron-builder build --config ./electron-builder.js', cb);
  },

  devServer: (cb) => {
    const config = webpack(webpackConfig);
    new WebpackDevServer(config, {
      hot: true,
    }).listen(webpackConfig.devServer.port, 'localhost', (err) => {
      if (err) {
        console.error(err);
      } else {
        cb();
      }
    });
  },

  start: (cb) => {
    runCli('electron .', cb);
  },
};

const reactSdk = {
  webpack: (cb) => {
    runCli('webpack --config ./webpack.rsdk.config.js', cb);
  },
};

const webSdk = {
  webpack: (cb) => {
    runCli('webpack --config ./webpack.wsdk.config.js', cb);
  },
};

const android = {
  gradleBuildUnix: (cb) => {
    runCli('cd android && ./gradlew assembleRelease', cb);
  },
  gradleBuildWin: (cb) => {
    runCli('cd android && gradlew.bat assembleRelease', cb);
  },
  copyBuild: (cb) => {
    fs.copyFile(
      path.resolve(
        'android',
        'app',
        'build',
        'outputs',
        'apk',
        'release',
        'app-release.apk',
      ),
      path.resolve(BUILD_PATH, `${config.PRODUCT_ID}.apk`),
    )
      .then(() => {
        cb();
      })
      .catch((err) => {
        cb(new Error('Error in copying build',err))
      });
  },
};

// electron
module.exports.electron_build = series(
  general.clean,
  general.createBuildDirectory,
  parallel(
    electron.webpack_renderer,
    electron.webpack_main,
    general.packageJson,
  ),
  electron.build,
);

module.exports.electron_development = series(
  general.clean,
  general.createBuildDirectory,
  electron.devServer,
  electron.webpack_main,
  electron.start,
);

// react-sdk
module.exports.reactSdk = series(
  general.clean,
  general.createBuildDirectory,
  general.packageJson,
  reactSdk.webpack,
);

// web-sdk
module.exports.webSdk = series(
  general.clean,
  general.createBuildDirectory,
  general.packageJson,
  webSdk.webpack,
);

module.exports.androidUnix = series(
  general.clean,
  general.createBuildDirectory,
  // android.gradleBuildUnix,
  android.copyBuild,
);

module.exports.androidWin = series(
  general.clean,
  general.createBuildDirectory,
  android.gradleBuildWin,
  android.copyBuild,
);
