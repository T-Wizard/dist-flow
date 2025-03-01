/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  // this will become default in jest 27:
  testRunner: 'jest-circus/runner',

  testRegex: '__tests__/.+\\.(test|spec)\\.(js|jsx)$',

  transform: {
    '^.+\\.jsx?$': 'babel-jest',
    // '^.+\\.html$': '<rootDir>/jest/__mocks__/html-loader.js',
  },

  setupFilesAfterEnv: ['<rootDir>/jest/setup.js'],

  testPathIgnorePatterns: ['charts/histogram/src/__tests__/histogram-export.spec.js'],

  // collectCoverageFrom: [
  //   'web/**/*.{js,jsx}',
  //   '!web/**/*.spec.{js,jsx}',
  // ],

  coverageReporters: ['json', 'lcov', 'text-summary', 'clover'],
};
