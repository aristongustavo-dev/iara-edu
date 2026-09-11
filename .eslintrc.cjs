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
    'react/no-unknown-property': ['error', {
      ignore: [
        'args', 'attach', 'position', 'rotation', 'scale', 'quaternion',
        'castShadow', 'receiveShadow', 'frustumCulled', 'renderOrder', 'visible',
        'material', 'geometry', 'map', 'side', 'transparent', 'depthWrite', 'emissive', 'emissiveIntensity', 'intensity',
        'shadow-camera-bottom', 'shadow-camera-far', 'shadow-camera-left', 'shadow-camera-right', 'shadow-camera-top',
        'shadow-mapSize-height', 'shadow-mapSize-width',
      ],
    }],
  },
};