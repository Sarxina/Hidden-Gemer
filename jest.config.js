module.exports = {
    moduleNameMapper: {
      '^axios$': '<rootDir>/src/__mocks__/axios.js'
    },
    transform: {
      '^.+\\.jsx?$': 'babel-jest'  // This handles both JS and JSX files
    },
    testEnvironment: 'node',
    testMatch: [
      '**/src/tests/**/*.test.js'
    ],
    transformIgnorePatterns: [
      '<rootDir>/node_modules/'
    ]
  };
