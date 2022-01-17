module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,css}',
    './components/**/*.{js,ts,jsx,tsx,css}'
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {}
  },
  variants: {
    extend: {
      transitionProperty: ['hover', 'focus']
    }
  },
  plugins: []
}
