module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint', 'react'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
  ],
  settings: { react: { version: 'detect' } },
  env: {
    node: true,
    browser: true,
    es6: true,
  },
  rules: {
    // allow console for now; tighten later
    'no-console': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
};
