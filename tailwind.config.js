/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./*.html'],
  theme: {
    extend: {
      colors: {
        bg:      '#F5EDE2',
        dark:    '#0E0E0E',
        primary: '#00C46A',
        red:     '#E63946',
        text:    '#1A1A1A',
        muted:   '#777777',
        border:  '#D8CEC2',
      },
      fontFamily: {
        poster: ['Anton', 'Impact', 'sans-serif'],
        body:   ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
