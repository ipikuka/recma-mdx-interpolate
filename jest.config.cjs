/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest/presets/default-esm-legacy",
  testEnvironment: "node",
  moduleNameMapper: { "^(\\.\\.?\\/.+)\\.js$": "$1" },
  collectCoverageFrom: ["src/index.ts"],
  coverageReporters: ["json", "lcov", "text"],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
};
