module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src", "<rootDir>/test"],
  testMatch: ["**/__tests__/**/*.spec.ts", "**/tests/**/*.spec.ts"],
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: {
          types: ["jest", "node"],
        },
      },
    ],
    "^.+\\.mjs$": [
      "ts-jest",
      {
        tsconfig: {
          types: ["jest", "node"],
        },
      },
    ],
  },
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/main.ts",
    "!src/**/*.module.ts",
  ],
  moduleNameMapper: {
    "^@/test/(.*)$": "<rootDir>/test/$1",
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node", "mjs"],
  setupFilesAfterEnv: ["<rootDir>/test/setup.ts"],
  transformIgnorePatterns: ["node_modules/"],
};
