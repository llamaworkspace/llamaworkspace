/** @type {import("eslint").Linter.Config} */
const config = {
  root: true,
  extends: ['@repo/eslint-config/next.js'],
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
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
  },
}

module.exports = config
