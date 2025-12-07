const nextJest = require('next/jest')
const path = require('path')

// Config is in Testing folder, but Next.js app is in parent directory
const parentDir = path.resolve(__dirname, '..')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: parentDir,
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: [path.resolve(__dirname, 'jest.setup.js')],
  testEnvironment: 'jest-environment-jsdom',
  rootDir: __dirname,
  moduleNameMapper: {
    '^@/(.*)$': path.join(parentDir, '$1'),
  },
  collectCoverageFrom: [
    '../app/**/*.{js,jsx,ts,tsx}',
    '../components/**/*.{js,jsx,ts,tsx}',
    '../lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!**/*.config.{js,ts}',
    '!**/messages/**',
  ],
  testMatch: [
    '**/__tests__/**/*.test.{js,jsx,ts,tsx}',
    '!**/__tests__/utils/**',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/e2e/',
    '/Testing/e2e/',
    '.*\\.spec\\.ts$',
    '.*\\.spec\\.tsx$',
  ],
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)

