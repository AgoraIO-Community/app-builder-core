const config = {
    verbose: true,
    // rootDir: "./",
    preset: "react-native",
    testMatch: [ "**/?(*.)+(native.)+(spec|test).[jt]s?(x)" ],
    setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
    displayName: {
        name: 'NATIVE-TESTS',
        color: 'blue',
    },
    setupFiles: ["./jest-setup.js"],
    transform: {
        "\\.js$": "<rootDir>/node_modules/babel-jest"
    },
    transformIgnorePatterns: [
        "node_modules/(?!react-router-native|(?!deck.gl)|ng-dynamic)"
    ],
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
  