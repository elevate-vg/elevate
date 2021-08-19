module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  parser: '@typescript-eslint/parser',
  settings: {
    react: {
      version: 'detect',
    },
  },
  env: {
    browser: true,
    amd: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended', // Make this the last item
  ],
  rules: {
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    //   '@typescript-eslint/explicit-module-boundary-types': 'off',
    //   'jsx-a11y/anchor-is-valid': [
    //      'error',
    //      {
    //         components: ['Link'],
    //         specialLink: ['hrefLeft', 'hrefRight'],
    //         aspects: ['invalidHref', 'preferButton'],
    //      },
    //   ],
    'prettier/prettier': ['error', {}, { usePrettierrc: true }],
  },
  plugins: ['@typescript-eslint' /*'jest'*/],
};
