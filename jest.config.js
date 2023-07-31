/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  collectCoverage: false,
  testTimeout: 100000,
  openHandlesTimeout: 0,
  detectOpenHandles: false,

  collectCoverageFrom: ['src/**/*.ts'],
  setupFilesAfterEnv: ['jest-extended/all'],
  maxWorkers: 2,
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
      displayName: 'test-functions',
      testEnvironment: 'node',
      preset: 'ts-jest',
      testMatch: ['<rootDir>/tests/**/*-func.ts'],
    },
    {
      displayName: 'test-browser',
      preset: 'ts-jest',
      testMatch: ['<rootDir>/tests/**/*.browser.ts'],
    },
  ],
};
