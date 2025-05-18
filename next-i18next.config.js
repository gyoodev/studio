
const path = require('path')

module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fr', 'bg', 'tr', 'de'],
  },
  localePath: path.resolve('./public/locales'),
  react: { useSuspense: false }, // Added for compatibility
  reloadOnPrerender: process.env.NODE_ENV === 'development', // Optional: for easier dev
}
