/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Atom One Dark theme colors
        dark: {
          bg: '#282c34',
          'bg-lighter': '#2c313c',
          'bg-light': '#3e4451',
          border: '#181a1f',
          text: '#abb2bf',
          'text-light': '#e6e6e6',
          muted: '#5c6370',
          accent: {
            red: '#e06c75',
            orange: '#d19a66',
            yellow: '#e5c07b',
            green: '#98c379',
            cyan: '#56b6c2',
            blue: '#61afef',
            purple: '#c678dd',
            pink: '#be5046',
          }
        },
        light: {
          bg: '#fafafa',
          'bg-darker': '#f0f0f0',
          border: '#e5e7eb',
          text: '#24292f',
          'text-muted': '#57606a',
        }
      },
    },
  },
  plugins: [],
}
