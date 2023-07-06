/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  collectCoverage: false,
  testTimeout: 100000,
  openHandlesTimeout:0,
  collectCoverageFrom: ['src/**/*.ts'],
  coverageThreshold: {
    global: {
      lines: 70,
    },
  },

  projects: [
    {
      displayName: 'test-node',
      testEnvironment: 'node',
      preset: 'ts-jest',
      testMatch: ['<rootDir>/tests/**/*.test.ts'],
    },
    {
      displayName: 'test-browser',
      preset: 'ts-jest',
      testMatch: ['<rootDir>/tests/**/*.browser.ts'],
    },
  ],
};
