import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import importX from 'eslint-plugin-import-x';

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked.map((config) => ({
    ...config,
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      ...config.languageOptions,
      parserOptions: {
        ...config.languageOptions?.parserOptions,
        project: ['./tsconfig.json', './**/tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'import-x': importX,
    },
    rules: {
      'import-x/first': 'error',
      'import-x/no-duplicates': 'error',
      'import-x/no-mutable-exports': 'error',
      'import-x/no-useless-path-segments': 'warn',
      'import-x/order': 'warn',
      'import-x/no-restricted-paths': [
        'error',
        {
          zones: [
            {
              target: './backend',
              from: './client',
              message: 'Backend code cannot import from client. Use HTTP/GraphQL endpoints instead.',
            },
            {
              target: './client',
              from: './backend',
              message: 'Client code cannot import from backend. Use HTTP/GraphQL endpoints instead.',
            },
          ],
        },
      ],
    },
  })),
];
