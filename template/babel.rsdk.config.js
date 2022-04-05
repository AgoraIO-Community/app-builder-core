const configVars = require('./configTransform');
const getFpePath = require('./fpe.config');

module.exports = {
  presets: [
    '@babel/preset-react', // transforms tsx into normal ts
    [
      '@babel/preset-typescript', // transforms ts into js
      {
        allExtensions: true,
        isTSX: true,
      },
    ],
    [
      '@babel/preset-env', // smartly transforms js into es5-es6
      {
        targets: {
          node: 'current',
        },
      },
    ].filter(Boolean),
  ],
  plugins: [
    // Adds support for class properties
    ['transform-define', configVars],
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-class-properties',
    [
      require.resolve('babel-plugin-module-resolver'),
      {
        root: ["./"],
        alias: {
          "fpe-api/install": "./fpe-api/install.ts",
          "fpe-api": "./fpe-api/index.ts",
          "fpe-implementation": "./fpe-implementation/index.ts",
          "test-fpe": getFpePath()
        }
      }
    ]
  ].filter(Boolean),
};
