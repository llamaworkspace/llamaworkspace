/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').options} */
const config = {
  tabWidth: 2,
  semi: false,
  singleQuote: true,
  plugins: [
    'prettier-plugin-organize-imports',
    // The order of the plugins matters: Tailwind must be the latest.
    // See https://github.com/tailwindlabs/prettier-plugin-tailwindcss/issues/31#issuecomment-1312202554
    'prettier-plugin-tailwindcss',
  ],
}

export default config
