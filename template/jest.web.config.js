const config = {
    verbose: true,
    rootDir: "./src",
    preset: "react-native",
    testMatch: [ "**/?(*.)+(web.)+(spec|test).[jt]s?(x)" ],
    setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect'],
    displayName: {
        name: 'WEB-TESTS',
        color: 'purple',
    },
    globals: {
        "__DEV__": true,
    },
    moduleFileExtensions: [
        "ts",
        "tsx",
        "js",
        "jsx",
        "json",
        "node"
    ]
};
  
module.exports = config;