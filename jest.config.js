module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.spec.ts", "**/*.spec.ts"],
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: {
          types: ["jest", "node"],
        },
        diagnostics: false      },
    ],
    "^.+\\.mjs$": [
      "ts-jest",
      {
        tsconfig: {
          types: ["jest", "node"],
        },
        diagnostics: false,
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
  transformIgnorePatterns: ["node_modules/(?!(safe-stable-stringify|logform)/)"],
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'lcov', 
    'cobertura',
    'html'
  ],
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: 'coverage',
      outputName: 'junit.xml'
    }]
  ]
};