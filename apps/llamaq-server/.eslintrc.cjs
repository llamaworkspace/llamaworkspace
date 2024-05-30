/** @type {import("eslint").Linter.Config} */
const config = {
  root: true,
  extends: ['@repo/eslint-config/server-only.js'],
  parserOptions: {
    project: './tsconfig.json',
  },
}

module.exports = config
