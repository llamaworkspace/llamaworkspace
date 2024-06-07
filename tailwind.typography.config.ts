/* eslint-disable*/

const colors = require('tailwindcss/colors')

const round = (num) =>
  num
    .toFixed(7)
    .replace(/(\.[0-9]+?)0+$/, '$1')
    .replace(/\.0$/, '')
const rem = (px) => `${round(px / 16)}rem`
const em = (px, base) => `${round(px / base)}em`
const hexToRgb = (hex) => {
  hex = hex.replace('#', '')
  hex = hex.length === 3 ? hex.replace(/./g, '$&$&') : hex
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  return `${r} ${g} ${b}`
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      typography: () => ({
        DEFAULT: {
          css: {
            // fontSize: '14rem',
            pre: {
              // fontSize: em(14, 16),
              // lineHeight: round(24 / 14),
              // marginTop: em(24, 14),
              marginBottom: 0,
              borderRadius: 0,
              paddingTop: 0,
              paddingInlineEnd: 0,
              paddingBottom: 0,
              paddingInlineStart: 0,
              // color: 'var(--tw-prose-pre-code)',
              backgroundColor: 'initial',
              // overflowX: 'auto',
              fontWeight: 'initial',
            },
            ol: {
              marginTop: 0,
              marginBottom: 0,
              paddingInlineStart: em(18, 16),
            },
            ul: {
              marginTop: 24,
              marginBottom: 24,
              paddingInlineStart: em(18, 16),
            },
            li: {
              marginTop: 0,
              marginBottom: 0,
            },
            'ol > li': {
              paddingInlineStart: em(6, 16),
            },
            'ul > li': {
              paddingInlineStart: em(6, 16),
            },
            '> ul > li p': {
              marginTop: em(12, 16),
              marginBottom: em(12, 16),
            },
            '> ul > li > p:first-child': {
              marginTop: 24,
            },
            '> ul > li > p:last-child': {
              marginBottom: 24,
            },
            '> ol > li > p:first-child': {
              marginTop: 24,
            },
            '> ol > li > p:last-child': {
              marginBottom: 24,
            },
            'ul ul, ul ol, ol ul, ol ol': {
              marginTop: em(12, 16),
              marginBottom: em(12, 16),
            },
            dl: {
              marginTop: 24,
              marginBottom: 24,
            },
            dt: {
              marginTop: 24,
            },
            dd: {
              marginTop: em(8, 16),
              paddingInlineStart: em(18, 16),
            },
          },
        },
        zinc: {
          css: {
            '--tw-prose-counters': colors.zinc['950'],
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
