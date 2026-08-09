/**
 * Jest configuration for the backend monolith.
 *
 * The repository ships typescript + jest but no JS transform, so tests could
 * never run. This wire-up uses a tiny CustomTransformer built on
 * `typescript.transpileModule` (already a dependency) — no ts-jest/esbuild
 * install required — and maps the workspace TS packages to their sources.
 */
module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/tests/**/*.test.ts"],
  transform: {
    "^.+\\.tsx?$": "<rootDir>/jest.transform.cjs",
  },
  transformIgnorePatterns: ["/node_modules/"],
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@smartcity/common$": "<rootDir>/../packages/common/src/index.ts",
    "^@smartcity/database$": "<rootDir>/../packages/database/src/index.ts",
    "^@smartcity/shared$": "<rootDir>/../packages/shared/src/index.ts",
  },
};