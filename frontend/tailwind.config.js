/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,css,scss}",
  ],
  theme: {
    extend: {
      colors: {
        wine: '#64102f',
        'wine-dark': '#3f0820',
        green: '#4e7d3f',
        'green-dark': '#3a5e2f',
        'green-soft': '#e8f0df',
        cream: '#f7f4ea',
        text: '#3f4a57',
        line: '#ddd9cd',
      },
      fontFamily: {
        serif: ['Georgia', '"Times New Roman"', 'serif'],
        sans: ['Inter', 'Arial', 'Helvetica', 'sans-serif'],
        script: ['Caveat', 'Kalam', 'cursive'],
      },
    },
  },
  plugins: [],
}
