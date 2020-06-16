module.exports = {
  clearMocks: true,
  moduleFileExtensions: [
    'js',
    'ts',
    'tsx',
  ],
  testEnvironment: 'jest-environment-jsdom',
  testMatch: [
    '**/*.test.ts?(x)',
  ],
  transform: {
    '.(ts|tsx)': 'ts-jest',
  },
  preset: 'ts-jest'
}
