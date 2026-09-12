import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      // Fără acest set, ESLint nu vede folosirea unei componente în JSX și o
      // raportează ca variabilă nefolosită. Configurația anterioară ocolea
      // problema ignorând orice identificator cu majusculă, ceea ce ascundea
      // și importurile chiar nefolosite.
      react.configs.flat.recommended,
      react.configs.flat['jsx-runtime'],
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        sourceType: 'module'
      }
    },
    settings: { react: { version: 'detect' } },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      // Proiectul e în JavaScript, fără verificarea tipurilor de proprietăți.
      'react/prop-types': 'off'
    }
  }
]);
