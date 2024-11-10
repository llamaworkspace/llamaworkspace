/** @type {import("eslint").Linter.Config} */
const config = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: true,
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:@typescript-eslint/stylistic-type-checked',
    'next',
    'prettier',
  ],
  rules: {
    // These opinionated rules are enabled in stylistic-type-checked above.
    // Feel free to reconfigure them to your own preference.
    'react-hooks/exhaustive-deps': 'error', // or 'error' to enforce it as an error
    '@typescript-eslint/array-type': 'off',
    '@typescript-eslint/consistent-type-definitions': 'off',
    '@typescript-eslint/consistent-type-imports': [
      'warn',
      {
        prefer: 'type-imports',
        fixStyle: 'inline-type-imports',
      },
    ],
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-restricted-imports': [
      'warn',
      {
        paths: [
          {
            name: 'next/router',
            importNames: ['useRouter'],
            message:
              "Use `import { useNavigation } from '@/lib/frontend/useNavigation'` instead.",
          },
        ],
      },
    ],
    '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
  },
}

module.exports = config
