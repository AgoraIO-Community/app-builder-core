// This file is read only by electron-forge for desktop platforms. Doesn't apply to Mobile, Web targets
let {name} = require('./app.json');

module.exports = {
  packagerConfig: {},
  // Webpack configs and entry points read by electron-forge for building electron apps
  plugins: [
    [
      '@electron-forge/plugin-webpack',
      {
        mainConfig: './webpack.main.config.js',
        renderer: {
          config: './webpack.renderer.config.js',
          entryPoints: [
            {
              html: './web/index.html',
              js: './index.web.js',
              name: 'main_window',
            },
          ],
        },
      },
    ],
  ],
  // Build tools to produce platform-specific bundles
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name,
      },
    },
  ],
};
