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
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
  ],
  parserOptions: {
    project: './tsconfig.eslint.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  rules: {
    'no-console': 0,
    '@typescript-eslint/semi': 0,
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/no-unused-vars': ['warn'],
    'consistent-return': 0,
    '@typescript-eslint/no-use-before-define': 0,
    'object-curly-newline': 0,
    'operator-linebreak': 0,
    'jsx-a11y/click-events-have-key-events': 0,
    '@typescript-eslint/no-non-null-assertion': 0,
    // 'no-param-reassign': ['error', { props: true, ignorePropertyModificationsFor: ['state', 'action'] }],
    'react/function-component-definition': [2, { namedComponents: 'arrow-function' }],
    'linebreak-style': ['error', process.env.NODE_ENV === 'prod' ? 'unix' : 'windows'],
    '@typescript-eslint/indent': 0,
    'import/no-unresolved': 0,
    '@typescript-eslint/no-var-requires': 0,
    'prefer-regex-literals': 0,
    'no-else-return': 0,
    'no-lonely-if': 0,
    'implicit-arrow-linebreak': 0,
    '@typescript-eslint/comma-dangle': 0,
    'jsx-a11y/no-static-element-interactions': 0,
    'jsx-a11y/control-has-associated-label': 0,
    'react/destructuring-assignment': 0,
    'react/require-default-props': 0,
    'no-param-reassign': 0,
    'arrow-body-style': 0,
    'import/prefer-default-export': 0,
    '@typescript-eslint/no-shadow': 0,
    'no-confusing-arrow': 0,
    'react/no-danger': 0,
    'no-unsafe-optional-chaining': 0,
    'react/jsx-no-useless-fragment': 0,
    '@typescript-eslint/no-non-null-asserted-optional-chain': 0,
    'no-underscore-dangle': 0,
    'no-restricted-syntax': 0,
    '@typescript-eslint/ban-ts-comment': 0,
    'no-unexpected-multiline': 0,
    'react/jsx-props-no-spreading': 0,
    'func-names': 0,
    'react/prop-types': 0,
    'react/sort-comp': 0,
    'react/jsx-one-expression-per-line': 0,
    'function-paren-newline': 0,
    'jsx-a11y/label-has-associated-control': 0,
    'react/jsx-curly-newline': 0,
    '@typescript-eslint/no-extra-semi': 0,
    'jsx-a11y/no-noninteractive-element-interactions': 0,
    'jsx-a11y/anchor-has-content': 0,
    'semi-style': 0,
    'no-prototype-builtins': 0,
    'react/no-unused-class-component-methods': 0,
    'max-len': [
      'error',
      {
        code: 120,
        ignorePattern: '^import\\W.*',
      },
    ],
  },
}
