import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  verbose: true,
  silent: false,
  roots: ['<rootDir>/__tests__', '<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.spec.+(ts|tsx|js)', '**/?(*.)+(spec|test).+(ts|tsx|js)'],
  globals: {
    config: './tsconfig.spec.json',
  },
  testEnvironment: 'node',
  transformIgnorePatterns: ['/dev-utils/*.js'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '~internal/(.*)\\.js': '<rootDir>/src/_internal/$1',
    '~types/(.*)\\.js': '<rootDir>/src/_internal/types/$1',
    '~utils/(.*)\\.js': '<rootDir>/src/_internal/utils/$1',
  },
  transform: {
    '^.+\\.(js|jsx)$': ['babel-jest', { configFile: './babel.config.cjs' }],
    // '^.+\\.m?[t]sx?$': [
    //   'ts-jest',
    //   {
    //     // isolatedModules: true, // TS5110: Option 'module' must be set to 'NodeNext' when option 'moduleResolution' is set to 'NodeNext'.
    //     useESM: true,
    //     tsconfig: 'tsconfig.spec.json',
    //   },
    // ],
  },
}

export default config
