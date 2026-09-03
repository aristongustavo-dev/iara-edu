module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', 'release', 'android', 'electron', 'node_modules', '.eslintrc.cjs', 'src/api/db.js'],
  parserOptions: { ecmaVersion: 'latest', ecmaFeatures: { jsx: true }, sourceType: 'module' },
  settings: { react: { version: '18.3' } },
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    'react/prop-types': 'off',
    'react/no-unescaped-entities': 'off',
    'no-mixed-spaces-and-tabs': 'off',
    'no-unused-vars': ['warn', { varsIgnorePattern: '^React$' }],
    'react-hooks/exhaustive-deps': 'warn',
  },
};