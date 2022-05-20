module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'react-app',
    'airbnb',
    'airbnb-typescript',
  ],
  parserOptions: {
    project: './tsconfig.eslint.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  rules: {
    '@typescript-eslint/semi': ['off'],
    '@typescript-eslint/no-explicit-any': ['off'],
    '@typescript-eslint/no-unused-vars': ['warn'],
    'consistent-return': ['off'],
    '@typescript-eslint/no-use-before-define': ['off'],
    'object-curly-newline': ['off'],
    'operator-linebreak': ['off'],
    'jsx-a11y/click-events-have-key-events': ['off'],
    '@typescript-eslint/no-non-null-assertion': ['off'],
    'no-param-reassign': ['error', { props: true, ignorePropertyModificationsFor: ['state', 'action'] }],
    'max-len': [
      'error',
      {
        code: 120,
      },
    ],
  },
}
