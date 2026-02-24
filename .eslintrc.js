/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  env: {
    node: true,
    jest: true,
    es2021: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.json', './tsconfig.build.json'],
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    // Desabilita regras de formatação do ESLint em favor do Prettier
    'plugin:prettier/recommended',
  ],
  ignorePatterns: [
    'dist',
    'node_modules',
    'src/generated',
    // Arquivos JS gerados
    '*.js',
  ],
  rules: {
    // Aqui você pode ir refinando com o tempo
    'prettier/prettier': ['error'],
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
};
