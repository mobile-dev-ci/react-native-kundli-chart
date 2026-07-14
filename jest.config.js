/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        // Override the library's Bundler/ESNext tsconfig so Jest (CommonJS) can run the tests.
        tsconfig: {
          module: 'CommonJS',
          moduleResolution: 'Node',
          esModuleInterop: true,
          verbatimModuleSyntax: false,
          isolatedModules: false,
        },
      },
    ],
  },
  collectCoverageFrom: ['src/utils/**/*.ts', 'src/constants/**/*.ts'],
};
