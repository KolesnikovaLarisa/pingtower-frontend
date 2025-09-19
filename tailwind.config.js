/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        white: '#FFFFFF',
        milky: '#F5F5F5',
        lightGray: '#A9A9A9',
        midGray: '#808080',
        black: '#000000',
        navyDark: '#253745',
        deepNavy: '#11212D',
        darkGreen: '#2D5016',
        darkOrange: '#B8860B',
        darkBurgundy: '#8B0000',
      },
      backgroundImage: {
        'silverGrad': 'linear-gradient(to right, #C0C0C0, #A9A9A9)',
        'steelGrad': 'linear-gradient(to bottom, #43464B, #2C2F33)',
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'montserrat': ['Montserrat', 'sans-serif'],
      },
      animation: {
        'fadeIn': 'fadeIn 0.3s ease-in-out',
        'pulse': 'pulse 0.5s ease-in-out',
        'scale': 'scale 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scale: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.05)' },
        },
      },
      boxShadow: {
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
}
