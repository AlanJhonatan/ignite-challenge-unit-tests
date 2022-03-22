/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coverageProvider: 'v8',
  clearMocks: true,
  bail: true,
  testMatch: [
    '**/*.spec.ts',
  ],
};
