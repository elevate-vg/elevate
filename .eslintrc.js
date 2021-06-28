module.exports = {
   root: true, // Make sure eslint picks up the config at the root of the directory
   parserOptions: {
      ecmaVersion: 2020, // Use the latest ecmascript standard
      sourceType: 'module', // Allows using import/export statements
      ecmaFeatures: {
         jsx: true, // Enable JSX since we're using React
      },
   },
   parser: '@typescript-eslint/parser',
   settings: {
      react: {
         version: 'detect', // Automatically detect the react version
      },
   },
   env: {
      browser: true, // Enables browser globals like window and document
      amd: true, // Enables require() and define() as global variables as per the amd spec.
      node: true, // Enables Node.js global variables and Node.js scoping.
   },
   extends: [
      'eslint:recommended',
      'plugin:react/recommended',
      'plugin:jsx-a11y/recommended',
      'plugin:@typescript-eslint/eslint-recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:prettier/recommended', // Make this the last item
   ],
   rules: {
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'jsx-a11y/anchor-is-valid': [
         'error',
         {
            components: ['Link'],
            specialLink: ['hrefLeft', 'hrefRight'],
            aspects: ['invalidHref', 'preferButton'],
         },
      ],
      'prettier/prettier': ['error', {}, { usePrettierrc: true }],
   },
   plugins: ['@typescript-eslint'],
   //    overrides: [
   //       {
   //          plugins: ['jest'],
   //          files: ['src/**/*.test.js', 'src/**/*.test.jsx', 'src/**/*.test.ts', 'src/**/*.test.tsx'],
   //          extends: ['plugin:jest/recommended'],
   //          // TODO: jest globals isn't working
   //          env: { 'jest/globals': true },
   //       },
   //       {
   //          plugins: ['cypress'],
   //          files: [
   //             'cypress/**/*.spec.js',
   //             'cypress/**/*.spec.jsx',
   //             'cypress/**/*.spec.ts',
   //             'cypress/**/*.spec.tsx',
   //          ],
   //          extends: ['plugin:cypress/recommended'],
   //          env: {
   //             'cypress/globals': true, // Enable Cypress globals
   //          },
   //       },
   //    ],
}
