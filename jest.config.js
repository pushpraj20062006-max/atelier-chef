module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['**/__tests__/**/*.test.tsx'],
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
};
