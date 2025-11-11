import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';

export default defineConfig([
  globalIgnores(['dist', 'tailwind.config.js', 'vite.config.ts']),
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: tsParser, // <- add parser
      parserOptions: {
        ecmaVersion: 2025, // modern JS
        sourceType: 'module',
        jsx: true, // enable JSX parsing for TSX
      },
      globals: globals.browser,
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      react: reactPlugin,
    },
    rules: {
      'react/react-in-jsx-scope': 'off', // React 17+ JSX transform
      '@typescript-eslint/explicit-function-return-type': 'off',
      'no-undef': 'off', // for Node config files
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          args: 'none',
          ignoreRestSiblings: true,
          caughtErrors: 'none',
        },
      ],
      'no-use-before-define': ['warn', { functions: true, classes: true, variables: true }],
    },
    extends: [js.configs.recommended],
  },
]);
