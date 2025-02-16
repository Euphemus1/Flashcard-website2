module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#429edd",
          light: "#6ab0e3",
          dark: "#2d6d9a"
        },
        secondary: {
          DEFAULT: "#34495e",
          light: "#4a657a",
          dark: "#1d2a36"
        },
        accent: "#e74c3c" // Added for error states/CTAs
      },
      spacing: {
        '128': '32rem' // For larger spacing needs
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'] // Modern font stack
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'), // For better form styling
    require('@tailwindcss/typography') // For prose content
  ],
};