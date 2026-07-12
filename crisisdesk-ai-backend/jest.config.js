module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  // Stub out firebase-admin (uses ESM internally — incompatible with ts-jest CJS transform)
  moduleNameMapper: {
    '^firebase-admin/app$': '<rootDir>/__mocks__/firebase-admin/app.js',
    '^firebase-admin/auth$': '<rootDir>/__mocks__/firebase-admin/auth.js',
    '^firebase-admin$': '<rootDir>/__mocks__/firebase-admin/index.js',
  },
};
