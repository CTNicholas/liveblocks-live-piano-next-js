const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx,css}',
    './pages/index.tsx',
    './pages/piano.tsx'
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        karla: 'Karla, Inter, sans-serif'
      },
      colors: {
        gray: {
          ...colors.zinc,
          50: colors.gray[50],
          100: colors.gray[100],
          200: colors.gray[200],
          850: '#202022'
        },
      }
    }
  },
  variants: {
    extend: {
      transitionProperty: ['hover', 'focus']
    }
  },
  plugins: []
}
