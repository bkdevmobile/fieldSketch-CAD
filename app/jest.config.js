module.exports = {
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  preset: 'ts-jest', testEnvironment: 'node', testMatch: ['<rootDir>/tests/**/*.test.ts'],
  transform: { '^.+\\.tsx?$': ['ts-jest', { tsconfig: { target: 'ES2022', module: 'commonjs', esModuleInterop: true, strict: true, types: ['jest', 'node'], ignoreDeprecations: '6.0' }, diagnostics: true }] },
};
