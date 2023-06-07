/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  projects: [
    {
      displayName: 'test-node',
      testEnvironment: 'node',
      preset: 'ts-jest',
      testMatch: ['<rootDir>/tests/**/*.test.ts'],
    
    }, 
    
  ]
  
};
